
var OPManager = function(){
  var count = 0;
  var opInfo;
  var sockets;
  var SongPicker;
  var io;
  function init(spec){
    sockets = spec.sockets;
    io = spec.io;
    SongPicker = require('./songpicker.js');
  }

  function add(socket){
    socket.on("songReady", function(){
      count++;
      if (count >= sockets().length){
        var countdown = 3;
        var timer = setInterval(function(){
          if (countdown == 0){
            clearInterval(timer);
            io.sockets.emit("play");
          }
          else{
            io.sockets.emit("countdown", countdown--);
          }
        }, 1000);
      }
    });
    socket.on("songfail", function(){
      io.sockets.emit("new message", {
        content: "Failure to find song, probably 520 || 429",
        name: "Miku",
        isMiku: true
      });
    });
  }

  function nextSong(mal){
    opInfo = null;
    count = 0;
    io.sockets.emit("pause");
    SongPicker.getNextUrl(mal).then(function(data) {
      opInfo = data;
      for (var i = 0; i < sockets().length; i++){
        const a = i;
        setTimeout(function(){
          console.log(a);
          sockets()[a].emit("newsong", {url:data.url});
        }, a*1000);
      }
//      io.sockets.emit("newsong", {url:data.url});
    }).catch(function(errorMsg){
      io.sockets.emit("new message", {
        content: errorMsg || "This link was a baddy.",
        name: "Miku",
        isMiku: true
      })
    });
  }

  function answer(socket){
    if(opInfo){
      io.sockets.emit("new message", {
        content: "Anime: " + opInfo.anime + " / Title: " + opInfo.op,
        name: "Miku",
        isMiku: true
      });
    }
  }

  return {
    init:init,
    answer:answer,
    nextSong:nextSong,
    add:add
  }

}();

module.exports = OPManager;
