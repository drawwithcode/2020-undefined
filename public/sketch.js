let canvas;
let myMap;
let allFlowers = [];
let socket = io();
let imgs = [];

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
  for (var i = 0; i < 2; i++) {
    imgs[i] = loadImage("images/flower_"+i+".png");
  }
}

function setup() {

  canvas = createCanvas(windowWidth, windowHeight);
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
  myMap.onChange(drawFlowers);
  createFlower();
  // keep emit at the end, so it executes
  // when everything else has already been loaded
  socket.emit("firstConnection");
}

function drawFlowers() {
  clear();

  for (let i = 0; i < allFlowers.length; i++) {
    const flowerData = allFlowers[i].getFlowerData();
    const coordinates = flowerData.coordinates;
    const flowerImage = flowerData.flowerType;
    if (
      typeof coordinates.lat == "number" &&
      typeof coordinates.lng == "number"
    ) {
      pos = myMap.latLngToPixel(coordinates.lat, coordinates.lng);
      // image(src, pos.x, pos.y);
      allFlowers[i].display(pos.x, pos.y);
    }
  }
}

function openFlowerDetails(data) {
  // open a popup modal
  let popup = document.getElementById("popup_1");
  popup.classList.remove("hidden");
  // The following line is for testing
  // pass the username and the flower_id
  // waterFlower("Tim", "3Mdnja11cjVQ5KxRDzFJ");
}

function removeFlowerDetails() {
  // close popup modal
  let popup = document.getElementById("popup_1");
  popup.classList.add("hidden");
}

function getFlowerDetailsOpen() {
  // this function checks if the popup is open
  let popup = document.getElementById("popup_1");
  if (popup.classList.contains("hidden")) {
    return false;
  } else {
    return true;
  }
}

function saveFormData() {
  let name = document.getElementById("name").value;
  let location = document.getElementById("email").value;
  (userName = name), (userLocation = location);
}

function createFlower() {
  // random numbers are added for testing
  let r1 = random(-10, 10) / 1000;
  let r2 = random(-10, 10) / 1000;

  let flower = {
    flower_coordinates: {
      lat: 45.4642 + r1,
      lng: 9.19 + r2,
    },
    flower_type: 0,
    flower_name: "Flower Name",
    user_name: "Username Testname",
    user_location: "City, Country",
  };

  socket.emit("createFlower", flower);
}

socket.on("updateFlowers", function (data) {
  // when server emits a new array of flowers, update local flowers
  for (let i = 0; i < data.length; i++) {

    allFlowers.push(new Flower(
      data[i].flower_id,
      data[i].flower_data.flower_coordinates,
      data[i].flower_data.flower_type,
      data[i].flower_data.flower_name,
      data[i].flower_data.user_name,
      data[i].flower_data.user_location,
      data[i].flower_data.date_added,
      data[i].flower_data.watered,
      data[i].flower_age
    ));
  }

  drawFlowers();
});

function mouseClicked() {
  const mapZoom = myMap.zoom();
  const position = myMap.pixelToLatLng(mouseX, mouseY);
  // check if cursor is over one of the flowers
  for (let i = 0; i < allFlowers.length; i++) {
    if (allFlowers[i].isClicked(position.lat, position.lng, mapZoom)) {
      let data = allFlowers[i].getFlowerData();
      openFlowerDetails(data);
      return;
    } else if (getFlowerDetailsOpen()) {
      removeFlowerDetails();
    }
  }
}

function waterFlower(user, flowerId) {
  console.log("Water flower!");
  let data = {
    user: user,
    id: flowerId,
  };
  socket.emit("waterFlower", data);
}

class Flower {
  constructor(
    flower_id,
    flower_coordinates,
    flower_type,
    flower_name,
    user_name,
    user_location,
    date_added,
    watered,
    age
  ) {
    this.id = flower_id;
    this.position = flower_coordinates;
    this.type = flower_type;
    this.flowerName = flower_name;
    this.user = user_name;
    this.location = user_location;
    this.date = date_added;
    this.watered = watered
    this.age = age
  }

  display(posX, posY) {
    let flower_type = this.type;
    image(imgs[flower_type], posX, posY, 30, 30);
  }

  // the following has to be moved to the server in order to update the database
  // water(username) {
  //   // here we will also add a username
  //   let data = {
  //     user: username,
  //     date: getDate()
  //   }
  //   this.watered.push(data);
  // }

  isClicked(mousePosX, mousePosY, mapZoom) {
    let d = dist(mousePosX, mousePosY, this.position.lat, this.position.lng);
    // the users zoom (11–22) is maped to a scale from 1–100 to assure click
    // accuracy on all zoom levels
    let zoom = map(mapZoom, 11, 22, 1, 150);
    // we're using 0.0001 here because we are using coordinates and not pixels
    if (d < 0.001 / zoom) {
      return true;
    } else {
      return false;
    }
  }

  getFlowerData() {
    let data = {
      id: this.id,
      coordinates: {
        lat: this.position.lat,
        lng: this.position.lng,
      },
      flowerType: this.type,
      flowerName: this.flowerName,
      userName: this.user,
      userLocation: this.location,
      dateAdded: this.date,
      watered: this.watered,
      age: this.age
    }
    return data
  }
}
