require('dotenv').config();
const Koa = require('koa');
const cors = require('@koa/cors');
const helmet = require('koa-helmet');
const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

const config = {
  port: process.env.PORT || 4000,
  host: process.env.HOST || 'localhost',
  max: 50,
};

app.use(helmet());
app.use(cors());

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
  });

  socket.on('action', (data) => {
    socket.to(data.room).emit('action', data);
  });

  socket.on('message', (message) => {
    console.log(message);
    socket.to(message.room).emit('message', message);
  });

  socket.on('disconnect', () => {
    socket.leave(currentRoom);
    socket.to(currentRoom).emit('leave', {sid});
    console.log('leave ', sid);
  });
});

server.listen(config.port, config.host, () => {
  console.log(`Server up and running on: ${config.host}:${config.port}`);
});