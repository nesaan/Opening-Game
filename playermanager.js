var PlayerManager = function (){
  var players;
  function init(){
    players = [];
  }

  function join(socket, uuid, name){

    if (getIndex(uuid) !== -1){
      return;
    }

    players.forEach((player) => {
      socket.emit('addscore', {
        uuid:player.uuid,
        score:player.score,
        username:player.username
      });

      player.socket.emit('addscore',  {
        uuid:uuid,
        username:name,
        score:0
      });
    });

    socket.emit('addscore', {
      uuid:uuid,
      score:0,
      username:name
    });

    players.push({
      uuid:uuid,
      username:name,
      score:0,
      socket:socket
    });
  }

  function getIndex(uuid){
    for (var i = 0; i < players.length; i++) {
      if (players[i].uuid === uuid){
        return i;
      }
    }
    return -1;
  }

  function remove(uuid){
    var index = getIndex(uuid);
    if (index !== -1){
      players.forEach((player) => {player.socket.emit('removescore', {
        uuid:uuid
      });});

      players[index].socket.emit('removeallscores');
      players.splice(index, 1);
    }
  }

  function update(uuid, score){
    var index = getIndex(uuid);
    if (index !== -1){
      players.forEach((player) => {player.socket.emit('updatescore', {
        uuid:uuid,
        score:score
      });});
      players[getIndex(uuid)].score = score;
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
