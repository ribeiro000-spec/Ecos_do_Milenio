// Personagens detalhados (20x30, com sombreamento por borda e contorno colorido). Usado no jogador e nos NPCs.
const SK=['#f6d3b3','#f0c8a0','#d9a679','#b97a4b','#8d5524','#5c3a1e'],HR=['#2b1d12','#6b4423','#a52a1a','#e8c25a','#d9d9d9','#3a6bd1','#2e9c5a','#8e44ad'],
SH=['#c0392b','#2980b9','#27ae60','#8e44ad','#e8e0c0','#e67e22','#d35400','#2c3e50'],PT=['#3b2a1a','#5b6b8a','#8a5a36','#efe8d4','#2c3e50','#4a7a3a'],
LK={sk:1,hr:0,hs:1,sh:1,pt:3,bd:0,rb:0},LC={};
const shd=(c,n)=>{const v=parseInt(c.slice(1),16),f=x=>Math.max(0,Math.min(255,x+n));return '#'+[v>>16&255,v>>8&255,v&255].map(f).map(x=>x.toString(16).padStart(2,'0')).join('')};
function lookSprite(L,dr,fr){L=Object.assign({bd:0,rb:0},L);const key=[L.sk,L.hr,L.hs,L.sh,L.pt,L.bd,L.rb,dr,fr].join();if(LC[key])return LC[key];
 const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
 if(dr==2){const t=lookSprite(L,1,fr),c=mk(22,32),e=c.getContext('2d');e.scale(-1,1);e.drawImage(t,-22,0);return LC[key]=c}
 const o=mk(20,30),d=o.getContext('2d'),R=(c,x,y,w,h)=>{d.fillStyle=c;d.fillRect(x,y,w,h)},sk=SK[L.sk],sd=shd(sk,-34),hr=HR[L.hr],hl=shd(hr,45),hd=shd(hr,-30),sc=SH[L.sh],pc=PT[L.pt],GD='#e0b040',TL='#2fa0a0',
 hs=L.hs,b=fr?1:0,l1=fr==1?1:0,l2=fr==2?1:0,side=dr==1,bk=dr==3,Y=b?-0:0;
 // pernas e sandálias
 if(!side){R(sk,6,22,3,6-l1);R(sk,11,22,3,6-l2);R('#6b4423',5,27-l1,4,2);R('#6b4423',11,27-l2,4,2)}else{R(sd,9,22,3,6-l2);R(sk,8,22,3,6-l1);R('#6b4423',6+(fr==1?1:0),27,6,2)}
 // saiote (shendyt) ou túnica longa
 const kb=L.rb?27:24;
 if(!side){R(pc,5,18,10,kb-18);R(shd(pc,-40),5,kb-1,10,1);for(let x=7;x<15;x+=3)R(shd(pc,-26),x,19,1,kb-19);R(shd(pc,25),5,18,10,1)}else{R(pc,6,18,8,kb-18);R(shd(pc,-40),6,kb-1,8,1);R(shd(pc,-26),9,19,1,kb-19)}
 // tronco, colar usekh, cinto
 if(!side){R(sc,5,11,10,7);R(sc,4,11,12,2);R(shd(sc,-35),5,16,10,1);if(!bk){R(GD,7,11,6,1);R(TL,8,12,4,1);R(GD,9,13,2,1);R(shd(sc,35),6,14,2,2)}else R(shd(sc,-25),9,12,2,5);R(GD,5,17,10,1);R('#fff2a0',9,17,2,1)}
 else{R(sc,7,11,7,7);R(shd(sc,-35),7,16,7,1);R(GD,8,11,4,1);R(TL,8,12,3,1);R(GD,7,17,7,1)}
 // braços (manga + antebraço + braçadeira)
 const a1=fr==1?-1:fr==2?1:0;
 if(!side){R(sc,3,12+a1,2,4);R(sk,3,16+a1,2,3);R(GD,3,16+a1,2,1);R(sc,15,12-a1,2,4);R(sk,15,16-a1,2,3);R(GD,15,16-a1,2,1)}else{R(sc,9+a1,12,3,4);R(sk,9+a1,16,3,3);R(GD,9+a1,16,3,1)}
 // cabeça
 R(sd,9,10,2,1);
 if(!side){R(sk,5,3,10,7);R(sk,6,2,8,1);R(sd,6,10,8,1);R(sk,4,6,1,2);R(sk,15,6,1,2)}else{R(sk,5,3,9,7);R(sk,6,2,7,1);R(sd,6,10,6,1);R(sd,4,6,1,2);R(sk,11,6,2,2)}
 // cabelo
 const HS=[null,[3,2],[3,1,'s'],[3,12],[3,2,'b'],[4,10,'g'],[4,12,'r'],[3,5]][hs];
 if(HS){const hc=HS[2]=='r'?'#2a4fb0':hr,cap=HS[0],sl=HS[1];
  if(bk)R(hc,4,1,12,9+(sl>9?sl-9:0));else if(side){R(hc,5,1,9,cap);R(hc,10,1+cap,4,sl)}else{R(hc,4,1,12,cap);R(hc,4,1+cap,2,sl);R(hc,14,1+cap,2,sl)}
  R(HS[2]=='r'?'#4a7fe0':hl,6,1,5,1);R(HS[2]=='r'?'#1a3a80':hd,5,cap,8,1);
  if(HS[2]=='s')[5,8,11,14].forEach(x=>R(hr,x,0,2,2));if(HS[2]=='b')R(hr,8,0,4,2);
  if(HS[2]=='g'){R(GD,4,8,2,1);R(GD,14,8,2,1)}
  if(HS[2]=='r'){R(GD,4,3,12,1);R(GD,4,5,12,1);if(!bk)R(GD,9,1,2,2);R(GD,4,9,2,1);R(GD,14,9,2,1)}}
 // rosto
 if(!bk){const ey=side?[6]:[7,12];ey.forEach(x=>{R('#fff',x,6,2,2);R('#1b1b2a',x+(side?0:1),6,1,2);R(hd,x,5,2,1)});
  R('#1b1b2a',side?5:6,7,1,1);if(!side)R('#1b1b2a',14,7,1,1);R('#a0523c',side?6:9,9,2,1);if(!side){R('#e8907a',6,8,1,1);R('#e8907a',13,8,1,1)}
  if(L.bd)R(L.hr==4||hs==7?'#d9d9d9':hr,side?5:7,10,side?5:6,L.bd==2?4:2)}
 // sombreamento por borda
 const id=d.getImageData(0,0,20,30),P=id.data,Q=new Uint8ClampedArray(P),at=(x,y)=>x<0||y<0||x>19||y>29?-1:(y*20+x)*4,
 df=(i,j)=>j<0||P[j+3]==0||Math.abs(P[i]-P[j])+Math.abs(P[i+1]-P[j+1])+Math.abs(P[i+2]-P[j+2])>34;
 for(let y=0;y<30;y++)for(let x=0;x<20;x++){const i=at(x,y);if(!P[i+3])continue;let m=1.08-.22*y/30;if(df(i,at(x-1,y-1)))m+=.2;else if(df(i,at(x+1,y+1)))m-=.28;for(let c=0;c<3;c++)Q[i+c]=Math.min(255,P[i+c]*m)}
 // contorno colorido (escurece a cor vizinha)
 const out=mk(22,32),e=out.getContext('2d'),O=e.createImageData(22,32),S=(x,y)=>x<0||y<0||x>19||y>29?-1:(y*20+x)*4;
 for(let y=0;y<32;y++)for(let x=0;x<22;x++){const sx=x-1,sy=y-1,i=S(sx,sy),k=(y*22+x)*4;
  if(i>=0&&Q[i+3]){O.data.set([Q[i],Q[i+1],Q[i+2],255],k)}
  else{const nb=[S(sx-1,sy),S(sx+1,sy),S(sx,sy-1),S(sx,sy+1)].find(j=>j>=0&&Q[j+3]);if(nb!=null)O.data.set([Q[nb]*.28,Q[nb+1]*.25,Q[nb+2]*.3,255],k)}}
 e.putImageData(O,0,0);return LC[key]=out}
