
const got = require('got');


var SongPicker = function(){
  var animes;
  var animesFull;
  var mal;
  var listCatagories = ["watching", "completed"];

  function getListRec(catagories){
    if (!catagories || !catagories.length){
      return Promise.resolve([]);
    }
    else {
      return got('https://api.jikan.moe/v3/user/'+ (mal || 'nesaan') +'/animelist/' + catagories.pop(), { json: true }).then(response => {
        return getListRec(catagories).then(animeslist => {
          return animeslist.concat(response.body.anime);
        });
      });
    }
  }

  function getList(){
    return getListRec(listCatagories.slice()).then(animeslist => {
        animes = animeslist;
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
