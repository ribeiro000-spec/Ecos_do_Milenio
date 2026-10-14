const W=30,H=20,T=16,COLS=['#c0392b','#2980b9','#27ae60','#8e44ad'],DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function person(c,x,y,col,dir,s){c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+3,y+18,10,3);c.fillStyle='#2b1d12';c.fillRect(x+4+(s?1:0),y+16,3,3);c.fillRect(x+9-(s?1:0),y+16,3,3);
 c.fillStyle=col;c.fillRect(x+3,y+9,10,8);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(x+3,y+9,10,2);c.fillStyle='#f0c8a0';c.fillRect(x+4,y+2,8,8);
 c.fillStyle='#2b1d12';c.fillRect(x+3,y+1,10,4);if(dir!='up'){c.fillRect(x+5,y+6,1,2);c.fillRect(x+10,y+6,1,2)}}
const World={rows:[],npcs:[],show:false,prompt:false,col:COLS[0],p:{x:5,y:8,fx:5,fy:8,dir:'down',t:0},
load(m){this.rows=m.rows.map(r=>r.padEnd(W,'.').slice(0,W));this.npcs=m.npcs},
set(p){Object.assign(this.p,{x:p.x,y:p.y,fx:p.x,fy:p.y,dir:p.dir||'down',t:0});this.col=COLS[p.appearance||0];this.show=true},
solid(x,y){return x<0||y<0||x>=W||y>=H||'#~HD'.includes(this.rows[y][x])||this.npcs.some(n=>n.x==x&&n.y==y)},
facing(){const d=DIRS[this.p.dir];return this.npcs.find(n=>n.x==this.p.x+d[0]&&n.y==this.p.y+d[1])},
update(keys){const p=this.p;
 if(p.t>0){p.t=Math.max(0,p.t-.1);return false}
 for(const k in DIRS)if(keys[k]){p.dir=k;const x=p.x+DIRS[k][0],y=p.y+DIRS[k][1];
  if(!this.solid(x,y)){p.fx=p.x;p.fy=p.y;p.x=x;p.y=y;p.t=1;return true}break}
 return false},
draw(c,t){const R=this.rows;t=t||0;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ch=R[y][x],X=x*T,Y=y*T,up=R[y-1]&&R[y-1][x];
  const grass=()=>{c.fillStyle=(x+y)%2?'#5b9a3c':'#5fa03f';c.fillRect(X,Y,T,T);if((x*7+y*13)%5==0){c.fillStyle='#4c8532';c.fillRect(X+4,Y+6,2,2);c.fillRect(X+11,Y+12,2,2)}
   if((x*11+y*5)%17==0){c.fillStyle='#f6d743';c.fillRect(X+9,Y+4,2,2);c.fillStyle='#e8546b';c.fillRect(X+3,Y+11,2,2)}};
  if(ch==','){c.fillStyle='#dcbc7c';c.fillRect(X,Y,T,T);c.fillStyle='#c9a45f';c.fillRect(X,Y+15,T,1);if((x*5+y*3)%4==0)c.fillRect(X+5,Y+8,3,1)}
  else if(ch=='~'){c.fillStyle='#2e9fa6';c.fillRect(X,Y,T,T);c.fillStyle='#6fd1cf';c.fillRect(X+((x*3+(t/300|0))%4)*3,Y+5+(y%2)*5,4,1);if(up!='~'){c.fillStyle='#bfe9e4';c.fillRect(X,Y,T,2)}}
  else if(ch=='#'){grass();c.fillStyle='#7a5230';c.fillRect(X+7,Y+6,2,10);c.fillStyle='#2f7a2a';c.fillRect(X+2,Y+2,12,3);c.fillRect(X+4,Y,8,3);c.fillRect(X,Y+4,16,2);c.fillStyle='#4aa23c';c.fillRect(X+5,Y+1,6,1)}
  else if(ch=='H'||ch=='D'){c.fillStyle='#b5835a';c.fillRect(X,Y,T,T);c.fillStyle='#a07048';c.fillRect(X,Y+7,T,1);c.fillRect(X+8,Y,1,7);
   if(up!='H'&&up!='D'){c.fillStyle='#8a5a36';c.fillRect(X,Y,T,5);c.fillStyle='#6f4527';c.fillRect(X,Y+4,T,1)}
   else if(ch=='H'&&x%2){c.fillStyle='#3b2615';c.fillRect(X+4,Y+3,8,8);c.fillStyle='#8fd3ef';c.fillRect(X+5,Y+4,6,6)}
   if(ch=='D'){c.fillStyle='#4a2f1b';c.fillRect(X+4,Y+4,8,12);c.fillStyle='#d9a93c';c.fillRect(X+10,Y+10,1,1)}}
  else grass()}
 const fp=this.facing();
 this.npcs.forEach(n=>{person(c,n.x*T,n.y*T-4+((t/500|0)%2&&n.x%2?1:0),n.color,n.dir||'down',0);
  if(this.prompt&&fp===n){c.fillStyle='#fff';c.fillRect(n.x*T+5,n.y*T-12,6,7);c.fillStyle='#000';c.fillRect(n.x*T+7,n.y*T-11,2,3);c.fillRect(n.x*T+7,n.y*T-7,2,1)}});
 if(this.show){const p=this.p,bob=p.t>.25&&p.t<.75?1:0;person(c,(p.x+(p.fx-p.x)*p.t)*T,(p.y+(p.fy-p.y)*p.t)*T-4-bob,this.col,p.dir,p.t>0&&p.t<.5)}}};
