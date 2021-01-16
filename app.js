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

// exectute when a new user connects
io.on('connection', newConnection);

function newConnection(socket){
	console.log("New connection: ", socket.client.id);
}


writeToDatabase();
function writeToDatabase() {
  userId = Math.random().toString(36).substr(2, 9);
  firebase
    .firestore()
    .collection("users")
    .doc(userId)
    .set({
      name: "userName",
      date: "01/01/2021",
      location: "userLocation",
      flower: [
        {
          f_name: "flowerName",
          f_location: {
            lat: 45.4642,
            lng: 9.19,
          },
        },
      ],
    });
}

function getFromDatabase() {
  firebase
    .firestore()
    .collection("users")
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        data.push(doc.data());
      });
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
}
