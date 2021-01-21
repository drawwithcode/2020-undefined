let canvas;
let body;
let myMap;
let allFlowers = [];
let socket = io();
let imgs = [];
let aboutPopup;
let plantInfoPopup;
let addPopup;
let helperMsg;
let isAboutModalOpen;
let isAddModalOpen;
let isFlowertDetailsModalOpen;
let mapboxCanvas;
let addMode;
let lStorage;

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
    imgs[i] = loadImage("images/flower_" + i + ".png");
  }
}

function setup() {
  isAboutModalOpen = false;
  isAddModalOpen = false;
  isFlowertDetailsModalOpen = false;
  addMode = false;
  lStorage = { lng: null, lat: null, name: "", location: "" };
  canvas = createCanvas(windowWidth, windowHeight);
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
  myMap.onChange(drawFlowers);
  aboutPopup = document.getElementById("popup_about");
  plantInfoPopup = document.getElementById("popup_plant_info");
  addPopup = document.getElementById("popup_add_plant");
  helperMsg = document.getElementById('helper_message')
  body = document.getElementById("body");
  mapboxCanvas = select("#defaultCanvas0");
  imageMode(CENTER);
  //createFlower();
  // keep emit at the end, so it executes
  // when everything else has already been loaded
  socket.emit("firstConnection");
}

function drawFlowers() {
  clear();
  for (let i = 0; i < allFlowers.length; i++) {
    const flowerData = allFlowers[i].getFlowerData();
    const coordinates = flowerData.coordinates;
    if (
      typeof coordinates.lat == "number" &&
      typeof coordinates.lng == "number"
    ) {
      pos = myMap.latLngToPixel(coordinates.lat, coordinates.lng);
      allFlowers[i].display(pos.x, pos.y);
    }
  }
}

function emitAddPlantMode() {
  addMode = true;
  mapboxCanvas.addClass("cursorCrosshair");
  toggleHelperMessage(true);
}

function toggleHelperMessage(isOpen) {
  console.log(isOpen)
  if(isOpen) {
    helperMsg.classList.remove("hidden");
    frame.classList.add("border");
  } else {
    helperMsg.classList.add("hidden");
    frame.classList.remove("border");
  }
}

//// About modal
function toggleAboutModal(isOpen) {
  if (isAboutModalOpen) {
    aboutPopup.classList.remove("hidden");
  } else {
    aboutPopup.classList.add("hidden");
  }
  isAboutModalOpen = isOpen;
}

//// Add new plant modal
function toggleAddModal(isOpen) {
  // the cursor has to be changed by adding a class to overide the default
  mapboxCanvas.addClass("cursorPointer");
  if (isOpen) {
    addPopup.classList.remove("hidden");
    body.classList.add("preventScroll");
    toggleHelperMessage(false);
  } else {
    addPopup.classList.add("hidden");
    body.classList.remove("preventScroll");
  }
  

  isAddModalOpen = isOpen;
  addMode = isOpen;
}

//// Plant Info modal
function toggleFlowerDetailsModal(isOpen) {
  isOpen
    ? plantInfoPopup.classList.remove("hidden")
    : plantInfoPopup.classList.add("hidden");

  isFlowertDetailsModalOpen = isOpen;

  // The following line is for testing
  // pass the username and the flower_id
  // waterFlower("Tim", "3Mdnja11cjVQ5KxRDzFJ");
}

function nextButton() {
  //Store form data
  saveFormData();
  console.log("local storage:", lStorage);
  //switch the modal
}

function saveFormData() {
  lStorage.name = document.getElementById("name").value;
  lStorage.location = document.getElementById("email").value;
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
    allFlowers.push(
      new Flower(
        data[i].flower_id,
        data[i].flower_data.flower_coordinates,
        data[i].flower_data.flower_type,
        data[i].flower_data.flower_name,
        data[i].flower_data.user_name,
        data[i].flower_data.user_location,
        data[i].flower_data.date_added,
        data[i].flower_data.watered,
        data[i].flower_age
      )
    );
  }

  drawFlowers();
});

function mouseClicked() {
  const mapZoom = myMap.zoom();
  const position = myMap.pixelToLatLng(mouseX, mouseY);
  const currentTarget = event.target;
  let aboutButton = document.getElementById("about_button");
  let addButton = document.getElementById("add_button");

  if (aboutPopup !== currentTarget) {
    toggleAboutModal(false);
  }

  if (addMode && addButton !== currentTarget && aboutButton !== currentTarget) {
    //store lat and long
    lStorage.lng = position.lng;
    lStorage.lat = position.lat;
    mapboxCanvas.removeClass("cursorCrosshair");
    toggleAddModal(true);
  }

  // check if cursor is over one of the flowers
  for (let i = 0; i < allFlowers.length; i++) {
    if (allFlowers[i].isClicked(position.lat, position.lng, mapZoom)) {
      let data = allFlowers[i].getFlowerData();
      toggleFlowerDetailsModal(true);
    } else {
      toggleFlowerDetailsModal(false);
    }
  }
}

function mouseMoved() {
  const mapZoom = myMap.zoom();
  const position = myMap.pixelToLatLng(mouseX, mouseY);
  for (let i = 0; i < allFlowers.length; i++) {
    if (allFlowers[i].isClicked(position.lat, position.lng, mapZoom)) {
      mapboxCanvas.addClass("cursorPointer");
      return;
    } else {
      mapboxCanvas.removeClass("cursorPointer");
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
    this.watered = watered;
    this.age = age;
  }

  display(posX, posY) {
    image(imgs[this.type], posX, posY, 30, 30);
    // ellipse(posX, posY, 30, 30);
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
    // the users zoom (11–22) is maped to a scale from 1–150 to assure click
    // accuracy on all zoom levels
    let zoom = map(mapZoom, 11, 22, 1, 150);
    // we're using 0.03 here because we are using coordinates and not pixels
    // when changin keep in mind that the image might have transparency
    if (d < 0.008 / zoom) {
      return true;
    } else {
      return false;
    }
  }

  setSize(size) {
    this.size = size;
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
      age: this.age,
    };
    return data;
  }
}
