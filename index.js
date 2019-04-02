var express = require('express');
var app = express();
var server = require('http').createServer(app);
var getter = require('request');
server.listen(process.env.PORT || 3000);
app.get('/', function(req, res){
    res.sendFile(__dirname + "/game.html");
  });


app.get('/song', function(req, res){
  getter.get(OPManager.url())
  .on('response', function(response){
    console.log(response.statusCode);
    if (response.statusCode === 429){
      io.emit('new message', {
        content:"Call Nesaan please!",
        name:"Miku",
        isMiku:true
      });
    }
  })
  .pipe(res);  // res being Express response
});

var io = require('socket.io').listen(server);

var OPManager = require('./opmanager.js');
var uuid1 = require('uuid/v1');
var PlayerManager = require('./playermanager.js');

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
      PlayerManager.remove(uuid);
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
      var args = data.content.split(' ');
      if (args[0] == "next"){
        var startTime = data.middle ?  Math.floor(Math.random() * 30) : 0;
        OPManager.nextSong(data.mal, data.endings, startTime);
      }
      else if (args[0] == "pause"){
        io.sockets.emit("pause");
      }
      else if (args[0] == "play"){
        io.sockets.emit("play");
      }
      else if (args[0] == "flush"){
        sockets = [];
        io.sockets.emit("flush");
      }
      else if (args[0] == "answer"){
        OPManager.answer();
      }
      else if (args[0] == "join"){
        PlayerManager.join(socket, uuid, args[1] || "Unknown");
      }
      else if (args[0] == "update"){
        PlayerManager.update(uuid, parseInt(args[1]) || 0);
      }
      else if (args[0] == "leave"){
        PlayerManager.remove(uuid);
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
    PlayerManager.init();
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
