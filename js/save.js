const Save={key:'ecos_save',
blank(){return{saveVersion:1,player:{name:'Aventureiro',appearance:0,coins:300,stars:0,mapId:'aldeia_inicial',x:5,y:8,dir:'down'},collection:{},deck:[],items:{},story:{currentChapter:'prologo',defeatedChampions:[],events:{},godAssignment:null}}},
write(s){try{localStorage.setItem(this.key,JSON.stringify(s));return true}catch(e){return false}},
read(){try{const s=JSON.parse(localStorage.getItem(this.key));return s&&s.saveVersion===1?s:null}catch(e){return null}},
exportFile(s){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(s,null,1)],{type:'application/json'}));a.download='ecos-save.json';a.click()},
importFile(f,cb){if(!f)return;const r=new FileReader();r.onload=()=>{try{const s=JSON.parse(r.result);if(s.saveVersion===1&&s.player&&s.story)cb(s)}catch(e){}};r.readAsText(f)}};
