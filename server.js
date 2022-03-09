const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//STATIC FOLDER

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ValentinoBot';



//RUN WHEN CLIENTS CONNECTS

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);
    


        //WELCOME NEW USER

        socket.emit('message', formatMessage(botName, 'Welcome to the Chat'));

        //BROADCAST WHEN A USER CONNECTS

        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        // USERS AND ROOM INFO

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        //WHEN CLIENT DISCONNECTS

        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if(user){
                io.to(user.room).emit('message', formatMessage(botName, `${user.username} left the chat`));
            }

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
            
        });

    });

    

    // LISTEN FOR A CHAT MESSAGE
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username, msg));
    });
});

const PORT = 3000 || process.env.PORT;


server.listen(PORT, () => console.log('Server Running'));