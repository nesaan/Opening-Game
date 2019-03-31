
const got = require('got');

var SongPicker = function(){
  var mal;
  var animes;
  var fullAnimes;
  var endings = false;

  function getList(){
    var list = mal ? mal.split(',') : ['nesaan'];
    var curse = Promise.resolve();
    animes = [];
    for (var i = 0; i < list.length; i ++){
      const j = i;
      curse = curse.then(() => {
        return got('https://themes.moe/api/mal/' + list[j], {json:true}).then(response => {
          var temp = response.body;
          temp = temp.filter(x => x.watchStatus == 1 || x.watchStatus == 2);
          animes = animes.concat(temp);
        });
      });
    }
    return curse.then(() =>{
      animes = animes.reduce(elegant);
      fullAnimes = animes.slice();
    });
  }

  function elegant(acc, val){
    if (!Array.isArray(acc)){
      acc = [acc];
    }
    for (var i = 0; i < acc.length; i ++){
      if (acc[i].name === val.name){
        return acc;
      }
    }
    acc.push(val);
    return acc;
  }

  function randomAnime(){
    var index = Math.floor(Math.random()*animes.length);
    var anime = animes[index];
    animes.splice(index, 1);
    if (animes.length == 0){
      animes = fullAnimes.slice();
    }
    var themes = anime.themes;
    if (!themes) {return Promise.reject("no themes");}
    if (!endings){
      themes = themes.filter(x => x.themeType.startsWith("OP"));
    }

    if (themes.length == 0){
      return Promise.reject("no valid themes for " + anime.name);
    }

    var themeIndex = Math.floor(Math.random()*themes.length);
    console.log(anime.name + " " + themes[themeIndex].themeType);
    console.log(themes[themeIndex].mirror.mirrorURL);
    return Promise.resolve({
      url: themes[themeIndex].mirror.mirrorURL,
      anime: anime.name,
      op: themes[themeIndex].themeName
    });
  }


  function getNextUrl(spec){
    endings = spec.endings;
    if (!animes || (mal !== spec.mal)){
      mal = spec.mal;
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
