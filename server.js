const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket.io
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('message', (msg) => {
        console.log('Message received:', msg);
        socket.broadcast.emit('message', msg);
    });

    socket.on('typing', (user) => {
        socket.broadcast.emit('typing', user);
    });

    socket.on('stop typing', (user) => {
        socket.broadcast.emit('stop typing', user);
    });

    socket.on('file-upload', (fileData) => {
        console.log(`File uploaded by ${fileData.user}: ${fileData.fileName}`);
        socket.broadcast.emit('file-upload', fileData);
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});
