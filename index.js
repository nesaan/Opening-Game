var express = require('express');
var app = express();
var server = require('http').createServer(app);

server.listen(process.env.PORT || 3000);
app.get('/', function(req, res){
    res.sendFile(__dirname + "/game.html");
  });

var io = require('socket.io').listen(server);

var OPManager = require('./opmanager.js');
var uuid1 = require('uuid/v1');

var socketHandler = function(){
  var sockets = [];
  function add(socket){
    var uuid = uuid1();
    socket.emit("uuid", uuid);
    console.log("New User: " + uuid);
    sockets.push(socket);
    console.log(sockets.length);
    io.sockets.emit("usrcount", sockets.length);
    socket.on("disconnect", function(){
      sockets.splice(socket, 1);
      console.log(sockets.length);
      io.sockets.emit("usrcount", sockets.length);
    });
    socket.on("msg", function(data){
      data.uuid = uuid;
      io.sockets.emit('new message', data);
    });

    OPManager.add(socket);

    socket.on("cutout", function(){
      sockets.push(socket);
      console.log("I am cut out");
    });

    socket.on("command", function(data){
      if (data.content == "next"){
        OPManager.nextSong(data.mal);
      }
      else if (data.content == "pause"){
        io.sockets.emit("pause");
      }
      else if (data.content == "play"){
        io.sockets.emit("play");
      }
      else if (data.content == "flush"){
        sockets = [];
        io.sockets.emit("flush");
      }
      else if (data.content == "answer"){
        OPManager.answer();
      }
    });
  }

  function getSockets(){
    return sockets;
  }

  function init(){
    OPManager.init({
      sockets:getSockets,
      io:io
    });
  }
  return {
    init:init,
    add : add
  }

}();

socketHandler.init();

io.sockets.on('connection', function(socket){
    socketHandler.add(socket);
  });


app.use('/game.js', express.static('game.js'));
app.use('/game.css', express.static('game.css'));
app.use('/miku.png', express.static('miku.png'));
app.use('/mikuchibi.png', express.static('mikuchibi.png'));
console.log("App Started:");
if (!process.env.PORT) {
  console.log("Hosted on: localhost:3000");
}
