
let canvas;
let myMap;

// let socket = io();
const key = "pk.eyJ1IjoidG9sYnJpIiwiYSI6ImNranBxd2tzdjM5amYycW83aGFoM3UzeXkifQ.U6_rp72ab8gMo6VANxpBWQ";
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

// This is for testing purpose.
// The actual data will come from the database.
const flowers = [
  {
    name: "flower_1",
    lat: 45.4642,
    lng: 9.19,
  },
  {
    name: "flower_2",
    lat: 45.4645,
    lng: 9.22,
  },
];

function preload() {
  // put preload code here
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
  myMap.onChange(drawFlowers);

  // Write data into db
  function writeData() {
    firebase.database()
      .ref("users/" + userId)
      .set({
        name: "",
        flower_name: "",
        flower_position: null,
        message: "",
      });
    getData();
  }

  // Fetch data from db
  function getData() {
    firebase.database()
      .ref("users")
      .once("value", function (snapshot) {
        const data = snapshot.val();
      });
  }
}

// socket.on("connect", newConnection);

// function newConnection() {
//   console.log("Your ID:", socket.id);
// }

function drawFlowers() {
  clear();
  // Get the coordinates for every object in the flowers-array
  for (let i = 0; i < flowers.length; i++) {
    const latitude = Number(flowers[i].lat);
    const longitude = Number(flowers[i].lng);
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
}
