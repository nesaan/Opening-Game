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

  function newAudio(url, cb, errcb){
    var temp = $('#520');
    audio = temp[0];
    temp.find('source')[0].src = './song?ye=' + url;
    audio.src = './song?ye=' + url;
    audio.load();
    audio.volume = vol || 0.5;
    audio.oncanplaythrough = cb;
    audio.onerror = errcb;
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
    }, function(){
      emit("songfail");
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
  var msgBoxT;
  var uuid;

  function addmessage(data){
    var msgbox = msgBoxT.clone().appendTo(messages);
    var msg = msgbox.find(".msg");
    msg.find('.msgtxt').text((!data.isMiku ? data.name : "") +": " + data.content);
    msg.addClass(data.uuid === uuid ? "mine" : "notmine");
    if (data.isMiku){
      msg.addClass("mikumsg");
      msg.find(".mikuChib").show();
    }
    messages.scrollTop(messages[0].scrollHeight);
  }
  function handleMessage(){
    var content = msgspot.val();
    if (content[0] === '/'){
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
    msgBoxT = $(".template").find(".msgbox");
    emit = spec.emit;
    on  = spec.on;
    on("uuid", function(data){uuid = data });
    on("new message", addmessage);
    msgspot.keypress(function(event){
      if (event.which === 13){
        event.preventDefault();
        handleMessage();
      }
    });
  }

  return {
    init:init
  }

}();

var Kevin = function(){
  var emit;
  var malspot;
  var updatespot;
  var validBtns;

  function handleMessage(content){
    if (content && validBtns.includes(content)) {
      if (content === "join"){
        content = content + " " + (User.name() || "no_name®");
      }
      else if (content === "update"){
        content = content + " " + updatespot.val();
      }

      emit("command", {
        content: content,
        mal: malspot.val()
      });
    }
  }

  function init(spec){
    malspot = $("#malspot");
    updatespot = $("#updatespot");
    emit = spec.emit;
    validBtns = ["play", "pause", "next", "answer", "join", "leave", "update"];

    $(".kevBtn").click(function(){
      handleMessage(this.attributes["emitMsg"].value);
    });

    updatespot.keypress(function(event){
      if (event.which === 13){
        event.preventDefault();
        handleMessage("update");
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
      if (event.which === 13){
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

var Counter = function(){
  var usrcount;
  var on;
  function init(spec){
    usrcount = $("#usrcount");
    on = spec.on;
    on("usrcount", function(data){usrcount.text("Users online: " + data);});
  }
  return {
    init : init
  }
}();

var ScoreManager = function (){

  var scoreT;
  var scorecontainer;
  var on;
  var emit;

  var scoreBoxes = [];
  function init(spec){
    scoreT = $(".template").find(".scorebox");
    scorecontainer = $('#scorecontainer');
    on = spec.on;
    emit = spec.emit;

    on('addscore', addscore);
    on('updatescore', updatescore);
    on('removescore', removescore);
    on('removeallscores', removeallscores);
  }

  function removeallscores() {
    scorecontainer.empty();
  }
  function removescore(data){
    scorecontainer.find("div[uuid='"+ data.uuid +"']").remove();
  }

  function updatescore(data){
    scorecontainer.find("div[uuid='"+ data.uuid +"']").find('.playerScore').text(data.score);
  }

  function addscore(data) {
    var scoreBox = scoreT.clone();
    scorecontainer.append(scoreBox);
    scoreBox.find('.playerName').text(data.username);
    scoreBox.find('.playerScore').text(data.score ||  0);
    scoreBox.attr('uuid', data.uuid);
  }

  return {
    init:init,
  };
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
    Kevin.init({
      emit:emitMessage
    });
    AudioManager.init({
      emit:emitMessage,
      on:onMessage
    });
    Counter.init({
      on:onMessage
    });
    ScoreManager.init({
      on:onMessage,
      emit:emitMessage
    });
    onMessage("flush", function(){emitMessage("cutout");});
  }
}

$(Game);
