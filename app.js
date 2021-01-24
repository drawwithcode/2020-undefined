let express = require("express");
let socket = require("socket.io");
let dayjs = require("dayjs");
var customParseFormat = require('dayjs/plugin/customParseFormat')
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

let dateOffset = 0;

let allFlowers = [];

let maxNoWaterDays = 10;

app.get("/mappa.js", function(req, res) {
  res.sendFile(__dirname + "/node_modules/mappa-mundi/dist/mappa.js");
});

// set public directory
app.use(express.static("public"));
console.log("Server is running!")

// Enable custom date format
dayjs.extend(customParseFormat);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// get the flowers once, at the start of the server
getFromDatabase();

// listen for incoming client events
io.on("connection", newConnection);

function newConnection(socket) {
  console.log("New client connected at: " + getDate().time);

  socket.on("firstConnection", function() {
    io.emit("updateFlowers", allFlowers);
  });

  socket.on("dayOffset", function(data) {
    dateOffset = data;
    console.log("Date Offset: " + dateOffset);
    getFromDatabase();
  });

  socket.on("createFlower", function(data) {
    writeToDatabase(data);
    setTimeout(function() {
      getFromDatabase();
    }, 1000)
  });

  socket.on("waterFlower", function(data) {
    console.log("Water flower with ID: " + data.id);
    // Declare the object with updated data for the database
    let id = data.id;
    let water = {
      user: data.user,
      date: getDate()
    };

    // Update the data by appending the object to the array
    firebase
      .firestore()
      .collection("flowers")
      .doc(id)
      .update({
        // Here we append the object rather than overwriting it
        watered: firebase.firestore.FieldValue.arrayUnion(water)
      });

      // after a slight delay, load the new data and emit it to the clients
      setTimeout(function() {
        getFromDatabase();
      }, 500)

  });

  socket.on("disconnect", function() {
    console.log("Client disconnected");
  });
}

// Write data into firestore
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

// Receive data from firestore
function getFromDatabase() {
  console.log("Receive updated list of flowers!");
  firebase
    .firestore()
    .collection("flowers")
    .get()
    .then(function(querySnapshot) {
      let data = [];
      querySnapshot.forEach(function(doc) {
        let deleteData = false;
        if (deleteData) {
        deleteInDatabase(doc.id);
      } else {
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
          console.log(lastWatered, noWaterDays);
        } else {
          console.log(date_added);
          noWaterDays = getDateDifference(date_added);
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

// Delete entries in firestore
function deleteInDatabase(data){
  console.log("Delete flower with ID: " + data);
  let id = data
  firebase
    .firestore()
    .collection("flowers")
    .doc(id)
    .delete();
}

// Get the current date and time
function getDate() {
  let now = dayjs();
  let day = {
    date: now.format("DD.MM.YY"),
    time: now.format("HH:mm:ss")
  }
  return day
}

// Get the difference of a given date and today
function getDateDifference(inputDate) {
  let date = dayjs(inputDate, "DD.MM.YY", true);
  let difference = dayjs().diff(date, "day");
  // add a bigger difference for testing
  difference = difference + dateOffset;
  return difference
}
