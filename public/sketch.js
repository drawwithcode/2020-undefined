let canvas;
let body;
let myMap;
let allFlowers = [];
let socket = io();
let perfectFlowerImgs = [];
let mediumFlowerImgs = [];
let badFlowerImgs = [];
let aboutPopup;
// let plantInfoPopup;
let addPopup;
let steps;
let n = 0;
let frame;
let helperMsg;
let isAboutModalOpen;
let isAddModalOpen;
let isFlowertDetailsModalOpen;
let mapboxCanvas;
let deactivateClick;
let addMode = false;
let lStorage;
let selectedFlower;
let currentFlower;

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
  for (var i = 0; i < 6; i++) {
    perfectFlowerImgs[i]= loadImage("images/flowerset_1/flower_" + i + ".png");
    mediumFlowerImgs[i] = loadImage("images/flowerset_2/flower_" + i + ".png");
    badFlowerImgs[i]    = loadImage("images/flowerset_3/flower_" + i + ".png");
  }
}

function setup() {
  steps = document.querySelectorAll('[id^="step-"]');
  isAboutModalOpen = false;
  isAddModalOpen = false;
  isFlowertDetailsModalOpen = false;
  deactivateClick = false;
  lStorage = { lng: null, lat: null, name: "", location: "", flowername: "" };
  canvas = createCanvas(windowWidth, windowHeight);
  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
  myMap.onChange(drawFlowers);
  aboutPopup = document.getElementById("popup_about");
  // plantInfoPopup = document.getElementById("popup_plant_info");
  addPopup = document.getElementById("popup_add_plant");
  helperMsg = document.getElementById("helper_message");
  body = document.getElementById("body");
  frame = document.getElementById("frame");
  mapboxCanvas = select("#defaultCanvas0");
  imageMode(CENTER);
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

function openHelperMessage() {
  addMode = false;
  deactivateClick = true;
  let modal = select("#helper_message");
    modal.elt.classList.remove("hidden");
    select(".mapboxgl-canvas").elt.classList.add("border-8", "border-green-500");
    closeFlowerDetailsModal();
    closeAddModal();
    closeAboutModal();

}

function closeHelperMessage() {
  let modal = select("#helper_message");
    modal.elt.classList.add("hidden");
    select(".mapboxgl-canvas").elt.classList.remove("border-8", "border-green-500");
      deactivateClick = false;
}

//// About modal
function openAboutModal() {
  deactivateClick = true;
  let modal = select("#popup_about");
    modal.elt.classList.remove("hidden");
    closeFlowerDetailsModal();
    closeAddModal();
    closeHelperMessage();
}

function closeAboutModal() {
  let modal = select("#popup_about");
    modal.elt.classList.add("hidden");
      deactivateClick = false;
}

//// Add new plant modal
function openAddModal() {
  let modal = select("#popup_add_plant");
  select("body").elt.classList.add("preventScroll");
  modal.elt.classList.remove("hidden");

  closeFlowerDetailsModal();
  closeAboutModal();
  closeHelperMessage();
  deactivateClick = true;
}

function closeAddModal() {
  let modal = select("#popup_add_plant");
    select("body").elt.classList.remove("preventScroll");
    modal.elt.classList.add("hidden");
    setTimeout(function() {
      deactivateClick = false;
    }, 1000)
}

function openWaterModal() {
  deactivateClick = true;
  let modal = select("#water_modal");
  modal.elt.classList.remove("hidden");

      let data = currentFlower;
      select("#title").html("Water " + data.flowerName);

  closeFlowerDetailsModal();
}

// function closeWaterModal() {
//   let modal = select("#water_modal");
//   modal.elt.classList.add("hidden");
//   setTimeout(function() {
//     deactivateClick = false;
//   }, 500)
// }

function openThankYouModal() {
  deactivateClick = true;
  let modal = select("#thank-you-modal");
  let text = select("#thank-you-message");
  modal.elt.classList.remove("hidden");
  text.html("Thank you for taking care of " + currentFlower.userName + "'s flower.")
}

function closeThankYouModal() {
  let modal = select("#thank-you-modal");
  modal.elt.classList.add("hidden");
  for (let i = 0; i < allFlowers.length; i++) {
    if(allFlowers[i].id == currentFlower.id) {
      let data = allFlowers[i].getFlowerData();
        closeWaterModal();
        openFlowerDetailsModal(data);
    }
  }
  setTimeout(function() {
    deactivateClick = false;
  }, 500)
}

//// Plant Info modal
function openFlowerDetailsModal(data) {
  let modal = select("#popup_plant_info");
  if(modal.elt.classList.contains("hidden")) {
    modal.elt.classList.remove("hidden");
  }

currentFlower = data;

  let flowerset = 3;
  if(data.no_water >= 0 && data.no_water <= 3) {
    flowerset = 1;
  } else if (data.no_water >= 4 && data.no_water <= 7) {
    flowerset = 2
  }

  let path = "/images/flowerset_" + flowerset + "/flower_" + data.flowerType + ".png";
  select("#plant-image").html("<img src = '" + path + "' class='h-full my-10 mx-auto'>")

  let flowerType = "";
switch (data.flowerType) {
  case 0:
    flowerType = "Guaiacum Sanctum";
    break;
  case 1:
    flowerType = "Amorphophallus Titanum,";
    break;
  case 2:
    flowerType = "Bois Dentelle";
    break;
  case 3:
    flowerType = "Australian Orchid";
    break;
  case 4:
    flowerType = "Green Pitcher Plant";
    break;
  case 5:
    flowerType = "Rafflesia Arnoldii";
    break;
  default:
    flowerType = "Type Unknown";
    break;
}

  let color = select("#plant_info_color");
  let waterNeed = "";
  if(data.no_water >= 0 && data.no_water <= 3) {
    waterNeed = "Alive and fresh";
    color.elt.classList.remove("bg-gray-100");
    color.elt.classList.remove("bg-yellow-100");
    color.elt.classList.add("bg-yellow-200");

  } else if (data.no_water >= 4 && data.no_water <= 7) {
    waterNeed = "It's getting hot";
    color.elt.classList.remove("bg-gray-100");
    color.elt.classList.remove("bg-yellow-200");
    color.elt.classList.add("bg-yellow-100");
  } else {
    waterNeed = "Needs water immediately";
    color.elt.classList.remove("bg-yellow-100");
    color.elt.classList.remove("bg-yellow-200");
    color.elt.classList.add("bg-gray-100");
  }

  select("#plant-name").html(data.flowerName);
  select("#plant-type").html(flowerType);
  select("#user-name").html(data.userName);
  select("#user-location").html(data.userLocation);
  select("#green-level").html(waterNeed);
  select("#age").html(data.age + " days old");

  let watered = data.watered;
  let participants = select("#gardeners");
  if (Array.isArray(watered) && watered.length > 0) {
    participants.html("");
    // loop backwards through the array to display newest to oldest entries
  for (let i = watered.length - 1; i >= 0 ; i--) {
    participants.html("<p><span class='font-black'>" + watered[i].date.date + ":</span> " + watered[i].user + "</p>", true);
  }
} else {
  participants.html("<p>No one watered this plant yet</p>");
}
}

function closeFlowerDetailsModal(){
  let modal = select("#popup_plant_info");
    modal.elt.classList.add("hidden");
}

function nextButton() {
  //Get input data
  let nameInput = select("#name");
  let locationInput = select("#location");
  let flowerName = select("#flowername");

  let nameString = nameInput.elt.value.trim();
  let locationString = locationInput.elt.value.trim();
  let flowerNameString = flowerName.elt.value.trim();

  if (!nameString == "") {
    if (!locationString == "") {
      if (!flowerNameString == "") {
        lStorage.name = nameString;
        lStorage.location = locationString;
        lStorage.flowername = flowerNameString;

        select("#input-form").elt.classList.add("hidden");
        select("#flower-selection").elt.classList.remove("hidden");

      } else {
        flowerName.elt.classList.add("border-red-600");
        return
      }
    } else {
      locationInput.elt.classList.add("border-red-600");
      return
    }
  } else {
    nameInput.elt.classList.add("border-red-600");
    return
  }
}

function savePlantChoice(type) {
  lStorage.type = type;
}

function submitForm() {
  if (typeof lStorage.type == "number") {
    createFlower();
    closeAddModal();
    select("#flower-selection").elt.classList.add("hidden");
  } else {
    select("#selection-label").elt.classList.add("text-red-600");
  }

}

function createFlower() {
  let flower = {
    flower_coordinates: {
      lat: lStorage.lat,
      lng: lStorage.lng
    },
    flower_type: lStorage.type,
    flower_name: lStorage.flowername,
    user_name: lStorage.name,
    user_location: lStorage.location,
  };
  socket.emit("createFlower", flower);
  console.log(flower);
}

socket.on("updateFlowers", function (data) {
  // when server emits a new array of flowers, update local flowers
  allFlowers = [];
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
        data[i].flower_age,
        data[i].no_water
      )
    );
  }

  drawFlowers();
});

function mouseClicked() {
  const mapZoom = myMap.zoom();
  const position = myMap.pixelToLatLng(mouseX, mouseY);

  // const currentTarget = event.target;
  // let aboutButton = document.getElementById("about_button");
  // let addButton = document.getElementById("add_button");

  //if clicked outside if about popup, close it
  // if (aboutPopup !== currentTarget) {
  //   toggleAboutModal(false);
  // }

  // check if add mode is on and if not clicked to any of buttons
  if (addMode) {
    deactivateClick = false;
    addMode = false;
    lStorage.lng = position.lng;
    lStorage.lat = position.lat;
    mapboxCanvas.removeClass("cursorCrosshair");
    closeHelperMessage();
    openAddModal();
  } else if (!deactivateClick){
  // check if cursor is over one of the flowers
  for (let i = 0; i < allFlowers.length; i++) {
    if (allFlowers[i].isClicked(position.lat, position.lng, mapZoom)) {
      let data = allFlowers[i].getFlowerData();
      openFlowerDetailsModal(data);
    }
  }
}
}

function emitAddPlantMode() {
  setTimeout(function() {
    addMode = true;
  }, 500)
  mapboxCanvas.addClass("cursorCrosshair");
  openHelperMessage();
  closeAddModal();
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

function waterFlower() {
  //Get input data
  let nameInput = select("#water-name");
  let nameString = nameInput.elt.value.trim();

  if (!nameString == "") {

        console.log("Water flower!");
        let waterThis = {
          user: nameString,
          id: currentFlower.id,
        };
        socket.emit("waterFlower", waterThis);



            let data = currentFlower;
            setTimeout(function() {
              openThankYouModal();
              closeWaterModal();
            }, 1000)


  } else {
    nameInput.elt.classList.add("border-red-600");
  }
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
    age,
    no_water
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
    this.no_water = no_water;
  }

  display(posX, posY) {
    if(this.no_water >= 0 && this.no_water <= 3) {
      image(perfectFlowerImgs[this.type], posX, posY, 20, 20);
    } else if (this.no_water >= 4 && this.no_water <= 7) {
      image(mediumFlowerImgs[this.type], posX, posY, 15, 15);
    } else {
      image(badFlowerImgs[this.type], posX, posY, 10, 10);
    }

  }

  isClicked(mousePosX, mousePosY, mapZoom) {
    let d = dist(mousePosX, mousePosY, this.position.lat, this.position.lng);
    // the users zoom (11–22) is maped to a scale from 1–150 to assure click
    // accuracy on all zoom levels
    let zoom = map(mapZoom, 11, 22, 1, 150);
    // we're using 0.03 here because we are using coordinates and not pixels
    // when changin keep in mind that the image might have transparency
    if (d < 0.001 / zoom) {
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
      no_water: this.no_water
    };
    return data;
  }
}
