const D={},KM={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'},keys={};
let S=null,mode='title',dlg=null;
const ui=document.getElementById('ui'),cx=document.getElementById('cv').getContext('2d'),
card=id=>D.cards.find(c=>c.id==id),esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'),
expand=o=>Object.entries(o).flatMap(([k,n])=>Array(n).fill(k));

async function boot(){const n=['cards','decks','duelists','maps'];
 const r=await Promise.all(n.map(x=>fetch('./data/'+x+'.json').then(r=>r.json())));
 n.forEach((x,i)=>D[x]=r[i]);World.load(D.maps[0]);title();requestAnimationFrame(loop)}
boot().catch(()=>ui.innerHTML='<div class=menu><p>Não foi possível carregar os dados.<br>Abra o jogo por um servidor (GitHub Pages ou <code>python -m http.server</code>).</p></div>');

function title(){mode='title';World.show=false;const has=!!Save.read();
 ui.innerHTML=`<div class=menu><h1>ECOS DO MILÊNIO</h1><button id=nw>Nova Jornada</button><button id=ct ${has?'':'disabled'}>Continuar</button><label class=btn>Importar save<input id=im type=file accept=.json hidden></label></div>`;
 nw.onclick=create;ct.onclick=()=>start(Save.read());
 im.onchange=e=>Save.importFile(e.target.files[0],s=>{Save.write(s);title()})}

function create(){mode='create';let ap=0;
 ui.innerHTML=`<div class=menu><h2>Seu aventureiro</h2><input id=nm maxlength=12 value="Aventureiro"><div>${COLS.map((c,i)=>`<i class="sw ${i?'':'on'}" data-i=${i} style="background:${c}"></i>`).join('')}</div><button id=ok>Continuar</button></div>`;
 ui.querySelectorAll('.sw').forEach(s=>s.onclick=()=>{ap=+s.dataset.i;ui.querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x==s))});
 ok.onclick=()=>pickDeck(nm.value.trim()||'Aventureiro',ap)}

function pickDeck(name,ap){mode='deck';
 ui.innerHTML=`<div class=menu><h2>Escolha seu primeiro deck</h2>${D.decks.map(d=>`<button class=dk data-id=${d.id}><b>${d.name}</b><br><small>${d.desc}</small></button>`).join('')}</div>`;
 ui.querySelectorAll('.dk').forEach(b=>b.onclick=()=>{const d=D.decks.find(x=>x.id==b.dataset.id),s=Save.blank();
  Object.assign(s.player,{name,appearance:ap});s.deck=expand(d.cards);s.collection={...d.cards};s.story.events.starterDeck=d.id;Save.write(s);start(s,true)})}

function start(s,intro){S=s;World.set(s.player);mode='world';ui.innerHTML='';if(intro)say('Mestre Ptahor',D.maps[0].intro)}

function say(w,l,done){dlg={w,done,l:l.map(t=>t.replaceAll('{n}',esc(S.player.name)))};mode='dialog';nextD()}
function nextD(){if(!dlg.l.length){const d=dlg.done;dlg=null;mode='world';ui.innerHTML='';return d&&d()}
 ui.innerHTML=`<div class=dlg><b>${dlg.w}</b>${dlg.l.shift()}</div>`}

function act(){if(mode=='dialog')return nextD();if(mode!='world')return;const n=World.facing();if(!n)return;
 const won=n.duel&&S.story.events['won_'+n.duel];
 if(n.duel&&!won)say(n.name,n.pre,()=>duel(n.duel));else say(n.name,won?n.post:n.lines)}



const kk=e=>KM[e.key]||KM[e.key.toLowerCase()];
addEventListener('keydown',e=>{const k=kk(e);if(k&&mode=='world'){keys[k]=true;e.preventDefault()}
 if([' ','Enter','e','z'].includes(e.key)&&(mode=='world'||mode=='dialog')){e.preventDefault();if(!e.repeat)act()}
 if(e.key=='Escape'){if(mode=='world')pause();else if(mode=='pause'){mode='world';ui.innerHTML=''}}});
addEventListener('keyup',e=>{const k=kk(e);if(k)keys[k]=false});
document.querySelectorAll('#dpad button').forEach(b=>{const k=b.dataset.k,on=v=>e=>{e.preventDefault();keys[k]=v};b.onpointerdown=on(true);b.onpointerup=b.onpointerleave=b.onpointercancel=on(false)});
abtn.onpointerdown=e=>{e.preventDefault();act()};
ui.addEventListener('click',e=>{if(mode=='battle')battleClick(e)});
ui.addEventListener('mouseover',e=>{if(mode=='battle')battleHover(e)});
const pt=Array.from({length:50},()=>({x:Math.random()*480,y:Math.random()*320,v:.3+Math.random()}));

function loop(t){
 if(mode=='world'&&World.update(keys)){Object.assign(S.player,{x:World.p.x,y:World.p.y,dir:World.p.dir});Save.write(S)}
 World.prompt=mode=='world';World.draw(cx,t);
 if(['title','create','deck'].includes(mode)){cx.fillStyle='rgba(20,12,6,.35)';cx.fillRect(0,0,480,320);cx.fillStyle='rgba(240,210,140,.8)';pt.forEach(p=>{p.x=(p.x+p.v*2)%480;p.y=(p.y+p.v*.3)%320;cx.fillRect(p.x,p.y,2,1)})}
 if(World.show&&mode!='battle'){cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(3,3,90,14);cx.fillStyle='#f1dfb0';cx.font='10px Georgia';cx.fillText('Moedas: '+S.player.coins,8,13)}
 requestAnimationFrame(loop)}

function duel(id){const d=D.duelists[id];mode='battle';
 startBattle({n:S.player.name,deck:S.deck},{n:d.name,deck:Ai.build(d.power)},d.ai,win=>{mode='world';ui.innerHTML='';let m;
  const h=S.story.history=S.story.history||[];h.unshift({foe:d.name,win,turns:B.n});h.length=Math.min(h.length,10);
  if(win){const pool=Ai.pool(d.power),c=pool[Math.random()*pool.length|0];S.player.coins+=d.coins;S.story.events['won_'+id]=1;S.collection[c.id]=(S.collection[c.id]||0)+1;m=`Você venceu! +${d.coins} moedas e a carta ${c.name}.`}
  else{const l=Math.min(d.loss,S.player.coins);S.player.coins-=l;m=`Você perdeu o duelo. -${l} moedas. Tente de novo!`}
  Save.write(S);say('',[m])})}

function pause(){mode='pause';const n=Object.values(S.collection).reduce((a,b)=>a+b,0),
 h=(S.story.history||[]).slice(0,3).map(x=>`${x.win?'Vitória':'Derrota'} vs ${x.foe} (${x.turns} turnos)`).join('<br>');
 ui.innerHTML=`<div class=menu><h2>Pausa</h2><p>Moedas: ${S.player.coins} · Cartas: ${n}</p><p><small>${h}</small></p><button id=sv>Salvar</button><button id=ed2>Editar deck</button><button id=ex>Exportar save</button><button id=tt>Menu inicial</button><button id=cl>Fechar</button></div>`;
 sv.onclick=()=>{sv.textContent=Save.write(S)?'Salvo!':'Falha ao salvar'};ed2.onclick=editDeck;ex.onclick=()=>Save.exportFile(S);
 tt.onclick=()=>{Save.write(S);title()};cl.onclick=()=>{mode='world';ui.innerHTML=''}}

function editDeck(){const dc={};S.deck.forEach(i=>dc[i]=(dc[i]||0)+1);const ids=Object.keys(S.collection).sort(),tot=()=>Object.values(dc).reduce((a,b)=>a+b,0);
 const paint=()=>{const sc=ui.firstChild?ui.firstChild.scrollTop:0;
  ui.innerHTML=`<div class=menu style="justify-content:flex-start;overflow:auto;padding:1.5cqw"><h2>Deck: ${tot()}/40 (máx. 3 cópias)</h2>${ids.map(i=>{const c=card(i);return `<div class=ed><span>${c.name}${c.type=='monster'?` (${c.attack}/${c.defense})`:''}</span><span><button data-i=${i} data-d=-1>−</button> ${dc[i]||0}/${S.collection[i]} <button data-i=${i} data-d=1>+</button></span></div>`}).join('')}<button id=sd ${tot()==40?'':'disabled'}>Salvar deck</button><button id=cc>Cancelar</button></div>`;
  ui.firstChild.scrollTop=sc;
  ui.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const i=b.dataset.i,n=(dc[i]||0)+ +b.dataset.d;if(n>=0&&n<=Math.min(3,S.collection[i]))dc[i]=n;paint()});
  sd.onclick=()=>{S.deck=expand(dc);Save.write(S);pause()};cc.onclick=pause};paint()}
