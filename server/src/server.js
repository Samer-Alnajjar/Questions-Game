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
  server:server,
  start:start,
  PORT:PORT
}