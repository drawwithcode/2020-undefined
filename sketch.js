let map;

let canvas;

const mappa = new Mappa('Leaflet');

// Lets put all our map options in a single object
const options = {
  lat: 45.4642,
  lng: 9.19000,
  zoom: 13,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function preload(){
  // put preload code here
}

function setup() {
  canvas = createCanvas(640, 640);

  // Create a tile map with lat 0, lng 0, zoom 4
 map = mappa.tileMap(options);
 // Overlay the canvas over the tile map
 map.overlay(canvas);

 fill(200, 100, 100);

 // Only redraw the point when the map changes and not every frame.
  map.onChange(drawPoint);

}

function draw() {


}

function drawPoint() {
  clear();
  // put drawing code here
  // Every Frame, get the canvas position
// for the latitude and longitude of Nigeria
const nigeria = map.latLngToPixel(11.396396, 5.076543);
// Using that position, draw an ellipse
ellipse(nigeria.x, nigeria.y, 20, 20);

}
