# A Connected Garden
A Connected Garden is a project built within the course [Creative Coding](https://drawwithcode.github.io/2020/) at the Politecnico di Milano. It makes use of the [p5.js](https://p5js.org) library and [Mappa.js](https://mappa.js.org). In addition to that, it stores the data on [firebase](https://mappa.js.org).

# Table of Contents
1. [How to Run](#how-to-run)
2. [About the Project](#about-the-project)
3. [Design Challenges](#design-challenges)
4. [Coding Challenges](#coding-challenges)
5. [Credits](#credits)

# How to Run
Be sure to have node installed: https://nodejs.org/
* Install node dependencies: `npm install`
* Run local server: `node app.js`
* Open: `localhost:3000`

# About the Project

## Idea

## Goals

## Context

# Design Challenges

# Coding Challenges

### User Clicks a Flower

One of the difficulties we encountered is to check if a flower is clicked by the user. Here we have to keep in mind that the the flower's position depends on it's geographic coordinates, not the canvas' pixel coordinates. In order to overcome this issue, we have to convert the mouse X and Y coordinates to `position.lat` (latitude) and the `position.lng` (longitude). We then pass it to the flower class.

**Inside the mouseClicked() function:**
```javascript
for (let i = 0; i < allFlowers.length; i++) {
  if (allFlowers[i].isClicked(position.lat, position.lng, mapZoom)) {
    let data = allFlowers[i].getFlowerData();
    // Do something when the flower is clicked
  }
}
```

Now it is possible to compare the mouse's position to the flowers's position. The benefit of using geographic coordinates is that the position does not depend on the canvas size anymore, which is important when working with maps.

**Inside the Flower Class:**
```javascript
isClicked(mousePosX, mousePosY, mapZoom) {
  let d = dist(mousePosX, mousePosY, this.position.lat, this.position.lng);
  // the users zoom (11–22) is mapped to a scale from 1–150 to assure click accuracy on all zoom levels
  let zoom = map(mapZoom, 11, 22, 1, 150);
  // we're using 0.008 here because we are using coordinates and not pixels
  if (d < 0.008 / zoom) {
    return true;
  } else {
    return false;
  }
}
```



# Credits

##### Team Members
* [Alia Kaouel](#)
* [Marija Nikolic](#)
* [Tim Olbrich]("https:timolbrich.com")

##### Course
**[Creative Coding 2020/2021](https://drawwithcode.github.io/2020/)**<br>
**Politecnico di Milano:** School of Design<br>
**Faculty:** Michele Mauri, Andrea Benedetti, Tommaso Elli.
