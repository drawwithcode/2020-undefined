let myMap;
let canvas;
const mappa = new Mappa('Leaflet');

const mapOptions = {
  lat: 45.4642, //Latitude of Milan
  lng: 9.19000, //Longitude of Milan
  zoom: 13,
  // style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png" //Uncomment to see light map
  style: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
}

// This is for testing purpose.
// The actual data will come from the database.
const flowers = [{
    "name": "flower_1",
    "lat": 45.4642,
    "lng": 9.19000
  },
  {
    "name": "flower_2",
    "lat": 45.4645,
    "lng": 9.22000
  }
]

function preload() {
  // put preload code here
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  myMap = mappa.tileMap(mapOptions);
  myMap.overlay(canvas);
  myMap.onChange(drawFlowers);
}

function draw() {

}

function drawFlowers() {
  clear();
  // Get the coordinates for every object in the flowers-array
  for (let i = 0; i < flowers.length; i++) {
    const latitude = Number(flowers[i].lat);
    const longitude = Number(flowers[i].lng);
    // Only draw the objects that are within the canvas
    if (myMap.map.getBounds().contains({
        lat: latitude,
        lng: longitude
      })) {
      const pos = myMap.latLngToPixel(latitude, longitude);
      ellipse(pos.x, pos.y, 20);
    }
  }
}
