let express = require("express");
let socket = require("socket.io");
let dayjs = require("dayjs");
let firebase = require("firebase/app");
require("firebase/firestore");

let firebaseConfig = {
  apiKey: "AIzaSyDp4SBYbKRG1nFGUK7O6RIfd9nFa6ekSAI",
  authDomain: "a-connected-garden.firebaseapp.com",
  databaseURL: "https://a-connected-garden-default-rtdb.firebaseio.com",
  projectId: "a-connected-garden",
  storageBucket: "a-connected-garden.appspot.com",
  messagingSenderId: "368037141675",
  appId: "1:368037141675:web:b4b7262b9ff132b3d0ebee",
  measurementId: "G-BF41LKZJBB"
};


let app = express();

let port = process.env.PORT || 3000;

let server = app.listen(port);
let io = socket(server);

let allFlowers = [];

let maxNoWaterDays = 10;

app.get("/mappa.js", function(req, res) {
  res.sendFile(__dirname + "/node_modules/mappa-mundi/dist/mappa.js");
});


// Following lines can be deleted
// app.get("/config.js", function(req, res) {
//     res.sendFile(__dirname + "/config.js");
// });

// set public directory
app.use(express.static("public"));
console.log("Server is running!")

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// get the flowers once, at the start of the server
getFromDatabase();

// listen for incoming client events
io.on("connection", newConnection);

function newConnection(socket) {
  console.log("Client connected at: " + getDate().time);



  socket.on("firstConnection", function() {
    io.emit("updateFlowers", allFlowers);
  });

  socket.on("createFlower", function(data) {
    writeToDatabase(data);
    setTimeout(function() {
      getFromDatabase();
    }, 1000)
  });

  socket.on("waterFlower", function(data) {
    console.log("Water flower with ID: " + data.id);
    let id = data.id;
    let water = {
      user: data.user,
      date: getDate()
    };

    firebase
      .firestore()
      .collection("flowers")
      .doc(id)
      .update({
        watered: firebase.firestore.FieldValue.arrayUnion(water)
      });

      setTimeout(function() {
        getFromDatabase();
      }, 1000)

  });

  socket.on("disconnect", function() {
    console.log("Client disconnected");
  });
}

function writeToDatabase(data) {
  console.log("New flower added to database");
  let flower_coordinates = {
    lat: data.flower_coordinates.lat,
    lng: data.flower_coordinates.lng
  };
  let flower_type = data.flower_type;
  let flower_name = data.flower_name;
  let user_name = data.user_name;
  let user_location = data.user_location;
  let date_added = getDate();
  let water = {
    user: data.user_name,
    date: getDate()
  };

  firebase
    .firestore()
    .collection("flowers")
    .doc()
    .set({
      flower_coordinates: flower_coordinates,
      flower_type: flower_type,
      flower_name: flower_name,
      user_name: user_name,
      user_location: user_location,
      date_added: date_added,
    })
}

function getFromDatabase() {
  console.log("Receive updated list of flowers!");
  firebase
    .firestore()
    .collection("flowers")
    .get()
    .then(function(querySnapshot) {
      let data = [];
      querySnapshot.forEach(function(doc) {
        // delete(doc.id);
        // compares the date when the flower was added with the current day
        let date_added = doc.data().date_added.date;
        let age = getDateDifference(date_added);

        let noWaterDays = 0;
        let wateredList = doc.data().watered;
        // check if flower has ever been watered
        // then take the last date and compare it to today
        if (Array.isArray(wateredList)) {
          let lastWatered = wateredList[wateredList.length - 1];
          noWaterDays = getDateDifference(lastWatered.date.date);
        }

        if (noWaterDays >= maxNoWaterDays) {
          // delete if flower is older than the maximum days without
          // water or add it to the flower array to be displayed
          deleteInDatabase(doc.id);
        } else {
          let docData = {
            flower_id: doc.id,
            flower_data: doc.data(),
            flower_age: age,
            no_water: noWaterDays
          }
          data.push(docData);
        }
      });
      allFlowers = data;
      // console.log(data);
      io.emit("updateFlowers", allFlowers);
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });
}

function deleteInDatabase(data){
  console.log("Delete flower with ID: " + data);
  let id = data
  firebase
    .firestore()
    .collection("flowers")
    .doc(id)
    .delete();
}


function getDate() {
  let now = dayjs();
  // substract days to test if the difference works
  let d2 = now.subtract('2', 'day');
  let day = {
    date: d2.format("MMM DD YY"),
    time: now.format("HH:mm:ss")
  }
  console.log(day);
  return day
}

function getDateDifference(inputDate) {
  let difference = dayjs().diff(inputDate, "day");
  return difference
}
