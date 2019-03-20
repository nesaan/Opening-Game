var PlayerManager = function (){
  var players;
  function init(){
    players = {};
  }

  function join(socket, uuid, name){

    if (players[uuid]){
      return;
    }

    for (var playKey in players.keys()){
      var player = players[playKey];
      socket.emit('addscore', {
        uuid:playKey,
        score:player.score,
        username:player.username
      });

      player.socket.emit('addscore',  {
        uuid:uuid,
        username:name,
        score:0
      });
    }

    socket.emit('addscore', {
      uuid:uuid,
      score:0,
      username:name
    });

    players[uuid] = {
      username:name,
      score:0,
      socket:socket
    };
  }

  function remove(uuid){
    if (players[uuid]){
      for (var playKey in players.keys()){
          players[playKey].socket.emit('removescore', {
            uuid:uuid
          });
      }
      players[uuid].socket.emit('removeallscores');
      delete players[uuid];
    }
  }

  function update(uuid, score){
    if (players[uuid]){
      for (var playKey in players.keys()){
        players[playKey].socket.emit('updatescore', {
          uuid:uuid,
          score:score
        });
      }
      players[uuid].score = score;
    }
  }

  return {
    update:update,
    remove:remove,
    join:join,
    init:init
  };
}();

module.exports = PlayerManager;
