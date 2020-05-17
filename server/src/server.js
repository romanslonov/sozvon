const Koa = require('koa');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');
const static = require('koa-static');
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);


const config = {
  port: 3000,
  host: 'localhost',
  max: 50,
};

// const {
//   rooms,
//   addSocketToRoom,
//   removeSocketFromRoom,
//   allSocketsForRoom,
// } = require('./rooms');

app.use(helmet());
app.use(cors());
app.use(static(__dirname + '/' + 'public'));

// SOCKET.IO

// let brokenSockets = {}

// function activeSockets(id = null) {
//   return Object.keys(io.sockets.connected).filter(sid => sid !== id && !brokenSockets[sid])
// }

// function brokenSocket(socket) {
//   brokenSockets[socket.id] = true
//   // log('--- broken sockets', Object.keys(brokenSockets).length, 'connected', activeSockets().length)
//   io.emit('remove', { id: socket.id })
// }

// function socketByID(id) {
//   return io.sockets.connected[id]
// }

// function emitByID(id, name, msg) {
//   let socket = socketByID(id)
//   if (socket) {
//     console.log('emit', id, name, msg)
//     socket.emit(name, msg)
//   }
// }

// function broadcastByID(ids, name, msg) {
//   for (let id of ids) {
//     emitByID(id, name, msg)
//   }
// }

io.on('connection', (socket) => {
  const sid = socket.id
  let currentRoom

  console.log('connection socket id:', sid)

  socket.on('join', ({ room }) => {
    currentRoom = room;

    socket.join(room);
    
    socket.to(room).emit('joined', {sid});

  });

  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', data);
  })

  socket.on('disconnect', () => {
    socket.leave(currentRoom);
    socket.to(currentRoom).emit('leave', {sid});
    console.log('leave ', sid);
  });

});

server.listen(config.port, config.host, () => {
  console.log(`Server up and running on: http://${config.host}:${config.port}`);
});