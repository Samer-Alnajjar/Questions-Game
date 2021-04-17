"use strict"


const userForm = document.getElementById('form_user');
const intro = document.getElementById('intro')
const game = document.getElementById('game')
const submission = document.getElementById('submittion');
const question = document.querySelector("#question");
let userQuestion;
let board = document.getElementById('leaderboard')

// For Form

let socket = io();

userForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = e.target['name'].value;
  const room = e.target['room'].value;
  // if (name) {
  // let socket = window.io();
  socket.emit('user_joined', { name: name, room: room });
  socket.on('welcome',(player) => {
    alert(`${player.name} joined the game !`);
  });
  
  socket.on('leave', player => {
    alert(`${player} left the game !`);
  })

  intro.style.display='none';
  game.classList.remove("hidden");

  socket.on("questionsData", generateQuestion => {
    console.log(generateQuestion);
    // arrayOfQuestions = generateQuestion.map(question => question)
    // console.log(generateQuestion);
    if (typeof generateQuestion.statement === "string") {
      alert(generateQuestion.statement);
      alert(generateQuestion.winner.name + " won the game !");
    }
    userQuestion = generateQuestion;
    question.textContent = generateQuestion.question;
  })
  socket.on('leaderBoard', (leaderBoard) => {
    console.log('xxxxxxxxxxxxxxxxxxxxxleaderboardxxxxxxxxxxxxxxxxxxxxxxxxxx', leaderBoard)
    // let name = document.createElement('li')
    // name.textContent=leaderBoard.name
    // board.append(board)
    board.innerHTML = `${leaderBoard.map(player => `<li><strong>${player.name}</strong>${player.points}</li>`
    )}`
  })
  // socket.on('redirect', (destination, questionsData) => {
  //   window.location.href = destination;
  //   console.log(`From app ${questionsData}`);
  //   socket.emit("questionsData", questionsData);
  // });
  // }
})

// For Game


submission.addEventListener('click', e => {

  e.preventDefault();
  const res = e.target.innerText;

  if (res === "True" || res === "False") {
    // let socket = window.io();
    socket.emit('send_response', { userAnswer: res, questionID: userQuestion.id });

  }
})


// function renderQuestions(arrayOfQuestions) {
//   for (let i = 1; i < arrayOfQuestions.length; i++) {
//     submission.addEventListener('click',e=>{
//       e.preventDefault();
//       const res = e.target.innerText ;

//       if(res === "True" || res === "False"){
//         let socket = window.io();
//         socket.emit('send_response',res);
//       }
//     })
//   }
// }
