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

function duel(id){const d=D.duelists[id],others=D.decks.filter(x=>x.id!=S.story.events.starterDeck);mode='battle';
 startBattle({n:S.player.name,deck:S.deck},{n:d.name,deck:expand(others[d.slot].cards)},win=>{mode='world';ui.innerHTML='';let m;
  if(win){const pool=D.cards.filter(c=>c.rarity=='C'),c=pool[Math.random()*pool.length|0];
   S.player.coins+=d.coins;S.story.events['won_'+id]=1;S.collection[c.id]=(S.collection[c.id]||0)+1;m=`Você venceu! +${d.coins} moedas e a carta ${c.name}.`}
  else{const l=Math.min(d.loss,S.player.coins);S.player.coins-=l;m=`Você perdeu o duelo. -${l} moedas. Tente de novo!`}
  Save.write(S);say('',[m])})}

function pause(){mode='pause';const n=Object.values(S.collection).reduce((a,b)=>a+b,0);
 ui.innerHTML=`<div class=menu><h2>Pausa</h2><p>Moedas: ${S.player.coins} · Cartas: ${n}</p><button id=sv>Salvar</button><button id=ex>Exportar save</button><button id=tt>Menu inicial</button><button id=cl>Fechar</button></div>`;
 sv.onclick=()=>{sv.textContent=Save.write(S)?'Salvo!':'Falha ao salvar'};ex.onclick=()=>Save.exportFile(S);
 tt.onclick=()=>{Save.write(S);title()};cl.onclick=()=>{mode='world';ui.innerHTML=''}}

const kk=e=>KM[e.key]||KM[e.key.toLowerCase()];
addEventListener('keydown',e=>{const k=kk(e);if(k&&mode=='world'){keys[k]=true;e.preventDefault()}
 if([' ','Enter','e','z'].includes(e.key)&&(mode=='world'||mode=='dialog')){e.preventDefault();if(!e.repeat)act()}
 if(e.key=='Escape'){if(mode=='world')pause();else if(mode=='pause'){mode='world';ui.innerHTML=''}}});
addEventListener('keyup',e=>{const k=kk(e);if(k)keys[k]=false});
document.querySelectorAll('#dpad button').forEach(b=>{const k=b.dataset.k,on=v=>e=>{e.preventDefault();keys[k]=v};b.onpointerdown=on(true);b.onpointerup=b.onpointerleave=b.onpointercancel=on(false)});
abtn.onpointerdown=e=>{e.preventDefault();act()};
ui.addEventListener('click',e=>{if(mode=='battle')battleClick(e)});

function loop(t){
 if(mode=='world'&&World.update(keys)){Object.assign(S.player,{x:World.p.x,y:World.p.y,dir:World.p.dir});Save.write(S)}
 World.draw(cx,t);
 if(World.show&&mode!='battle'){cx.fillStyle='rgba(0,0,0,.55)';cx.fillRect(3,3,90,14);cx.fillStyle='#f1dfb0';cx.font='10px Georgia';cx.fillText('Moedas: '+S.player.coins,8,13)}
 requestAnimationFrame(loop)}
