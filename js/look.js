// Personagem do jogador: composto por camadas (pele, cabelo, camisa, calça) e desenhado em canvas com contorno.
const SK=['#f6d3b3','#f0c8a0','#d9a679','#b97a4b','#8d5524','#5c3a1e'],HR=['#2b1d12','#6b4423','#a52a1a','#e8c25a','#d9d9d9','#3a6bd1','#2e9c5a','#8e44ad'],
SH=['#c0392b','#2980b9','#27ae60','#8e44ad','#e8e0c0','#e67e22','#d35400','#2c3e50'],PT=['#3b2a1a','#5b6b8a','#8a5a36','#e8e0c0','#2c3e50','#4a7a3a'],
LK={sk:1,hr:0,hs:1,sh:1,pt:0},LC={};
function lookSprite(L,dr,fr){const key=[L.sk,L.hr,L.hs,L.sh,L.pt,dr,fr].join();if(LC[key])return LC[key];
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c},o=mk(16,24),d=o.getContext('2d'),R=(c,x,y,w,h)=>{d.fillStyle=c;d.fillRect(x,y,w,h)},
 sk=SK[L.sk],hr=HR[L.hr],sh=SH[L.sh],pt=PT[L.pt],b=fr?1:0,hs=L.hs,l1=fr==1?1:0,l2=fr==2?1:0;
 R(pt,4,19,3,3-l1);R(pt,9,19,3,3-l2);R('#2b1d12',4,22-l1,3,1);R('#2b1d12',9,22-l2,3,1);
 R(sh,3,11-b,10,8);R('#78501e',3,17-b,10,1);R(sh,2,12-b,1,5);R(sk,2,17-b,1,1);R(sh,13,12-b,1,5);R(sk,13,17-b,1,1);R(sk,4,3-b,8,8);
 if(dr==3){if(hs)R(hr,3,1-b,10,hs==3||hs==5?12:8)}
 else{
  if(hs==1){R(hr,3,1-b,10,3);R(hr,3,4-b,2,2);R(hr,11,4-b,2,2)}
  if(hs==2){R(hr,3,2-b,10,3);R(hr,4,0,2,3);R(hr,7,0,2,3);R(hr,10,0,2,3);R(hr,3,4-b,2,1);R(hr,11,4-b,2,1)}
  if(hs==3){R(hr,3,1-b,10,4);R(hr,3,5-b,2,8);R(hr,11,5-b,2,8)}
  if(hs==4){R(hr,3,1-b,10,3);R(hr,6,0,4,2);R(hr,3,4-b,2,1);R(hr,11,4-b,2,1)}
  if(hs==5){R(hr,3,1-b,10,4);R('#d9a93c',3,3-b,10,1);R(hr,3,5-b,2,7);R(hr,11,5-b,2,7);R('#d9a93c',3,8-b,2,1);R('#d9a93c',11,8-b,2,1)}
  for(const x of dr==0?[5,10]:dr==1?[4]:[11])R('#2b1d12',x,7-b,1,2)}
 const t=mk(16,24),f=t.getContext('2d');f.drawImage(o,0,0);f.globalCompositeOperation='source-in';f.fillStyle='#1e140c';f.fillRect(0,0,16,24);
 const c2=mk(18,26),e=c2.getContext('2d');[[0,1],[2,1],[1,0],[1,2]].forEach(([x,y])=>e.drawImage(t,x,y));e.drawImage(o,1,1);return LC[key]=c2}
