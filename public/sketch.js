let canvas;
let myMap;
let userName = "";
let userLocation = null;
let flowerName = "";
let flowerLocation = null;
// let currentDate = null; // I changed the method to return it's value, this could be deleted
let userId;
let data = [];
let pos;
let latitude;
let longitude;

let socket = io();
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
  // getDate(); // I changed the method to return it's value, this could be deleted
  getData();
}

socket.on("connect", newConnection);

function newConnection() {
  console.log("Your ID:", socket.id);
}

// Write data into db
function writeData() {

}

// Read data from db
function getData() {

}

function drawFlowers() {
  clear();
  // Get the coordinates for every flower object for all users
  for (let i = 0; i < data.length; i++) {
    const location = data[i].flower[0];
    latitude = Number(location ? location.f_location.lat : null);
    longitude = Number(location ? location.f_location.lng : null);
    pos = myMap.latLngToPixel(latitude, longitude);

    // Only draw the objects that are within the canvas
    // if (myMap.map.getBounds().contains({
    //     lat: latitude,
    //     lng: longitude
    //   })) {

    //Draw the flower
    // ellipse(pos.x, pos.y, 20);


  }
}

function mouseClicked() {
  const position = myMap.pixelToLatLng(mouseX, mouseY);
  let d = dist(mouseX, mouseY, pos.x, pos.y);
  if (d < 100) {
    openFlowerDetails();
  } else {
    removeFlowerDetails();
  }
  console.log(
    "Latitude: " + position.lat + "\n" + "Longitutde: " + position.lng
  );
}

function openFlowerDetails() {
  // open a popup modal
  let popup = document.getElementById("popup_1");
  popup.classList.remove("hidden");
}

function removeFlowerDetails() {
  // close popup modal
  let popup = document.getElementById("popup_1");
  popup.classList.add("hidden");
}

function saveFormData() {
  let name = document.getElementById("name").value;
  let location = document.getElementById("email").value;
  (userName = name), (userLocation = location);
}

function onSubmit() {
  writeData();
}





createFlower();

function createFlower() {
  let flower = {
    flower_coordinates: {
      lat: 45.4642,
      lng: 9.19
    },
    flower_type: "some/path/to/be/defined.png",
    flower_name: "Flower Name",
    user_name: "Username",
    user_location: "City, Country",
  }
  console.log(flower);
  socket.emit("createFlower", flower)
}



// This code belongs somewhere, maybe
//
// let flower_id = 1
// let flower_coordinates = {
//   lat: 45.4642,
//   lng: 9.19,
// };
// let flower_type = "Picture";
// let user_name = "Username";
// let user_location = "Location";
// let date_added = getDate();
//
// data.push(new Flower(
//                       flower_id,
//                       flower_coordinates,
//                       flower_type,
//                       user_name,
//                       user_location,
//                       date_added
//                     ));
