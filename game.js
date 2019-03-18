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
  var loading;

  function play(){
    loading.hide();
    AudioHandler.play();
  }

  function pause(){
    AudioHandler.pause();
  }

  function newAudio(data){
    pause();
    loading.text("loading").show();
    AudioHandler.newAudio(data.url, function(){
      emit("songReady");
    });
  }

  function countdown(count){
    loading.text(count);
  }



  function init(spec){
    loading = $('#loading');
    emit = spec.emit;
    on = spec.on;
    on("play", play);
    on("pause", pause);
    on("newsong", newAudio);
    on("countdown", countdown);
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
    var msgbox = $('<div class="msgbox"></div>').appendTo(messages);
    var msg = $('<div class="msg">' + data.name +": " + data.content + '</div>').appendTo(msgbox);
    msg.addClass(data.name == User.name() ? "mine" : "notmine");
    if (data.isMiku){
      msg.addClass("mikumsg");
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

var MusicControls = function(){
  var emit;
  var malspot;
  var validBtns;

  function handleMessage(content){
    if (content && validBtns.includes(content)) {
      emit("command", {
        content: content,
        mal: malspot.val()
      });
    }
  }
  function init(spec){
    malspot = $("#malspot");
    emit = spec.emit;
    validBtns = ["play", "pause", "next", "answer"];

    $(".kevBtn").click(function(){
      handleMessage(this.attributes["emitMsg"].value);
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
    MusicControls.init({
      emit:emitMessage
    });
    AudioManager.init({
      emit:emitMessage,
      on:onMessage
    });
    onMessage("flush", function(){emitMessage("cutout");});
  }
}

$(Game);
