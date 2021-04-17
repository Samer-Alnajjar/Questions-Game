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
// let count = 0;

io.on('connection', (socket) => {
  console.log(`web socket`);
  socket.on('user_joined', (data) => {
    const player = {
      id: socket.id,
      name: data.name,
      room: data.room,
      count: -1,
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
      storingUserQuestions(questionsData);
      // console.log(userQuestions);
      // console.log("generateQuestion", generateQuestion(socket.id));
      io.emit('questionsData', generateQuestion(socket.id));
      userPoints();
    }).catch(error => {
      console.log(`Error getting the data from API`, error.message);
    });
  })

  socket.on('send_response', response => {
    // console.log(response);
    console.log("from send_response", response);
    let result = checkID(response.userAnswer, response.questionID);

    console.log("**************************************************",result);

    if (result) {
      increasePoints(socket.id);
    }
    // console.log(players);
    // ******************************************************************
    // !Hello from the other world
    // *We reached here

    // if (count == 9) {
    //   count = 0;
    // } else {
    //   count++;
    // }
    // count++;
    
    io.emit('questionsData', generateQuestion(socket.id));
    userPoints();

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

function storingUserQuestions(questionsData) {
  for (let i = 0; i < questionsData.length; i++) {
    // userQuestions[i] = { id: questionsData[i].id, question: questionsData[i].question };
    userQuestions.push({ id: questionsData[i].id, question: questionsData[i].question, answer: questionsData[i].correct_answer });
  }
  console.log("**********************************",userQuestions.length);
}

function generateQuestion(id) {
  console.log("From inside the generateQuestion for id" + id);
  players = players.map(player => {
    // console.log("player id", player.id);
    // console.log("socket id", id);
    // if (player.id === id) {
        return {
          ...player,
          count: player.count + 1
        }
      // } else {
        // return player
      // }
    })
console.log(players);
  for (let i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      if (players[i].count === 19) {
        return 'Questions are finished';
      } else {
        return userQuestions[Math.floor(Math.random() * ((userQuestions.length-1) - 1))];
      }
    }
  }
}

function checkID(userAnswer, questionID) {

  // console.log("userAnswer", userAnswer, "questionID", questionID);
  let obj = userQuestions.find(questionObj => questionID === questionObj.id);
  // console.log("***************obj", obj);
  // console.log("***************userAnswer", userAnswer);
  // console.log("***************obj.correct_answer",obj.answer);
  if (userAnswer == obj.answer) {
    return true;
  }
  return false;
}

function increasePoints(id) {
  console.log("passed id", id);
  players = players.map(player => {
    console.log("player id", player.id);
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

function userPoints (){
  const leaderBoard = players.map(player=> players.sort((a,b)=>b.points-a.points).slice(0,10));
  io.emit('leaderBoard',leaderBoard[leaderBoard.length-1]);
  console.log('xxxxxxxxxxxxxxxxxxxxxleaderboardxxxxxxxxxxxxxxxxxxxxxxxxxx',leaderBoard);
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
