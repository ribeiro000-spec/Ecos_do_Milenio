const W=30,H=20,T=16,COLS=['#c0392b','#2980b9','#27ae60','#8e44ad'],DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},
CH=['#c0392b','#2980b9','#27ae60','#8e44ad','#e8e0c0','#e67e22','#d35400','#2c3e50'],DI={down:0,left:1,right:2,up:3},IM={};
['tiles','chars'].forEach(n=>{const i=new Image();i.src='./assets/'+n+'.png';IM[n]=i});
const tile=(c,i,X,Y)=>c.drawImage(IM.tiles,i*16,0,16,16,X,Y,16,16),
spr=(c,col,dir,fr,x,y)=>{c.fillStyle='rgba(0,0,0,.28)';c.fillRect(x+3,y+14,10,3);c.drawImage(IM.chars,(DI[dir]*3+fr)*16,Math.max(0,CH.indexOf(col))*24,16,24,x,y-8,16,24)};
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
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ch=R[y][x],up=R[y-1]&&R[y-1][x],h=up=='H'||up=='D';let i=0;
  if(ch==',')i=2;else if(ch=='~')i=3+((x+y+(t/400|0))%2);else if(ch=='#')i=5;else if(ch=='H')i=h?(x%2?8:6):7;else if(ch=='D')i=9;else i=(x*11+y*5)%17==0?1:0;
  tile(c,i,x*T,y*T);if(ch=='~'&&up!='~')tile(c,10,x*T,y*T)}
 const fp=this.facing();
 this.npcs.forEach(n=>{spr(c,n.color,n.dir||'down',0,n.x*T,n.y*T+((t/500|0)%2&&n.x%2?1:0));
  if(this.prompt&&fp===n){c.fillStyle='#fff';c.fillRect(n.x*T+5,n.y*T-12,6,7);c.fillStyle='#000';c.fillRect(n.x*T+7,n.y*T-11,2,3);c.fillRect(n.x*T+7,n.y*T-7,2,1)}});
 if(this.show){const p=this.p;spr(c,this.col,p.dir,p.t>.5?1:p.t>0?2:0,(p.x+(p.fx-p.x)*p.t)*T,(p.y+(p.fy-p.y)*p.t)*T)}}};
