const T=16,VW=288,VH=192,DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},
CH=['#c0392b','#2980b9','#27ae60','#8e44ad','#e8e0c0','#e67e22','#d35400','#2c3e50'],DI={down:0,left:1,right:2,up:3},IM={};
['tiles','chars'].forEach(n=>{const i=new Image();i.src='./assets/'+n+'.png';IM[n]=i});
const tile=(c,i,X,Y)=>c.drawImage(IM.tiles,i*16,0,16,16,X,Y,16,16),
shadow=(c,x,y)=>{c.fillStyle='rgba(120,60,40,.3)';c.fillRect(x+3,y+13,10,3)};
const World={rows:[],npcs:[],lg:{},sol:'',w:30,h:20,show:false,prompt:false,look:LK,cam:{x:0,y:0},p:{x:5,y:8,fx:5,fy:8,dir:'down',t:0},
load(m){this.rows=m.rows;this.lg=m.legend;this.sol=m.solid;this.npcs=m.npcs;this.w=m.rows[0].length;this.h=m.rows.length},
set(p){Object.assign(this.p,{x:p.x,y:p.y,fx:p.x,fy:p.y,dir:p.dir||'down',t:0});this.look=p.look||LK;this.show=true},
solid(x,y){return x<0||y<0||x>=this.w||y>=this.h||this.sol.includes(this.rows[y][x])||this.npcs.some(n=>n.x==x&&n.y==y)},
facing(){const d=DIRS[this.p.dir];return this.npcs.find(n=>n.x==this.p.x+d[0]&&n.y==this.p.y+d[1])},
update(k,run){const p=this.p;
 if(p.t>0){p.t=Math.max(0,p.t-(run?.17:.1));return false}
 for(const d in DIRS)if(k[d]){p.dir=d;const x=p.x+DIRS[d][0],y=p.y+DIRS[d][1];
  if(!this.solid(x,y)){p.fx=p.x;p.fy=p.y;p.x=x;p.y=y;p.t=1;return true}break}
 return false},
draw(c,t){t=t||0;const p=this.p,px=(p.x+(p.fx-p.x)*p.t)*T,py=(p.y+(p.fy-p.y)*p.t)*T,cam=this.cam;
 cam.x=Math.round(Math.max(0,Math.min(this.w*T-VW,px+8-VW/2)));cam.y=Math.round(Math.max(0,Math.min(this.h*T-VH,py+8-VH/2)));
 c.save();c.translate(-cam.x,-cam.y);const x0=cam.x/T|0,y0=cam.y/T|0;
 for(let y=y0;y<=y0+VH/T+1&&y<this.h;y++)for(let x=x0;x<=x0+VW/T+1&&x<this.w;x++){const ch=this.rows[y][x],X=x*T,Y=y*T,i=this.lg[ch];
  if(ch=='~'){tile(c,3+((x+y+(t/500|0))%2),X,Y);if(this.rows[y-1]&&this.rows[y-1][x]!='~')tile(c,5,X,Y);continue}
  if(ch==','){tile(c,2,X,Y);continue}
  tile(c,ch==':'||(ch=='.'&&(x*7+y*13)%9==0)?1:0,X,Y);
  if(i!=null&&ch!='.'&&ch!=':')tile(c,ch=='t'?16+(t/200|0)%2:i,X,Y)}
 const fp=this.facing();
 this.npcs.forEach(n=>{const X=n.x*T,Y=n.y*T+((t/500|0)%2&&n.x%2?1:0);shadow(c,X,Y);c.drawImage(IM.chars,DI[n.dir||'down']*3*16,Math.max(0,CH.indexOf(n.color))*24,16,24,X,Y-8,16,24);
  if(this.prompt&&fp===n){c.fillStyle='#fff';c.fillRect(X+5,Y-14,6,7);c.fillStyle='#000';c.fillRect(X+7,Y-13,2,3);c.fillRect(X+7,Y-9,2,1)}});
 if(this.show){shadow(c,px,py);c.drawImage(lookSprite(this.look,DI[p.dir],p.t>.5?1:p.t>0?2:0),px-1,py-9)}
 c.restore()}};
