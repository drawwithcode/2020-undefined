let canvas;
let myMap;
let userName = "";
let userLocation = null;
let flowerName = "";
let flowerLocation = null;
let currentDate = null;
let userId;
let data = [];

// let socket = io();
const key =
  "pk.eyJ1IjoidG9sYnJpIiwiYSI6ImNranBxd2tzdjM5amYycW83aGFoM3UzeXkifQ.U6_rp72ab8gMo6VANxpBWQ";
const bounds = [
  [9.08081, 45.41012], // Southwest coordinates
  [9.29474, 45.53344], // Northeast coordinates
];
let mappa = new Mappa("MapboxGL", key);

const mapOptions = {
  lat: 45.4642, //Latitude of Milan
  lng: 9.19, //Longitude of Milan
  zoom: 10,
  style: "mapbox://styles/mapbox/light-v9",
  pitch: 50,
  maxBounds: bounds,
};

function preload() {
  // put preload code here
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
  myMap.onChange(drawFlowers);
  getDate();
  getData();
}

// socket.on("connect", newConnection);

// function newConnection() {
//   console.log("Your ID:", socket.id);
// }

// Write data into db
function writeData() {
  userId = Math.random().toString(36).substr(2, 9);
  firebase
    .firestore()
    .collection("users")
    .doc(userId)
    .set({
      name: userName,
      date: currentDate,
      location: userLocation,
      flower: [
        {
          f_name: flowerName,
          f_location: {
            lat: 45.4642,
            lng: 9.19,
          },
        },
      ],
    });
}

// Read data from db
function getData() {
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

function drawFlowers() {
  clear();
  // Get the coordinates for every flower object for all users
  for (let i = 0; i < data.length; i++) {
    const location = data[i].flower[0];
    const latitude = Number(location ? location.f_location.lat : null);
    const longitude = Number(location ? location.f_location.lng : null);

    // Only draw the objects that are within the canvas
    // if (myMap.map.getBounds().contains({
    //     lat: latitude,
    //     lng: longitude
    //   })) {

    const pos = myMap.latLngToPixel(latitude, longitude);
    ellipse(pos.x, pos.y, 20);
    // }
  }
}

function mouseClicked() {
  const position = myMap.pixelToLatLng(mouseX, mouseY);
  console.log(
    "Latitude: " + position.lat + "\n" + "Longitutde: " + position.lng
  );
  openForm();
}

function openForm() {
  // open a popup with a form
}

function saveFormData() {
  let name = document.getElementById("name").value;
  let location = document.getElementById("email").value;
  (userName = name), (userLocation = location);
}

function onSubmit() {
  writeData();
}

function getDate() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  currentDate = mm + "/" + dd + "/" + yyyy;
}
