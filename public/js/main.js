const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');


// GET USERNAME AND ROOM FROM URL

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});


const socket = io();

//JOIN CHATROOM
socket.emit('joinRoom', {username, room});

//GET ROOM AND USERS
socket.on('roomUsers', ({ room, users }) =>{
  outputRoomName(room);
  outputUsers(users);
});

// MESSAGE FROM SERVER
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  //SCROLL DOWN
  chatMessages.scrollTop = chatMessages.scrollHeight;

});

//MESSAGE SUBMIT

chatForm.addEventListener('submit', (e) =>{
  e.preventDefault();

  // GET MESSAGE
  const msg = e.target.elements.msg.value;

  // EMIT MESSAGE TO SERVER
  socket.emit('chatMessage', msg);

  //CLEAR INPUTS
  e.target.elements.msg.focus();
});

//OUTPUT MESSAGE TO DOM

function outputMessage(message){
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

//ROOMNAME TO DOM

function outputRoomName(room){
  roomName.innerText = room;
}

function outputUsers(users){
  usersList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}