# A Connected Garden
A Connected Garden is a project built within the course [Creative Coding](https://drawwithcode.github.io/2020/) at the Politecnico di Milano. It makes use of the [p5.js](https://p5js.org) library and [Mappa.js](https://mappa.js.org). In addition, [firebase](https://mappa.js.org) is used to store the data while [tailwindcss](https://github.com/tailwindlabs/tailwindcss) takes care of most of the styling.

# Table of Contents
1. [How to Run](#how-to-run)
2. [About the Project](#about-the-project)
3. [Design Challenges](#design-challenges)
4. [Coding Challenges](#coding-challenges)
5. [Credits](#credits)

# How to Run
See the [demo](https://github.com/drawwithcode/2020-undefined/deployments/activity_log?environment=a-connected-garden) or
be sure to have node installed: https://nodejs.org/
* Install node dependencies: `npm install`
* Run local server: `node app.js`
* Open: `localhost:3000`

# About the Project

### Idea
We live in a world where majority of people pollute everyday, but almost never plant a flower. The connection with nature is getting lost with all these technology development entering our lives. <br>
Every action needs a first step, and sometimes we forget how easy it is to just plant a seed that will later have an impact in our lives especially if everyone does the same.
This is the idea behind Connected gardens, it is the first step showing how easy it to make Milan more green, just by simple interactions.



### Goals
Connected gardens is a collaborative experience that aims at inciting people to think about the importance of having a city more green. <br>
The idea is to show how easy it is to extend the green area in the city, just by collaborating together, and taking care of each other’s plants. <br>
Visitors can plant endangered flowers that are giving from a list and read some information about them. Each flower has a lifetime duration  and has to be watered. If the plant is not maintained after a certain amount time, it will disappear after a period of time.



### Context
"Connected gardens" is a website that can be used in diverse contexts that are related to the environment. <br>
First, it is accessible in daily life through computer and smartphone, to make it at the disposal of people. <br>
The website can also be used to promote environmental organizations to incite people to donate or make other actions. <br>
But most importantly “Connected Gardens” can be found in specific environmental related events like conferences or expositions, such as:  <br>
-Day of Forests <br>
-Earth Day <br>
-The European Conference of Sustainability, Energy and the Environment <br>
-Earth Overshoot Day <br>

# Design Challenges

# Coding Challenges

### User Clicks a Flower
One of the difficulties we encountered is to check if a flower is clicked by the user. Here we have to keep in mind that the the flower's position depends on it's geographic coordinates, not the canvas' pixel coordinates. In order to overcome this issue, we have to convert the mouse X and Y coordinates to `position.lat` (latitude) and the `position.lng` (longitude). We then pass it to the flower class.

**Inside the mouseClicked() function in** `sketch.js`
```javascript
for (let i = 0; i < allFlowers.length; i++) {
  if (allFlowers[i].isClicked(position.lat, position.lng, mapZoom)) {
    let data = allFlowers[i].getFlowerData();
    // Do something when the flower is clicked
  }
}
```

Now it is possible to compare the mouse's position to the flowers's position. The benefit of using geographic coordinates is that the position does not depend on the canvas size anymore, which is important when working with maps.

**Inside the Flower Class in** `sketch.js`
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
### User Waters a Flower

Once the user waters a flower their name will be stored in the database. In our case we wanted to not only show one user, but a history of users who "watered" the flower. In order to do that we had to come up with a way to update the data while keeping previous data.

The solution is to use an array field in the database and make use of the [arrayUnion()](https://firebase.google.com/docs/firestore/manage-data/add-data) function, which appends elements to field.

**Inside waterFlower() function in** `app.js`
```javascript
socket.on("waterFlower", function(data) {
  console.log("Water flower with ID: " + data.id);
  // Declare the object with updated data for the database
  let id = data.id;
  let water = {
    user: data.user,
    date: getDate()
  };

  // Update the data by appending the object to the array
  firebase
    .firestore()
    .collection("flowers")
    .doc(id)
    .update({
      // Here we append the object rather than overwriting it
      watered: firebase.firestore.FieldValue.arrayUnion(water)
    });

    // after a slight delay, load the new data and emit it to the clients
    setTimeout(function() {
      getFromDatabase();
    }, 500)

});
```

# Credits:

##### Team Members
* [Alia Kaouel](#)
* [Marija Nikolic](#)
* [Tim Olbrich]("https://timolbrich.com")

##### Course:
**[Creative Coding 2020/2021](https://drawwithcode.github.io/2020/)**<br>
**Politecnico di Milano:** School of Design<br>
**Faculty:** Michele Mauri, Andrea Benedetti, Tommaso Elli.
