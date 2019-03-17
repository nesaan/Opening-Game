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
  var count = 0;
  var opInfo;
  function add(socket){
    sockets.push(socket);
    console.log(sockets.length);
    socket.on("disconnect", function(){
      sockets.splice(socket, 1);
      console.log(sockets.length);
    });
    socket.on("msg", function(data){
      io.sockets.emit('new message', data);
    });

    socket.on("songReady", function(){
      count++;
      if (count >= sockets.length){
        io.sockets.emit("play");
      }
    });

    socket.on("cutout", function(){
      sockets.push(socket);
      console.log("I am cut out");
    });

    socket.on("command", function(data){
      if (data.content == "next"){
        opInfo = null;
        count = 0;
        io.sockets.emit("pause");
        SongPicker.getNextUrl(function(data){
          opInfo = data;
          io.sockets.emit("newsong", {url:data.url});
        }, data.mal, function(errorMsg){
          io.sockets.emit("new message", {
            content: errorMsg || "This link was a baddy.",
            name: "Miku",
            isMiku: true
          })
        });
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
        if(opInfo){
          io.sockets.emit("new message", {
            content: "Anime: " + opInfo.anime + " / Title: " + opInfo.op,
            name: "Miku",
            isMiku: true
          });
        }
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
