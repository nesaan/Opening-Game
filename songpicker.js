
const got = require('got');


var SongPicker = function(){
  var animes;
  var animesFull;
  var mal;
  function getList(cb, errcb){
    got('https://api.jikan.moe/v3/user/'+ (mal || 'nesaan') +'/animelist/completed', { json: true }).then(response => {
      animes = response.body.anime;
      return got('https://api.jikan.moe/v3/user/'+ (mal || 'nesaan') +'/animelist/watching', { json: true });
    }).then(response => {
      animes = animes.concat(response.body.anime);
    }).then(() => {
      animesFull = animes.slice();
      cb();
    }).catch(error => {
      errcb();
    });
  }

  function randomAnime(cb, errcb){
    var index = Math.floor(Math.random()*animes.length);
    var anime = animes[index];
    console.log(anime.title);
    animes.splice(index, 1);
    if (animes.length == 0){
      animes = animesFull ? animesFull.slice() : null;
      console.log("finished all the anime");
    }
    getLink(anime, cb,errcb);
  }

  function randomOP(openings, cb, errcb, title){
    var opening = openings[Math.floor(Math.random()*openings.length)];
    console.log(opening.links[0]);
    if (!opening || !opening.links || opening.links[0] == "https:\/\/youtube.com\/?op"){
      errcb();
    }
    else{
      cb({
        url:opening.links[0],
        op: opening.title,
        anime: title
      });
    }
  }

  function getLink(anime, cb, errcb){
    var link = "https://openings.ninja/api/anime/" + anime.title.replace("/", "");
    console.log(link);
    got(link, { json: true }).then(response => {
      openings = response.body.openings;
      randomOP(openings, cb, errcb, response.body.title);
    }).catch(error => {
      errcb();
    });
  }

  function getNextUrl(cb, malU, errcb){
    if (!animes || (mal !== malU)){
      mal = malU;
      getList(function(){
        randomAnime(cb, errcb);
      }, errcb);
    }
    else{
      randomAnime(cb, errcb);
    }
  }

  return {getNextUrl : getNextUrl};
}();

module.exports = SongPicker;
