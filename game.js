var AudioHandler = function(){
  var audio;
  var vol;

  function setVolume(volume){
    volume = volume/100;
    if(audio){
      audio.volume = volume;
    }
    vol = volume;
  }
  function newAudio(url, cb){
    audio = new Audio(url);
    audio.load();
    audio.volume = vol || 0.5;
    audio.oncanplaythrough = cb;
  }

  function play(){
    if(audio){
      audio.play();
    }
  }
  function pause(){
    if(audio){
      audio.pause();
    }
  }
  return {
    play:play,
    pause:pause,
    newAudio:newAudio,
    setVolume:setVolume
  }

}();

var AudioManager = function(){
  var emit;
  var on;

  function play(){
    AudioHandler.play();
  }

  function pause(){
    AudioHandler.pause();
  }

  function newAudio(data){
    pause();
    AudioHandler.newAudio(data.url, function(){
      emit("songReady");
    });
  }



  function init(spec){
    emit = spec.emit;
    on = spec.on;
    on("play", play);
    on("pause", pause);
    on("newsong", newAudio);
    $("#volumeControl")[0].oninput = function(){
      AudioHandler.setVolume(this.value);
    };
  }

  return {
    init:init
  }
}();


var Chat = function(){
  var msgspot;
  var emit;
  var on;
  var messages;
  var malspot;

  function addmessage(data){
    var x = $('<div class="msg">' + data.name +": " + data.content + '</div>').appendTo(messages);
    if (data.name == User.name()){
      x.addClass("notmine");
    }
    messages.scrollTop(messages[0].scrollHeight);
  }
  function handleMessage(){
    var content = msgspot.val();
    if (content[0] == '/'){
      emit("command", {
        content : content.substring(1),
        mal : malspot.val()
      });
    }
    else{
      emit("msg", {
        content: content
      });
    }
    msgspot.val("");
  }
  function init(spec){
    msgspot = $("#msgspot");
    messages = $("#messages");
    malspot = $("#malspot");
    emit = spec.emit;
    on  = spec.on;



    on("new message", addmessage);
    msgspot.keypress(function(event){
      if (event.which == 13){
        event.preventDefault();
        handleMessage();
      }
    });
  }

  return {
    init:init
  }

}();

var User = function(){
  var usrspot;
  function init(){
    usrspot = $("#usrspot");
    usrspot.keypress(function(event){
      if (event.which == 13){
        event.preventDefault();
        return false;
      }
    });
  }

  function name(){
    return usrspot.val();
  }

  return {
    name : name,
    init: init
  }
}();



var Game = function(){
  var msgspot;
  var socket = io.connect();
  init();

  function emitMessage(message, data){
    socket.emit(message, $.extend(data, {name : User.name()}));
  }
  function onMessage(message, func){
    socket.on(message, func);
  }
  function init(){
    User.init();
    Chat.init({
      emit:emitMessage,
      on:onMessage
    });
    AudioManager.init({
      emit:emitMessage,
      on:onMessage
    });
    onMessage("flush", function(){emitMessage("cutout");});
  }
}

$(Game);
