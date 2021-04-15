"use strict"


const userForm = document.getElementById('form_user');
const intro = document.getElementById('intro')
const game = document.getElementById('game')
const submission = document.getElementById('submittion');
const question = document.querySelector("#question");
let userQuestion;


// For Form

let socket = io();

userForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = e.target['name'].value;
  const room = e.target['room'].value;
  // if (name) {
    // let socket = window.io();
    socket.emit('user_joined', { name: name, room: room })

    intro.classList.add("hidden");
    game.classList.remove("hidden");

    socket.on("questionsData",generateQuestion => {
      // arrayOfQuestions = generateQuestion.map(question => question)
      userQuestion = generateQuestion;
      question.textContent = generateQuestion.question;
    })
    // socket.on('redirect', (destination, questionsData) => {
    //   window.location.href = destination;
      //   console.log(`From app ${questionsData}`);
      //   socket.emit("questionsData", questionsData);
    // });
  // }
})

// For Game


submission.addEventListener('click',e=>{
  
  e.preventDefault();
  const res = e.target.innerText ;
  
  if(res === "True" || res === "False"){
    // let socket = window.io();
    socket.emit('send_response',{userAnswer: res, questionID: userQuestion.id});

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
