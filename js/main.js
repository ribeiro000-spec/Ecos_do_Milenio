const D={},KM={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'},keys={},gpb={};
let S=null,mode='title',dlg=null,nav=null,OPT={},lastMode;
try{OPT=JSON.parse(localStorage.getItem('ecos_opt'))||{}}catch(e){}
const $=id=>document.getElementById(id),ui=$('ui'),cx=$('cv').getContext('2d'),
card=id=>D.cards.find(c=>c.id==id),esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'),
expand=o=>Object.entries(o).flatMap(([k,n])=>Array(n).fill(k)),
exOf=()=>Object.entries(S.collection).filter(([k])=>card(k).fusion).flatMap(([k,n])=>Array(Math.min(3,n)).fill(k)).slice(0,15),
saveOpt=()=>{try{localStorage.setItem('ecos_opt',JSON.stringify(OPT))}catch(e){}document.documentElement.style.setProperty('--ps',OPT.ps||1)},
fs=()=>{const d=document,e=d.documentElement;try{if(d.fullscreenElement||d.webkitFullscreenElement)(d.exitFullscreen||d.webkitExitFullscreen).call(d);
 else{(e.requestFullscreen||e.webkitRequestFullscreen).call(e);if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})}}catch(x){}},
goFS=()=>{if(OPT.fs!==false&&!document.fullscreenElement&&!document.webkitFullscreenElement)fs()},
closeP=()=>{mode='world';ui.innerHTML=''};
saveOpt();
async function boot(){const n=['cards','decks','duelists','maps'];
 const r=await Promise.all(n.map(x=>fetch('./data/'+x+'.json').then(r=>r.json())));
 n.forEach((x,i)=>D[x]=r[i]);World.load(D.maps[0]);title();requestAnimationFrame(loop)}
boot().catch(()=>ui.innerHTML='<div class=menu><p>Não foi possível carregar os dados.<br>Abra o jogo por um servidor (GitHub Pages ou <code>python -m http.server</code>).</p></div>');

// ---------- menus ----------
function menuList(el,items){el.innerHTML=items.map((x,i)=>`<button class=mi ${x[2]?'disabled':''}>${x[0]}</button>`).join('');
 const bs=[...el.children];let i=Math.max(0,bs.findIndex(b=>!b.disabled));const sel=k=>{i=k;bs.forEach((b,j)=>b.classList.toggle('on',j==k))};sel(i);
 bs.forEach((b,j)=>{b.onmouseenter=()=>{if(!b.disabled)sel(j)};b.onclick=()=>items[j][1]()});
 nav={mv:d=>{let k=i;do k=(k+d+bs.length)%bs.length;while(bs[k].disabled);sel(k)},go:()=>items[i][1]()}}
function title(){mode='title';World.show=false;const has=!!Save.read();
 ui.innerHTML=`<div class=tt><h1 class=ttl>ECOS DO<br>MILÊNIO</h1><div class=sub>Duel Monsters RPG</div><div class=tm id=tm></div><div class=ft>Ecos do Milênio · fan game · use ↑ ↓ e Enter, ou toque</div><input type=file id=imp accept=.json hidden></div>`;
 menuList($('tm'),[['Nova Jornada',()=>{goFS();editor(false)}],['Continuar',()=>{goFS();start(Save.read())},!has],['Instruções',help],['Opções',()=>{nav=null;ui.innerHTML='<div class=tt><div class=pap2 id=ob></div></div>';optsBlock($('ob'),()=>{})}],['Importar save',()=>$('imp').click()]]);
 $('imp').onchange=e=>Save.importFile(e.target.files[0],s=>{Save.write(s);title()})}
function help(){nav=null;ui.innerHTML=`<div class=tt><div class=pap2><h2>Instruções</h2><ul><li><b>Andar:</b> setas/WASD ou joystick na tela. <b>Correr:</b> Shift ou botão »</li><li><b>Interagir:</b> Espaço/Enter/E ou botão A</li><li><b>Menu:</b> Esc/M ou botão ☰ · <b>Tela cheia:</b> F ou botão ⛶</li><li><b>Controle (gamepad):</b> direcional/analógico, A interage, B corre, Start abre o menu</li><li><b>Duelo:</b> selecione a carta, escolha a ação, avance pelas fases e vença zerando os LP do rival.</li></ul><button id=bk3>Voltar</button></div></div>`;$('bk3').onclick=title}
function optsBlock(el,rd){const a=[.8,1,1.3],nm=['Pequeno','Médio','Grande'];
 el.innerHTML=`<button id=o1>Tela cheia (alternar)</button><button id=o2>Botões de toque: ${nm[a.indexOf(OPT.ps||1)]||'Médio'}</button><button id=o3>Abrir em tela cheia: ${OPT.fs===false?'não':'sim'}</button>${rd?'':''}<button id=o4>Voltar</button>`;
 $('o1').onclick=fs;$('o2').onclick=()=>{OPT.ps=a[(a.indexOf(OPT.ps||1)+1)%3];saveOpt();optsBlock(el,rd)};$('o3').onclick=()=>{OPT.fs=OPT.fs===false;saveOpt();optsBlock(el,rd)};
 $('o4').onclick=()=>mode=='pause'?pause('col'):title()}

// ---------- editor de personagem ----------
function editor(edit){mode='create';let L={...(edit?S.player.look:LK)},tab='hr',dr=0,nm=edit?S.player.name:'Aventureiro';
 const PAL={hr:HR,sk:SK,sh:SH,pt:PT},TN={hr:'Cabelo',sk:'Pele',sh:'Camisa',pt:'Calça'};
 const paint=()=>{ui.innerHTML=`<div class=ce><div class=ctop><button class=rd id=bk2>✕</button>Personagem</div>
 <div class=cbar><span class=cl>Cores<br>${TN[tab]}</span>${PAL[tab].map((c,i)=>`<i class="sw2 ${L[tab]==i?'on':''}" data-c=${i} style="background:${c}"></i>`).join('')}</div>
 <canvas id=pv class=pv width=18 height=26></canvas>
 <div class=ctab>${Object.keys(TN).map(k=>`<button class="tb ${k==tab?'on':''}" data-t=${k}>${TN[k]}</button>`).join('')}</div>
 <div class=cgr>${[0,1,2,3,4,5].map(i=>`<canvas width=18 height=26 class="ho ${L.hs==i?'on':''}" data-h=${i}></canvas>`).join('')}</div>
 <div class=cft><input id=nm maxlength=12 value="${esc(nm)}"><button id=gr>Girar ⟳</button><button id=go>Pronto ▶</button></div></div>`;
  $('pv').getContext('2d').drawImage(lookSprite(L,dr,0),0,0);ui.querySelectorAll('.ho').forEach(c=>c.getContext('2d').drawImage(lookSprite({...L,hs:+c.dataset.h},0,0),0,0));
  ui.querySelectorAll('[data-c]').forEach(e=>e.onclick=()=>{L[tab]=+e.dataset.c;paint()});ui.querySelectorAll('[data-t]').forEach(e=>e.onclick=()=>{tab=e.dataset.t;paint()});
  ui.querySelectorAll('.ho').forEach(e=>e.onclick=()=>{L.hs=+e.dataset.h;paint()});$('nm').oninput=e=>nm=e.target.value;$('gr').onclick=()=>{dr=(dr+1)%4;paint()};
  $('bk2').onclick=()=>edit?pause('pf'):title();
  $('go').onclick=()=>{const n=nm.trim()||'Aventureiro';if(edit){S.player.look=L;S.player.name=n;World.set(S.player);Save.write(S);pause('pf')}else pickDeck(n,L)}};paint()}
function pickDeck(name,L){mode='deck';
 ui.innerHTML=`<div class=menu><h2>Escolha seu primeiro deck</h2>${D.decks.map(d=>`<button class=dk data-id=${d.id}><b>${d.name}</b><br><small>${d.desc}</small></button>`).join('')}</div>`;
 ui.querySelectorAll('.dk').forEach(b=>b.onclick=()=>{const d=D.decks.find(x=>x.id==b.dataset.id),s=Save.blank();
  Object.assign(s.player,{name,look:L,x:23,y:17});s.deck=expand(d.cards);s.collection={...d.cards};s.story.events.starterDeck=d.id;Save.write(s);start(s,true)})}

// ---------- jogo ----------
function start(s,intro){S=s;nav=null;if(!s.player.look)s.player.look={...LK,sh:s.player.appearance||1};
 if(!s.story.events.kit){s.story.events.kit=1;[['SP010',2],['DM001',1],['DM024',1],['F004',1]].forEach(([k,n])=>s.collection[k]=(s.collection[k]||0)+n)}
 World.load(D.maps[0]);if(World.solid(s.player.x,s.player.y)){s.player.x=23;s.player.y=17}
 Save.write(s);World.set(s.player);mode='world';ui.innerHTML='';if(intro)say('Mestre Ptahor',D.maps[0].intro)}
function say(w,l,done){dlg={w,done,l:l.map(t=>t.replaceAll('{n}',esc(S.player.name)))};mode='dialog';nextD()}
function nextD(){if(!dlg.l.length){const d=dlg.done;dlg=null;mode='world';ui.innerHTML='';return d&&d()}
 ui.innerHTML=`<div class=dlg><b>${dlg.w}</b>${dlg.l.shift()}</div>`}
function act(){if(mode=='dialog')return nextD();if(mode!='world')return;const n=World.facing();if(!n)return;
 const won=n.duel&&S.story.events['won_'+n.duel];
 if(n.duel&&!won)say(n.name,n.pre,()=>duel(n.duel));else say(n.name,won?n.post:n.lines)}
function duel(id){const d=D.duelists[id];mode='battle';
 startBattle({n:S.player.name,deck:S.deck,extra:exOf()},{n:d.name,deck:Ai.build(d.power),extra:Ai.extra(d.power)},d.ai,win=>{mode='world';ui.innerHTML='';let m;
  const h=S.story.history=S.story.history||[];h.unshift({foe:d.name,win,turns:B.n});h.length=Math.min(h.length,10);
  if(win){const pool=Ai.pool(d.power),c=pool[Math.random()*pool.length|0];S.player.coins+=d.coins;S.story.events['won_'+id]=1;S.collection[c.id]=(S.collection[c.id]||0)+1;m=`Você venceu! +${d.coins} moedas e a carta ${c.name}.`}
  else{const l=Math.min(d.loss,S.player.coins);S.player.coins-=l;m=`Você perdeu o duelo. -${l} moedas. Tente de novo!`}
  Save.write(S);say('',[m])})}

// ---------- menu de pausa (papiro) ----------
function pause(tab){mode='pause';tab=tab||'col';
 const have=Object.keys(S.collection).sort((a,b)=>card(a).type.localeCompare(card(b).type)||a.localeCompare(b)),n=Object.values(S.collection).reduce((a,b)=>a+b,0),
 TB=[['col','🃏','Coleção'],['dk','📜','Deck'],['pf','🧿','Perfil'],['op','⚙️','Opções'],['sv','💾','Sistema']];
 ui.innerHTML=`<div class=pw><div class=hdr><span class=coin>● ${S.player.coins}</span><span class=coin>🃏 ${n}</span><span class=hg>☥ ◈ ☀ ◈ ☥</span></div>
<div class=pbody><div class=pmain id=pm></div><div class=pside><div class=pins id=pins><small>Passe o mouse/toque numa carta.</small></div><canvas id=pp width=18 height=26></canvas></div></div>
<div class=ptabs>${TB.map(t=>`<button class="pt ${t[0]==tab?'on':''}" data-t=${t[0]}>${t[1]}<small>${t[2]}</small></button>`).join('')}<button class=pt id=px>🚪<small>Fechar</small></button></div></div>`;
 const pm=$('pm');$('pp').getContext('2d').drawImage(lookSprite(S.player.look,0,0),0,0);
 ui.querySelectorAll('.pt[data-t]').forEach(b=>b.onclick=()=>pause(b.dataset.t));$('px').onclick=closeP;
 if(tab=='col')pm.innerHTML=have.map(i=>`<div class=ct data-c=${i}><div class=cw>${cardEl(card(i))}</div><b>×${S.collection[i]}</b></div>`).join('');
 if(tab=='dk'){const dc={};S.deck.forEach(i=>dc[i]=(dc[i]||0)+1);const ids=have.filter(i=>!card(i).fusion),tot=()=>Object.values(dc).reduce((a,b)=>a+b,0);
  const dp=()=>{const sc=pm.scrollTop;pm.innerHTML=`<div class=dkh><b>Deck ${tot()}/40</b> (máx. 3 cópias; fusões vão ao Extra Deck)<button id=sd ${tot()==40?'':'disabled'}>Salvar deck</button></div>`+ids.map(i=>`<div class=ct data-c=${i}><div class=cw>${cardEl(card(i))}</div><div><button data-i=${i} data-d=-1>−</button> ${dc[i]||0}/${S.collection[i]} <button data-i=${i} data-d=1>+</button></div></div>`).join('');pm.scrollTop=sc;
   pm.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const i=b.dataset.i,k=(dc[i]||0)+ +b.dataset.d;if(k>=0&&k<=Math.min(3,S.collection[i]))dc[i]=k;dp()});
   $('sd').onclick=()=>{S.deck=expand(dc);Save.write(S);$('sd').textContent='Salvo!'}};dp()}
 if(tab=='pf'){pm.innerHTML=`<div class=dkh><b>${esc(S.player.name)}</b></div><p>Moedas: ${S.player.coins} · Cartas: ${n}<br>Histórico:<br>${(S.story.history||[]).slice(0,5).map(x=>`${x.win?'Vitória':'Derrota'} vs ${x.foe} (${x.turns} turnos)`).join('<br>')||'—'}</p><button id=ea>Editar aparência</button>`;$('ea').onclick=()=>editor(true)}
 if(tab=='op')optsBlock(pm);
 if(tab=='sv'){pm.innerHTML='<button id=s1>Salvar</button><button id=s2>Exportar save</button><button id=s3>Menu inicial</button>';
  $('s1').onclick=()=>{$('s1').textContent=Save.write(S)?'Salvo!':'Falha ao salvar'};$('s2').onclick=()=>Save.exportFile(S);$('s3').onclick=()=>{Save.write(S);title()}}}

// ---------- controles ----------
const kk=e=>KM[e.key]||KM[e.key.toLowerCase()];
addEventListener('keydown',e=>{const k=kk(e);if(mode=='world'&&k){keys[k]=true;e.preventDefault()}
 if(e.key=='Shift')keys.run=true;
 if(mode=='title'&&nav){if(e.key=='ArrowUp'||e.key=='ArrowDown'){e.preventDefault();nav.mv(e.key=='ArrowUp'?-1:1)}if(e.key=='Enter'){e.preventDefault();nav.go()}}
 if([' ','Enter','e','z'].includes(e.key)&&(mode=='world'||mode=='dialog')){e.preventDefault();if(!e.repeat)act()}
 if(e.key=='Escape'||e.key=='m'){if(mode=='world')pause();else if(mode=='pause')closeP()}
 if(e.key=='f'&&(mode=='world'||mode=='pause'))fs()});
addEventListener('keyup',e=>{const k=kk(e);if(k)keys[k]=false;if(e.key=='Shift')keys.run=false});
const joy=$('joy'),kn=$('knob');let jid=null;
const jm=e=>{const r=joy.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2),m=Math.hypot(dx,dy)||1,k=Math.min(1,m),on=m>.28,h=Math.abs(dx)>Math.abs(dy);
 kn.style.transform=`translate(${dx/m*k*r.width*.3}px,${dy/m*k*r.width*.3}px)`;
 keys.left=on&&h&&dx<0;keys.right=on&&h&&dx>0;keys.up=on&&!h&&dy<0;keys.down=on&&!h&&dy>0},
jend=e=>{if(e.pointerId==jid){jid=null;kn.style.transform='';keys.left=keys.right=keys.up=keys.down=false}};
joy.onpointerdown=e=>{e.preventDefault();jid=e.pointerId;joy.setPointerCapture(jid);jm(e)};joy.onpointermove=e=>{if(e.pointerId==jid)jm(e)};joy.onpointerup=joy.onpointercancel=jend;
$('abtn').onpointerdown=e=>{e.preventDefault();act()};
$('rbtn').onpointerdown=e=>{e.preventDefault();keys.run=true};$('rbtn').onpointerup=$('rbtn').onpointercancel=$('rbtn').onpointerleave=()=>keys.run=false;
$('mbtn').onpointerdown=e=>{e.preventDefault();mode=='world'?pause():mode=='pause'&&closeP()};
$('fsb').onclick=fs;
ui.addEventListener('click',e=>{if(mode=='battle')battleClick(e);else if(mode=='pause'){const c=e.target.closest('[data-c]'),p=$('pins');if(c&&p)p.innerHTML=inspHTML(c.dataset.c)}});
ui.addEventListener('mouseover',e=>{if(mode=='battle')battleHover(e);else if(mode=='pause'){const c=e.target.closest('[data-c]'),p=$('pins');if(c&&p&&c.tagName=='DIV'&&c.classList.contains('ct'))p.innerHTML=inspHTML(c.dataset.c)}});
function gp(){const g=(navigator.getGamepads?[...navigator.getGamepads()]:[]).find(Boolean);if(!g)return{};const a=g.axes,b=i=>g.buttons[i]&&g.buttons[i].pressed;
 [[0,act],[9,()=>mode=='world'?pause():mode=='pause'&&closeP()]].forEach(([i,f])=>{const p=b(i);if(p&&!gpb[i])f();gpb[i]=p});
 return{left:a[0]<-.5||b(14),right:a[0]>.5||b(15),up:a[1]<-.5||b(12),down:a[1]>.5||b(13),run:b(1)}}
const hk=()=>{const g=gp();return{up:keys.up||g.up,down:keys.down||g.down,left:keys.left||g.left,right:keys.right||g.right,run:keys.run||g.run}};

// ---------- cena do menu inicial e loop ----------
const pt=Array.from({length:60},()=>({x:Math.random()*VW,y:Math.random()*VH,v:.3+Math.random()}));
function pyr(c,x0,by,w,h,l,d){c.fillStyle=l;c.beginPath();c.moveTo(x0-w/2,by);c.lineTo(x0,by-h);c.lineTo(x0,by);c.fill();c.fillStyle=d;c.beginPath();c.moveTo(x0+w/2,by);c.lineTo(x0,by-h);c.lineTo(x0,by);c.fill();
 c.fillStyle='rgba(60,30,10,.16)';for(let y=by-5;y>by-h;y-=5){const k=(by-y)/h;c.fillRect(x0-w/2*(1-k),y,w*(1-k),1)}}
function scene(c,t){const g=c.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#0a3f57');g.addColorStop(.7,'#1b7c91');g.addColorStop(1,'#2a95a3');c.fillStyle=g;c.fillRect(0,0,VW,VH);
 pyr(c,232,142,92,72,'#c58a55','#a96b3e');pyr(c,150,150,160,112,'#d9a066','#b57a4a');pyr(c,66,160,124,82,'#e8b57a','#c48a55');
 c.fillStyle='#e3b26e';c.beginPath();c.moveTo(0,VH);for(let x=0;x<=VW;x+=6)c.lineTo(x,156+Math.sin(x/26)*5);c.lineTo(VW,VH);c.fill();
 c.fillStyle='#f0c685';c.beginPath();c.moveTo(0,VH);for(let x=0;x<=VW;x+=6)c.lineTo(x,172+Math.sin(x/18+1)*4);c.lineTo(VW,VH);c.fill();
 c.fillStyle='rgba(255,235,170,.85)';pt.forEach(p=>{p.x=(p.x+p.v*1.6)%VW;p.y=(p.y+p.v*.2)%VH;c.fillRect(p.x,p.y,2,1)})}
function loop(t){const h=hk();
 if(mode!=lastMode){lastMode=mode;document.body.dataset.mode=mode}
 if(mode=='world'&&World.update(h,h.run)){Object.assign(S.player,{x:World.p.x,y:World.p.y,dir:World.p.dir});Save.write(S)}
 if(['title','create','deck'].includes(mode))scene(cx,t);else World.draw(cx,t);
 if(World.show&&['world','dialog','pause'].includes(mode)){cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(3,3,62,11);cx.fillStyle='#f1dfb0';cx.font='8px Georgia';cx.fillText('Moedas: '+S.player.coins,7,11)}
 requestAnimationFrame(loop)}
