# A Connected Garden
*A Connected Garden* is a collaborative project built within the course [Creative Coding](https://drawwithcode.github.io/2020/) at the Politecnico di Milano. It makes use of the [p5.js](https://p5js.org) library and [Mappa.js](https://mappa.js.org). In addition, [firebase](https://mappa.js.org) is used to store the data while [tailwindcss](https://github.com/tailwindlabs/tailwindcss) takes care of most of the styling.

# :compass: Table of Contents
1. [How to Run](#how-to-run)
2. [About the Project](#about-the-project)
3. [Design Challenges](#design-challenges)
4. [Coding Challenges](#coding-challenges)
5. [Credits](#credits)

# :running_woman: How to Run
See the [demo](https://a-connected-garden.herokuapp.com) or
be sure to have node installed: https://nodejs.org/
* Install node dependencies: `npm install`
* Run local server: `node app.js`
* Open: `localhost:3000`

### Presentation Mode
*A Connected Garden* comes with a presentation mode to imitate passing of time by using the arrow keys. This is helpful to demonstrate time relevant features, such as the aging of a flower. The feature can be enabled by setting `presentationMode = true;`

# :bulb: About the Project

### Goals
We live in a world where the majority of people pollute everyday, but almost never plant a flower. The connection with nature is getting lost with all these technological developments entering our lives.
We tend to run away from the feeling of responsibility towards environmental maintenance. Of course, every action needs a first step, but we sometimes forget how easy and simple it is to just plant a seed that will later have an impact.
This is the idea behind *A Connected Garden*, it is the first step showing how easy it to make Milan more green, just by simple interactions.

We choose city of Milan because that's the place where we all met. We all have a connection to it. Moreover, in the moment when we all started Politecnico there, Milan was  second on the list of the most polluted cities in Europe. 
So we got inspired to make a change here and now. Ofcaurse, as a future vision, there can be a list of cities in hierarchical order by pollution level where you choose to plant.

### Idea 
*A Connected Garden* is a collaborative experience which aims to spread the thought about a more green city. Moreover, it shows how easy it is to make a change by collaborating with each other, and taking care of each other’s creations.
Visitors can plant endangered flowers from a list of endangered plant speices and learn about them. Each flower has a lifetime duration and has to be watered *(taken care of)*. If the plant is not maintained after a certain amount time, it will change its appearance and eventually completely disappear.

### Context
The website can be used in diverse contexts that are related to the environment. Therefore, it is accessible in daily life through computer and smartphone, to make it at the disposal of people. The website can also be used to promote environmental organizations or projects to incite people to donate or take other actions. However, most importantly *A Connected Garden* can be found in specific environmental related events like conferences or expositions, such as:  <br>
* Day of Forests
* Earth Day
* The European Conference of Sustainability, Energy and the Environment
* Earth Overshoot Day

# :artist: Design Challenges

Choosing the style that corresponds most to the project has been a little challenging. Throughout the design process, we tried different styles that could suit the website. First, we were inspired by the style of old natural science books, which could feel organic and connected to nature .
<img src="public/images/designprocess.gif"/>

Nevertheless, we were missing the digital, technological component. The players are indeed planting flowers, but we wanted to underline that these were not real ones. At the same time, we wanted a style that could be fun and eye-catching for the visitor. In the end, we opted for a vintage look, feeling like the 90’s computer programs, with pixelated graphics to communicate criticism towards "outdated idea" of planting a flower.
  <img src="public/images/newscreens.gif"/>
  
  
  <img src="public/images/flowers-evolutions.gif"/>

# :technologist: Coding Challenges
### Architecture map
<img src="public/images/architecturemap.png"/>

### User Clicks a Flower
One of the difficulties we encountered is to check if a flower is clicked by the user. Here we have to keep in mind that the  flower's position depends on it's geographic coordinates, not the canvas' pixel coordinates. In order to overcome this issue, we have to convert the mouse X and Y coordinates to `position.lat` (latitude) and the `position.lng` (longitude). We then pass it to the flower class.

**Inside the mouseClicked() function in** `sketch.js`
```javascript
for (let i = 0; i < allFlowers.length; i++) {
  if (allFlowers[i].isClicked(position.lat, position.lng, mapZoom)) {
    let data = allFlowers[i].getFlowerData();
    // Do something when the flower is clicked
  }
}
```

Now it is possible to compare the mouse's position to the flowers' position. The benefit of using geographic coordinates is that the position does not depend on the canvas size anymore, which is important when working with maps.

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

### Space for improvments

As there is a few relatively small images, they are currently in the images/ directory. However, if the number of offered flowers should increase, storing them in Firebase storage would be a better option.

# :medal_military: Credits:

##### Team Members
* [Alia Kaouel](https://alia-kaouel.myportfolio.com)
* [Marija Nikolic](https://github.com/Maariaah)
* [Tim Olbrich](https://timolbrich.com)

##### Course:
**[Creative Coding 2020/2021](https://drawwithcode.github.io/2020/)**<br>
**Politecnico di Milano:** School of Design<br>
**Faculty:** Michele Mauri, Andrea Benedetti, Tommaso Elli.
