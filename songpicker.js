
const got = require('got');


var SongPicker = function(){
  var animes;
  var mal;
  function getList(cb){
    got('https://api.jikan.moe/v3/user/'+ (mal || 'nesaan') +'/animelist/completed', { json: true }).then(response => {
      animes = response.body.anime;
      cb();
    }).catch(error => {
      console.log(error.response.body);
    });
  }

  function randomAnime(cb){
    var anime = animes[Math.floor(Math.random()*animes.length)];
    console.log(anime.title);
    getLink(anime, cb);
  }

  function randomOP(openings, cb){
    var opening = openings[Math.floor(Math.random()*openings.length)];
    console.log(opening.links[0]);
    cb(opening.links[0]);
  }

  function getLink(anime, cb){
    console.log('https://openings.ninja/api/anime/' + anime.title);
    got('https://openings.ninja/api/anime/' + anime.title, { json: true }).then(response => {
      openings = response.body.openings;
      randomOP(openings, cb);
    }).catch(error => {
      console.log(error.response);
    });
  }

  function getNextUrl(cb, malU){
    if (!animes || (mal !== malU)){
      mal = malU;
      getList(function(){
        randomAnime(cb);
      });
    }
    else{
      randomAnime(cb);
    }
  }

  return {getNextUrl : getNextUrl};
}();

exports.SongPicker = SongPicker;
