let express = require("express");
let socket = require("socket.io");
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
  console.log("Client connected at: " + getDate());



  socket.on("firstConnection", function() {
    io.emit("updateFlowers", allFlowers);
  });

  socket.on("createFlower", function(data) {
    writeToDatabase(data);
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
  let flower_id = Math.random().toString(36).substr(2, 9);
  let flower_coordinates = {
    lat: data.flower_coordinates.lat,
    lng: data.flower_coordinates.lng
  };
  let flower_type = data.flower_type;
  let flower_name = data.flower_name;
  let user_name = data.user_name;
  let user_location = data.user_location;
  let date_added = getDate();

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
      date_added: date_added
    })
}

function getFromDatabase() {
  firebase
    .firestore()
    .collection("flowers")
    .get()
    .then(function(querySnapshot) {
      let data = [];
      querySnapshot.forEach(function(doc) {
        let docData = {
          flower_id: doc.id,
          flower_data: doc.data()
        }
        data.push(docData);
      });
      allFlowers = data;
      io.emit("updateFlowers", allFlowers);
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });
}


function getDate() {
  let today = new Date();
  let minute = String(today.getMinutes()).padStart(2, "0");
  let hour = String(today.getHours()).padStart(2, "0");
  let day = String(today.getDate()).padStart(2, "0");
  let month = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let year = today.getFullYear();
  let currentDate = day + "/" + month + "/" + year + " " + hour + ":" + minute;
  return currentDate;
}
