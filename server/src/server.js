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

const {
  rooms,
  addSocketToRoom,
  removeSocketFromRoom,
  allSocketsForRoom,
} = require('./rooms');

app.use(helmet());
app.use(cors());
app.use(static(__dirname + '/' + 'public'));

// SOCKET.IO

let brokenSockets = {}

function activeSockets(id = null) {
  return Object.keys(io.sockets.connected).filter(sid => sid !== id && !brokenSockets[sid])
}

function brokenSocket(socket) {
  brokenSockets[socket.id] = true
  // log('--- broken sockets', Object.keys(brokenSockets).length, 'connected', activeSockets().length)
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

io.on('connection', function (socket) {
  const sid = socket.id
  let currentRoom

  // let peers = activeSockets(sid)
  console.log('connection socket id:', sid)

  for (const msg of ['disconnect', 'disconnecting', 'error']) {
    socket.on(msg, data => {
      console.log(`* ${msg}:`, data)
      brokenSocket(socket)
      removeSocketFromRoom(sid, currentRoom)
    })
  }

  // The peer that joined is responsible for initiating WebRTC connections
  socket.on('join', ({ room }) => {
    let peers = allSocketsForRoom(room)
    const full = peers.length >= config.max;
    if (full) {
      socket.emit('error', {
        error: `Room ${room} is full`,
        code: 1,
        full,
      })
    } else {
      removeSocketFromRoom(sid, currentRoom)
      addSocketToRoom(sid, room)
      currentRoom = room
      socket.emit('joined', {
        room,
        peers,
      })
    }
  })

  // Ask for a connection to another socket via ID
  socket.on('signal', data => {
    console.log('signal', data.from, data.to)
    if (data.from !== sid) {
      console.log('*** error, wrong from', data.from)
    }
    if (data.to) {
      const toSocket = socketByID(data.to)
      if (toSocket) {
        toSocket.emit('signal', {
          ...data,
          // from: socket.id,
        })
      } else {
        console.log('Cannot find socket for %s', data.to)
      }
    }
  })

})

// const peers = new Map();
// const rooms = new Map();

// io.on('connection', (socket) => {
//   const sid = socket.id;

//   peers.set(sid, socket);

//   console.log(sid, ' connected.');

//   socket.on('join', (room) => {
//     socket.join(room);
//     addRoom(sid, room);
//     socket.emit('sync', { peers: [...peers.keys()] });
//     socket.to(room).emit('joined', { socketId: sid });
//   });

//   socket.on('signal', (payload) => {
//     socket.to(payload.room).emit('signal', payload);
//   })

//   socket.on('leave', ({ room }) => {
//     peers.delete(sid);
//     socket.to(room).emit('left', { socketId: sid });
//     removeRoom(room);
//   });

//   socket.on('disconnect', () => {
//     peers.delete(sid);
//     rooms.get(sid).forEach((room) => {
//       socket.to(room).emit('left', { socketId: sid });
//     });
//     rooms.delete(sid);
//     console.log(sid, ' left.');
//   });
// });

// function addRoom(sid, room) {
//   const _rooms = rooms.get(sid);

//   if (!_rooms) {
//     return rooms.set(sid, [room]);
//   };

//   return rooms.set(sid, [..._rooms, room]);
// };

// function removeRoom(sid, room) {
//   const _rooms = rooms.get(sid);

//   if (!_rooms) {
//     return rooms.set(sid, [room]);
//   };

//   return rooms.set(sid, [..._rooms.filter(r => r !== room)]);
// };

// function getPeersExceptSender(sid, peers) {
//   const _peers = [...peers.keys()];

//   return _peers.filter(p => p !== sid);
// }

server.listen(config.port, config.host, () => {
  console.log(`Server up and running on: http://${config.host}:${config.port}`);
});