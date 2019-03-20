
const got = require('got');


var SongPicker = function(){
  var animes;
  var animesFull;
  var mal;
  function getList(){
    return got('https://api.jikan.moe/v3/user/'+ (mal || 'nesaan') +'/animelist/completed', { json: true }).then(response => {
      animes = response.body.anime;
      return got('https://api.jikan.moe/v3/user/'+ (mal || 'nesaan') +'/animelist/watching', { json: true });
    }).then(response => {
      animes = animes.concat(response.body.anime);
    }).then(() => {
      animesFull = animes.slice();
    });
  }

  function randomAnime(){
    var index = Math.floor(Math.random()*animes.length);
    var anime = animes[index];
    console.log(anime.title);
    animes.splice(index, 1);
    if (animes.length == 0){
      animes = animesFull ? animesFull.slice() : null;
      console.log("finished all the anime");
    }
    return getLink(anime);
  }

  function randomOP(openings, title){
    var opening = openings[Math.floor(Math.random()*openings.length)];
    console.log(opening.links[0]);
    if (!opening || !opening.links || opening.links[0] == "https:\/\/youtube.com\/?op"){
      return Promise.reject("Bad Link");
    }
    else{
      return {
        url:opening.links[0],
        op: opening.title,
        anime: title
      };
    }
  }

  function getLink(anime){
    var link = "https://openings.ninja/api/anime/" + anime.title.replace("/", "");
    console.log(link);
    return got(link, { json: true }).then(response => {
      openings = response.body.openings;
      return randomOP(openings, response.body.title);
    });
  }

  function getNextUrl(malU){
    if (!animes || (mal !== malU)){
      mal = malU;
      return getList().then(() => {
        return randomAnime();
      });
    }
    else{
      return randomAnime();
    }
  }

  return {getNextUrl : getNextUrl};
}();

module.exports = SongPicker;
