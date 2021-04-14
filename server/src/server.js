"use strict"

// Setup packages
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require('mongoose');
const cors = require("cors");
require("dotenv").config();

// Configuring packages

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

// Socket.io

const io = socketio(server);
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

let players = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
});

io.on('connection', (socket) => {

  socket.on('user_joined', (name) => {
    const player = {
      id: socket.id,
      // socket:socket,
      name: name,
      points: 0
    };
    players.push(player)
    console.log(name, 'is now connected')
    console.log(players);
  });

  socket.on('send_response', response => {
    console.log(response);
  });


  socket.on('disconnect', () => {
    players = [...players.filter(player => player.id !== socket.id)]
    console.log(socket.id, 'user disconnected');
  });
});

// Routes


// Handle errors




// Listening to the Server

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};


function start(PORT) {
  mongoose.connect(process.env.MONGODB_URI, options)
    .then(() => {
      // Start the web server
      server.listen(PORT, () => console.log(`The Server is listening to PORT ${PORT}`));
    })
    .catch(error => {
      console.log(`__CONNECTION ERROR__`, error.message);
    })
}



module.exports = {
  server: server,
  start: start,
  PORT: PORT
}