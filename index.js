var express = require('express');
var app = express();
var server = require('http').createServer(app);

server.listen(process.env.PORT || 3000);
app.get('/', function(req, res){
    res.sendFile(__dirname + "/game.html");
  });

var io = require('socket.io').listen(server);

var SongPicker = require('./songpicker.js').SongPicker;

var socketHandler = function(){
  var sockets = [];
  function add(socket){
    sockets.push(socket);
    socket.on("disconnect", function(){
      sockets.splice(socket, 1);
    });
    socket.on("msg", function(data){
      io.sockets.emit('new message', data);
    });

    socket.on("command", function(data){
      if (data.content == "next"){
        SongPicker.getNextUrl(function(url){
          io.sockets.emit("newsong", {url:url});
        });
      }
      else if (data.content == "pause"){
        io.sockets.emit("pause", null);
      }
      else if (data.content == "play"){
        io.sockets.emit("play", null);
      }
    });

  }
  return {
    add : add
  }

}();

io.sockets.on('connection', function(socket){
    socketHandler.add(socket);
  });


app.use('/game.js', express.static('game.js'));
app.use('/game.css', express.static('game.css'));
console.log("App Started:");
