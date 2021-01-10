let express = require("express");
let socket = require("socket.io");


let app = express();

let port = 3000;

let server = app.listen(port);
let io = socket(server);

app.get("/mappa.js", function(req, res) {
    res.sendFile(__dirname + "/node_modules/mappa-mundi/dist/mappa.js");
});

app.use(express.static("public"));
console.log("Server running!");

io.on('connection', newConnection);

function newConnection(socket){
	console.log("New connection: ", socket.client.id);
}
