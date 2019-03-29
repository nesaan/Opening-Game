
const got = require('got');

var SongPicker = function(){
  var mal;
  var animes;
  var fullAnimes;

  function getList(){
    return got('https://themes.moe/api/mal/' + (mal || 'nesaan'), {json:true}).then(response => {
      animes = response.body;
      animes = animes.filter(x => x.watchStatus == 1 || x.watchStatus == 2);
      fullAnimes = animes.slice();
    });
  }

  function randomAnime(){
    var index = Math.floor(Math.random()*animes.length);
    var anime = animes[index];
    animes.splice(index, 0);
    if (animes.length == 0){
      animes = fullAnimes.slice();
    }
    var themes = anime.themes;
    if (!themes) {Promise.reject("no themes");}

    themes = themes.filter(x => x.themeType.startsWith("OP"));
    var themeIndex = Math.floor(Math.random()*themes.length);
    console.log(themes[themeIndex].mirror.mirrorURL);
    return Promise.resolve({
      url: themes[themeIndex].mirror.mirrorURL,
      anime: anime.name,
      op: themes[themeIndex].themeName
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
      return Promise.resolve().then(() => randomAnime());
    }
  }

  return {getNextUrl : getNextUrl};
}();

module.exports = SongPicker;
