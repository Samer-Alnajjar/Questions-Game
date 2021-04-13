"use strict"

// Setup packages
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require('mongoose');
const cors = require("cors");
require("dotenv").config();
const authRoutes = require('./auth-server/routes.js');
const notFoundHandler = require('../src/error-handlers/404.js');
const errorHandler = require('../src/error-handlers/500.js');
const v1Routes = require('../src/api-server/routes/v1.js');
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
app.use(authRoutes);
app.set('view engine', 'ejs');
app.use('/api/v1', v1Routes);

// Handle errors

app.use('*', notFoundHandler);
app.use(errorHandler);


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
    });
}



module.exports = {
  server: server,
  start: start,
  PORT: PORT
};
