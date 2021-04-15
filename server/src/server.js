"use strict"

// Setup packages
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const mongoose = require('mongoose');
const superagent = require("superagent");
const { v4: uuidv4 } = require('uuid');
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
const PORT = process.env.PORT || 4000;

// Socket.io

const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, "../../client");
app.use(express.static(publicDirectoryPath));


// Routes

// app.use(authRoutes);
// app.set('view engine', 'ejs');
// app.use('/api/v1', v1Routes);

app.get("/", (req, res) => {
  res.render("index.html");
})

// Handle errors

app.use('*', notFoundHandler);
app.use(errorHandler);

let players = [];
let questionsData = [];
let userQuestions = [];
let count = -1;

io.on('connection', (socket) => {
  console.log(`web socket`);
  socket.on('user_joined', (data) => {
    const player = {
      id: socket.id,
      name: data.name,
      room: data.room,
      points: 0
    }
    players.push(player)
    console.log(data.name, 'is now connected')
    console.log(players);
    handleQuestion().then(() => {
      // console.log("After promise", questionsData);
      // The redirect way
      // let destination = 'http://localhost:4000/game.html';
      // socket.emit('questionsData', destination, questionsData);
      socket.emit('questionsData', generateQuestion(questionsData, count));
      console.log(questionsData);

    }).catch(error => {
      console.log(`Error getting the data from API`, error.message);
    });
  })

  socket.on('send_response', response => {
    console.log(response);
    let result = checkID(response.userAnswer, response.questionID);

    console.log(result);

    if(result) {
      increasePoints(socket.id);
    }
    console.log(players);
    // ******************************************************************
    // !Hello from the other world
    // *We reached here

    // socket.emit('questionsData', generateQuestion(questionsData, count));

  })

  socket.on('disconnect', () => {
    players = players.filter(player => {
      if (player.id !== socket.id) {
        return player.id !== socket.id;
      } else {
        console.log(player.name, 'user disconnected');
      }
    })
  })
})



// functions

function handleQuestion() {
  let url = 'https://opentdb.com/api.php?amount=10&difficulty=easy&type=boolean';

  return superagent.get(url)
    .then(data => {
      return questionsData = data.body.results.map(data => new Question(data));
    }).catch(error => {
      console.log("error from API", error.message);
    });
}

function generateQuestion(questionsData, count) {
  for (let i = 0; i < questionsData.length; i++) {
    userQuestions[i] = {id: questionsData[i].id, question:questionsData[i].question} ;
  }

  for (count; count < userQuestions.length; count++) {
    count++;
    return userQuestions[count];
  }
}

function checkID(userAnswer, questionID) {
  let obj = questionsData.find(questionObj => questionID === questionObj.id);
  if(userAnswer === obj.correct_answer) {
    return true;
  }
  return false;
}

function increasePoints(id) {
  console.log("passed id",id);
  players = players.map (player => {
    console.log("player id",player.id);
    if (player.id === id) {
      return {
        ...player,
        points: player.points + 2
      }
    } else {
      return player;
    }
  })
}



function Question(data) {
  this.id = uuidv4();
  this.question = data.question;
  this.correct_answer = data.correct_answer;
  this.incorrect_answers = data.incorrect_answers[0];
}



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
