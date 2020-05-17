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

app.use(helmet());
app.use(cors());
app.use(static(__dirname + '/' + 'public'));

// SOCKET.IO

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