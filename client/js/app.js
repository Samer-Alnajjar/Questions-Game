
// let socket = undefined;
const userForm = document.getElementById('form_user');
const submittion = document.getElementById('submittion');
const intro = document.getElementById('intro')
const game = document.getElementById('game')
userForm.addEventListener('submit',(e)=>{
    e.preventDefault();
       console.log('hhhhhhhhhhhhhhhh')
    const name = e.target['name'].value;
    if(name){
        socket=window.io();
        socket.emit('user_joined',name)
        intro.style.display='none';
        game.classList.remove('hidden')
    }
})

submittion.addEventListener('submit',e=>{
    e.preventDefault();
    const res = e.target['response'].value
    if(res){
        socket.emit('send_response',res)
    }
})