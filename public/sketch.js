let canvas;
let myMap;
let allFlowers = [];
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
  // keep emit at the end, so it executes
  // when everything else has already been loaded
  socket.emit("firstConnection");
}

function drawFlowers() {
  clear();
  for (let i = 0; i < allFlowers.length; i++) {
    const coordinates = allFlowers[i].getFlowerCoordinates();
    if (typeof coordinates.lat == "number" && typeof coordinates.lng == "number") {
      pos = myMap.latLngToPixel(coordinates.lat, coordinates.lng);
      allFlowers[i].display(pos.x, pos.y);
    }
  }
}

function openFlowerDetails(data) {
  // open a popup modal
  console.log(data);
  let popup = document.getElementById("popup_1");
  popup.classList.remove("hidden");
}

function removeFlowerDetails() {
  // close popup modal
  let popup = document.getElementById("popup_1");
  popup.classList.add("hidden");
}

function getFlowerDetailsOpen() {
  // this function checks if the popup is open
  let popup = document.getElementById("popup_1");
  if(popup.classList.contains("hidden")) {
    return false
  } else {
    return true
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
      lng: 9.19 + r2
    },
    flower_type: "gs://a-connected-garden.appspot.com/sakura.png",
    flower_name: "Flower Name",
    user_name: "Username Testname",
    user_location: "City, Country",
  }

  socket.emit("createFlower", flower)
}

socket.on("updateFlowers", function(data) {
  // when server emits a new array of flowers, update local flowers
  for (let i = 0; i < data.length; i++) {

    allFlowers.push(new Flower(
      data[i].flower_coordinates,
      data[i].flower_type,
      data[i].flower_name,
      data[i].user_name,
      data[i].user_location,
      data[i].date_added
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

      data = {
        flower_coordinates: allFlowers[i].getFlowerCoordinates(),
        flower_type: allFlowers[i].getFlowerType(),
        flower_name: allFlowers[i].getFlowerName(),
        user_name: allFlowers[i].getUserName(),
        user_location: allFlowers[i].getUserLocation(),
        date_added: allFlowers[i].getDateAdded(),
        watered: allFlowers[i].getWatered()
      }
      openFlowerDetails(data);
      return
    } else if(getFlowerDetailsOpen()) {
      removeFlowerDetails();
    }
  }
}

class Flower {
  constructor(
    flower_coordinates,
    flower_type,
    flower_name,
    user_name,
    user_location,
    date_added
  ) {
    this.position = flower_coordinates;
    this.type = flower_type;
    this.flowerName = flower_name;
    this.user = user_name;
    this.location = user_location;
    this.date = date_added;
    // watere will be an array of objects containing the date and the username
    this.watered = [];
  }

  display(posX, posY) {
    // replace ellipse with image
    ellipse(posX, posY, 20);
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
    let zoom = map(mapZoom, 11, 22, 1, 100);
    // we're using 0.0001 here because we are using coordinates and not pixels
    if (d < 0.001 / zoom) {
      return true
    } else {
      return false
    }
  }

  getFlowerCoordinates() {
    let coordinates = {
      lat: this.position.lat,
      lng: this.position.lng
    }
    return coordinates
  }

  getFlowerType() {
    let flowerType = this.type
    return flowerType
  }

  getFlowerName() {
    let flowerName = this.flowerName
    return flowerName
  }

  getUserName() {
    let userName = this.user
    return userName
  }

  getUserLocation() {
    let userLocation = this.location
    return userLocation
  }

  getDateAdded() {
    let dateAdded = this.date
    return dateAdded
  }

  getWatered() {
    let watered = this.watered
    return watered
  }
}
