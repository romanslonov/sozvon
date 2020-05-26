require('dotenv').config();
const Koa = require('koa');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

const {
  rooms,
  addSocketToRoom,
  removeSocketFromRoom,
  allSocketsForRoom,
} = require('./rooms');

const config = {
  port: 3000,
  host: process.env.HOST || 'localhost',
  max: 50,
};

app.use(helmet());
app.use(cors());

let brokenSockets = {}

function activeSockets(id = null) {
  return Object.keys(io.sockets.connected).filter(sid => sid !== id && !brokenSockets[sid])
}

function brokenSocket(socket) {
  brokenSockets[socket.id] = true
  io.emit('remove', { id: socket.id })
}

function socketByID(id) {
  return io.sockets.connected[id]
}

function emitByID(id, name, msg) {
  let socket = socketByID(id)
  if (socket) {
    console.log('emit', id, name, msg)
    socket.emit(name, msg)
  }
}

function broadcastByID(ids, name, msg) {
  for (let id of ids) {
    emitByID(id, name, msg)
  }
}

io.on('connection', (socket) => {
  const sid = socket.id;
  let currentRoom;

  console.log('connection socket id:', sid);

  for (const msg of ['disconnect', 'disconnecting', 'error']) {
    socket.on(msg, data => {
      console.log(`* ${msg}:`, data);
      brokenSocket(socket);
      removeSocketFromRoom(sid, currentRoom);
    })
  }

  // The peer that joined is responsible for initiating WebRTC connections
  // socket.on('join', ({ room }) => {
  //   currentRoom = room;
  //   socket.join(room);
  //   socket.to(room).emit('joined', {sid});

  // });

  socket.on('join', ({ room }) => {
    const peers = allSocketsForRoom(room);
    const full = peers.length >= config.max
    if (full) {
      socket.emit('error', {
        error: `Room ${room} is full`,
        code: 1,
        full,
      })
    } else {
      removeSocketFromRoom(sid, currentRoom)
      addSocketToRoom(sid, room)
      currentRoom = room;
      socket.emit('joined', {
        room,
        peers,
      });
    }
  });

  // socket.on('signal', (data) => {
  //   io.to(data.to).emit('signal', data);
  // });

  // Ask for a connection to another socket via ID
  socket.on('signal', (data) => {
    console.log('signal', data.from, data.to);
    if (data.from !== sid) {
      console.log('*** error, wrong from', data.from);
    }
    if (data.to) {
      const toSocket = socketByID(data.to);
      if (toSocket) {
        toSocket.emit('signal', {
          ...data,
          // from: socket.id,
        });
      } else {
        console.log('Cannot find socket for %s', data.to);
      }
    }
  });

  socket.on('action', (data) => {
    socket.to(data.room).emit('action', data);
  });

  socket.on('message', (message) => {
    console.log(message);
    socket.to(message.room).emit('message', message);
  });

  // socket.on('disconnect', () => {
  //   socket.leave(currentRoom);
  //   socket.to(currentRoom).emit('leave', {sid});
  //   console.log('leave ', sid);
  // });
});

server.listen(config.port, config.host, () => {
  console.log(`Server up and running on: ${config.host}:${config.port}`);
});