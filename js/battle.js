// Duelo: tipos/atributos, efeitos de monstro, campos, zonas (Extra à esquerda, Cemitério à direita), fases, corrente LIFO e animações.
let B,bcb,lps,pv,tk=false;
const qs=s=>document.querySelector(s),opp=w=>w=='p'?'o':'p',need=c=>c.level>=7?2:c.level>=5?1:0,RL=['R01','R02','R03','R04','R05'],PH=['Compra','Principal 1','Batalha','Principal 2','Fim'],
AT={Fogo:'#e8531e',Água:'#2f7fd8',Vento:'#3fb86a',Terra:'#a8793a',Luz:'#f1cf4a',Trevas:'#7a4ab0'},SUBL={normal:'MÁGICA',equip:'EQUIPAMENTO',cont:'CONTÍNUA',field:'CAMPO'},
shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a},
side=(n,d,ex)=>({n,lp:4000,ex:ex||[],deck:shuffle([...d]),hand:[],f:Array(5).fill(null),st:Array(5).fill(null),gy:[],fz:null}),
lg=t=>B.log.push(t),mon=(c,pos)=>({id:c.id,ba:c.attack,bd:c.defense,atk:c.attack,def:c.defense,pos,used:false,moved:false,fresh:true,nw:true});
function startBattle(a,f,prof,done){bcb=done;B={p:side(esc(a.n),a.deck,a.extra),o:side(esc(f.n),f.deck,f.extra),prof:prof||{},turn:'p',n:0,ph:'m1',sum:false,sel:null,hs:null,tb:null,tg:null,lst:null,fld:null,fldw:null,insp:null,pr:null,log:['O duelo começa!'],over:false,win:false};
 lps={p:4000,o:4000};pv={p:4000,o:4000};for(let i=0;i<5;i++){draw(B.p);draw(B.o)}beginTurn();if(!tk){tk=true;tick()}}
function draw(s){if(!s.deck.length){s.lp=0;return}s.hand.push(s.deck.pop())}
function beginTurn(){B.n++;B.ph='m1';B.sum=false;B.sel=B.hs=B.tb=B.tg=null;const w=B.turn,s=B[w];s.f.forEach(m=>m&&(m.used=m.moved=m.fresh=false));if(B.n>1)draw(s);
 lg(`— Turno ${B.n}: ${s.n} —`);s.f.forEach(m=>m&&runEf(w,card(m.id),m,'start'));s.st.forEach(t=>t&&t.up&&runEf(w,card(t.id),null,'start'));
 chk();render();if(B.turn=='o'&&!B.over)setTimeout(aiStep,900)}
function endTurn(){if(B.over||B.pr)return;const s=B[B.turn];while(s.hand.length>6){const c=card(s.hand[s.hand.length-1]);lg(`${s.n} descartou ${c.name}.`);toGY(B.turn,'h',s.hand.length-1)}B.turn=opp(B.turn);beginTurn()}
function nextPhase(){if(B.pr||B.over||B.turn!='p')return;B.hs=B.sel=B.tb=B.tg=null;
 if(B.ph=='m1')B.ph=B.n>1?'bp':'m2';else if(B.ph=='bp')B.ph='m2';else return endTurn();render()}
// bônus dinâmicos: campo, passivas, equipamentos
function recalc(){for(const w of['p','o']){const s=B[w],y=B[opp(w)],F=B.fld&&card(B.fld).field;
 s.f.forEach(m=>{if(!m)return;const c=card(m.id);let a=0,d=0;
  if(F){if(c.attr==F.a){a+=400;d+=400}else if(c.attr==F.x)a-=300}
  s.f.forEach(q=>{if(!q||q===m)return;const e=card(q.id).ef;if(e&&e.on=='pas'){if(e.t=='bonusR'&&c.race==e.r)a+=e.v;if(e.t=='bonusA'&&c.attr==e.r)a+=e.v;if(e.t=='aura')a+=e.v}});
  y.f.forEach(q=>{if(!q)return;const e=card(q.id).ef;if(e&&e.on=='pas'&&e.t=='debuff')a-=e.v});
  s.st.forEach(t=>{if(t&&t.tm===m){const e=card(t.id).effect;a+=e.a||0;d+=e.d||0}});
  m.atk=Math.max(0,m.ba+a);m.def=Math.max(0,m.bd+d)});
 s.st.forEach((t,i)=>{if(t&&t.tm&&!s.f.includes(t.tm))toGY(w,'st',i)})}}
function chk(){if(B.over)return;recalc();
 for(const w of['p','o'])if(RL.every(e=>B[w].hand.includes(e))){B[opp(w)].lp=0;lg(`${B[w].n} reuniu os 5 Selos do Faraó!`)}
 const p=B.p.lp<=0,o=B.o.lp<=0;if(p||o){B.p.lp=Math.max(0,B.p.lp);B.o.lp=Math.max(0,B.o.lp);B.over=true;B.win=!p}}
// ---------- animações ----------
function act(c){const e=document.createElement('div');e.className='actc';e.style.setProperty('--at',AT[c.attr]||'#f5d27a');e.innerHTML=cardEl(c,'big');$('fx').appendChild(e);setTimeout(()=>e.remove(),1150)}
function fly(id,el,w){const g=$('game').getBoundingClientRect(),zr=qs(`[data-z="gy${w}"]`);if(!zr)return;
 const a=el?el.getBoundingClientRect():{left:g.left+g.width/2-30,top:w=='o'?g.top:g.bottom-80,width:60,height:84},z=zr.getBoundingClientRect(),e=document.createElement('div');
 e.className='gh';Object.assign(e.style,{left:a.left-g.left+'px',top:a.top-g.top+'px',width:a.width+'px',height:a.height+'px'});e.innerHTML=cardEl(card(id));$('fx').appendChild(e);
 const dx=z.left-a.left+(z.width-a.width)/2,dy=z.top-a.top+(z.height-a.height)/2;
 e.animate([{transform:'none',opacity:1,filter:'brightness(1)'},{transform:`translate(${dx*.3}px,${dy*.3}px) scale(1.15) rotate(6deg)`,opacity:1,filter:'brightness(2.2)',offset:.35},{transform:`translate(${dx}px,${dy}px) scale(.5) rotate(18deg)`,opacity:.1,filter:'brightness(.3)'}],{duration:800,easing:'ease-in'}).onfinish=()=>e.remove()}
function toGY(w,z,i,die){const s=B[w];let id,el,m;
 if(z=='f'){m=s.f[i];if(!m)return;id=m.id;s.f[i]=null;el=qs(`[data-w="${w}"][data-i="${i}"]`)}
 else if(z=='st'){const t=s.st[i];if(!t)return;id=t.id;s.st[i]=null;el=qs(`[data-sw="${w}"][data-si="${i}"]`)}
 else{id=s.hand.splice(i,1)[0];el=w=='p'?qs(`[data-h="${i}"]`):null}
 s.gy.push(id);fly(id,el,w);if(m&&die!==false)runEf(w,card(id),m,'die')}
// ---------- efeitos de monstro ----------
function runEf(w,c,m,on){const e=c.ef;if(!e||e.on!=on||B.over)return;const me=B[w],yo=B[opp(w)],t=e.t,v=e.v;act(c);lg(`Efeito de ${c.name}!`);
 if(t=='draw')for(let i=0;i<v;i++)draw(me);
 if(t=='burn')yo.lp-=v;if(t=='heal')me.lp+=v;
 if(t=='kill'){const ix=yo.f.map((q,i)=>q?i:-1).filter(i=>i>=0).sort((a,b)=>yo.f[b].atk-yo.f[a].atk);if(ix.length)toGY(opp(w),'f',ix[0])}
 if(t=='revive'){const r=me.gy.map(card).filter(q=>q.type=='monster'&&!q.fusion&&q.level<=4&&!RL.includes(q.id)).sort((a,b)=>b.attack-a.attack)[0],k=me.f.indexOf(null);
  if(r&&k>=0){me.gy.splice(me.gy.indexOf(r.id),1);place(w,r,'a',k)}}
 if(t=='pos')yo.f.forEach(q=>q&&(q.pos='d'));
 recalc()}
function place(w,c,pos,k){const s=B[w];if(k==null)k=s.f.indexOf(null);const m=mon(c,pos);s.f[k]=m;recalc();runEf(w,c,m,'sum');return m}
function summon(w,i,def,done,pick){done=done||(()=>{});const me=B[w],c=card(me.hand[i]);
 if(!c||c.type!='monster'||B.sum||B.over||B.ph=='bp')return done(false);const n=need(c),
 mine=me.f.map((m,k)=>m?k:-1).filter(k=>k>=0).sort((a,b)=>me.f[a].atk-me.f[b].atk),ks=pick||mine.slice(0,n);
 if(mine.length<n||ks.length!=n||ks.some(k=>!me.f[k])||(n==0&&mine.length>=5))return done(false);
 ks.forEach(k=>{lg(`${card(me.f[k].id).name} foi sacrificado.`);toGY(w,'f',k,false)});
 const k=me.f.indexOf(null);me.hand.splice(i,1);B.sum=true;lg(`${me.n} invocou ${c.name} em ${def?'DEF':'ATK'}.`);place(w,c,def?'d':'a',k);
 trap(opp(w),'sum',{w,k},()=>{chk();done(true)})}
// ---------- fusão ----------
function fuseMats(me,f){const cand=[...me.hand.map((id,i)=>({s:'h',i,c:card(id)})),...me.f.map((m,i)=>m?{s:'f',i,c:card(m.id)}:null)].filter(x=>x&&x.c.type=='monster'&&!x.c.fusion),used=[];
 for(const s of [...f.fusion].sort((a,b)=>/^[M]/.test(b)-/^[M]/.test(a))){const x=cand.find(q=>!used.includes(q)&&(s[0]=='@'?q.c.race==s.slice(1):s[0]=='#'?q.c.attr==s.slice(1):q.c.id==s));if(!x)return null;used.push(x)}
 return used}
const fuseOpts=me=>me.ex.map(id=>({id,m:fuseMats(me,card(id))})).filter(x=>x.m&&(me.f.includes(null)||x.m.some(y=>y.s=='f')));
function setField(w,id){if(B.fld){B[B.fldw].fz=null;B[B.fldw].gy.push(B.fld)}B[w].fz=id;B.fld=id;B.fldw=w;lg(`O cenário muda: ${card(id).name}!`);recalc()}
// ---------- mágicas (alvo escolhido + janela de resposta) ----------
function spell(w,i,tg,done){done=done||(()=>{});const me=B[w],yo=B[opp(w)],c=card(me.hand[i]);if(!c||c.type!='spell'||B.over||B.ph=='bp')return done(false);
 const e=c.effect,sub=c.sub,mine=me.f.filter(Boolean),theirs=yo.f.filter(Boolean),cnt=a=>mine.filter(m=>card(m.id).attr==a).length,
 rv=me.gy.map(card).find(x=>x.type=='monster'&&!x.fusion&&!RL.includes(x.id)),
 bad={equip:!mine.length||!me.st.includes(null),cont:!me.st.includes(null),destroy:!theirs.length,def:!theirs.length,bounce:!theirs.length,revive:!rv||!me.f.includes(null),
  storm:![...me.st,...yo.st].some(Boolean),fuse:!fuseOpts(me).length,tutor:!me.deck.some(id=>card(id).race==e.r),pact:me.lp<=1000,purge:![...mine,...theirs].some(m=>m.atk>=e.v),healA:!cnt(e.a),burnA:!cnt(e.a)}[e.t];
 if(bad)return done(false);
 const el=w=='p'?qs(`[data-h="${i}"]`):null;me.hand.splice(i,1);act(c);lg(`${me.n} ativa ${c.name}.`);
 trap(opp(w),'spl',{w},neg=>{
  if(neg){lg(`${c.name} foi anulada!`);me.gy.push(c.id);fly(c.id,el,w);chk();return done(true)}
  const m2=me.f.filter(Boolean).sort((a,b)=>b.atk-a.atk),t2=yo.f.filter(Boolean).sort((a,b)=>b.atk-a.atk),num=typeof tg=='number',
  ty=num&&yo.f[tg]?yo.f[tg]:t2[0],tm=num&&me.f[tg]?me.f[tg]:m2[0],cn=a=>me.f.filter(q=>q&&card(q.id).attr==a).length;
  if(sub=='equip'){const k=me.st.indexOf(null);if(tm&&k>=0)me.st[k]={id:c.id,up:true,tm,nw:true};else{me.gy.push(c.id);fly(c.id,el,w)}}
  else if(sub=='cont'){me.st[me.st.indexOf(null)]={id:c.id,up:true,nw:true}}
  else if(sub=='field')setField(w,c.id);
  else{
   if(e.t=='heal')me.lp+=e.v;if(e.t=='burn')yo.lp-=e.v;if(e.t=='healA')me.lp+=e.v*cn(e.a);if(e.t=='burnA')yo.lp-=e.v*cn(e.a);
   if(e.t=='draw')for(let k=0;k<e.v;k++)draw(me);
   if(e.t=='pact'){me.lp-=1000;for(let k=0;k<3;k++)draw(me)}
   if(e.t=='destroy'&&ty)toGY(opp(w),'f',yo.f.indexOf(ty));
   if(e.t=='def'&&ty)ty.pos='d';
   if(e.t=='bounce'&&ty){const k=yo.f.indexOf(ty);yo.f[k]=null;yo.hand.push(ty.id);lg(`${card(ty.id).name} volta à mão.`)}
   if(e.t=='tutor'){const j=me.deck.map((id,x)=>[card(id),x]).filter(q=>q[0].race==e.r).sort((a,b)=>b[0].attack-a[0].attack)[0];if(j)me.hand.push(...me.deck.splice(j[1],1))}
   if(e.t=='revive'){const gy=me.gy.map(card).filter(q=>q.type=='monster'&&!q.fusion&&!RL.includes(q.id)),r=gy.find(q=>q.id==tg)||gy.sort((a,b)=>b.attack-a.attack)[0],k=me.f.indexOf(null);if(r&&k>=0){me.gy.splice(me.gy.indexOf(r.id),1);place(w,r,'a',k)}}
   if(e.t=='fuse'){const fo=fuseOpts(me).sort((a,b)=>card(b.id).attack-card(a.id).attack),o=fo.find(q=>q.id==tg)||fo[0];
    if(o){me.ex.splice(me.ex.indexOf(o.id),1);o.m.filter(x=>x.s=='f').forEach(x=>toGY(w,'f',x.i,false));o.m.filter(x=>x.s=='h').map(x=>x.i).sort((a,b)=>b-a).forEach(k=>toGY(w,'h',k));
     lg(`${me.n} invoca por Fusão: ${card(o.id).name}!`);place(w,card(o.id),'a')}else lg('A fusão falhou.')}
   if(e.t=='bhole'||e.t=='purge')['p','o'].forEach(x=>B[x].f.forEach((q,k)=>{if(q&&(e.t=='bhole'||q.atk>=e.v))toGY(x,'f',k)}));
   if(e.t=='storm')['p','o'].forEach(x=>B[x].st.forEach((q,k)=>q&&toGY(x,'st',k)));
   me.gy.push(c.id);fly(c.id,el,w)}
  chk();done(true)})}
function setTrap(w,i){const me=B[w],c=card(me.hand[i]),k=me.st.indexOf(null);if(!c||c.type!='trap'||k<0||B.over||B.ph=='bp')return false;
 me.st[k]={id:c.id,up:false,nw:true};me.hand.splice(i,1);lg(`${me.n} baixou uma carta.`);return true}
function flip(w,k){const m=B[w].f[k];if(!m||m.moved||m.used||m.fresh||B.over||B.ph=='bp')return false;
 m.pos=m.pos=='a'?'d':'a';m.moved=true;lg(`${B[w].n} mudou ${card(m.id).name} para ${m.pos=='a'?'ATK':'DEF'}.`);return true}
// ---------- armadilhas e corrente (pilha LIFO) ----------
function trap(d,tr,x,cont){const chain=[];
 const resolve=()=>{let neg=false;
  for(let k=chain.length-1;k>=0;k--){const L=chain[k];if(L.neg)continue;
   if(L.c.effect.t=='neg'){if(chain[k-1]){chain[k-1].neg=true;lg(`${chain[k-1].c.name} foi anulada!`)}}
   else neg=fx(L.side,L.c.effect.t,x)||neg}
  cont(neg)};
 const offer=(side,trg)=>{const s=B[side],ix=s.st.map((t,i)=>t&&!t.up&&card(t.id).effect.tr==trg?i:-1).filter(i=>i>=0);
  if(!ix.length||B.over)return resolve();
  const go=()=>{const i=ix[0],c=card(s.st[i].id);act(c);toGY(side,'st',i);chain.push({side,c,neg:false});lg(`Corrente ${chain.length}: ${s.n} ativa ${c.name}!`);offer(opp(side),'resp')};
  if(side=='o')return go();
  B.pr={txt:`${trg=='resp'?'Responder com':'Ativar'} ${card(s.st[ix[0]].id).name}?`,opts:[['Ativar',go],['Não',resolve]]};render()};
 offer(d,tr)}
function fx(d,t,x){if(t=='spn')return true;const at=B[x.w],df=B[d],m=at.f[x.k];if(!m)return false;
 if(t=='cyl'){at.lp-=m.atk;return true}
 if(t=='mir'){at.f.forEach((q,i)=>q&&q.pos=='a'&&toGY(x.w,'f',i));return true}
 if(t=='ring'){toGY(x.w,'f',x.k);at.lp-=m.atk;df.lp-=m.atk;return true}
 if(t=='dust'){m.pos='d';return true}
 if(t=='curse'){m.ba=Math.max(0,m.ba-800);recalc()}
 if(t=='pit'&&m.atk>=1500)toGY(x.w,'f',x.k);
 if(t=='jail')toGY(x.w,'f',x.k);
 if(t=='flood')['p','o'].forEach(s=>B[s].f.forEach((q,i)=>q&&toGY(s,'f',i)));
 return t=='flood'}
function attack(w,a,t,done){done=done||(()=>{});const me=B[w],yo=B[opp(w)],m=me.f[a];
 if(B.n<2||B.over||B.ph!='bp'||!m||m.used||m.pos!='a'||(t==null?yo.f.some(Boolean):!yo.f[t]))return done(false);
 m.used=true;recalc();const c0=card(m.id),nm=c0.name;
 trap(opp(w),'atk',{w,k:a},neg=>{
  if(!neg&&me.f[a]===m){recalc();
   if(t==null){yo.lp-=m.atk;lg(`${nm} ataca direto: -${m.atk} LP.`);runEf(w,c0,m,'hit')}
   else{const d=yo.f[t];if(d){const dn=card(d.id).name,A=d.pos=='a',pc=c0.ef&&c0.ef.t=='pierce',df=m.atk-(A?d.atk:d.def);
    if(df>0){toGY(opp(w),'f',t);if(A||pc){yo.lp-=df;if(me.f[a]===m)runEf(w,c0,m,'hit')}lg(`${nm} destrói ${dn}${A||pc?`: -${df} LP`:''}.`)}
    else if(df==0){if(A){toGY(opp(w),'f',t);toGY(w,'f',a)}lg(A?`${nm} e ${dn} se destroem.`:`${nm} não supera ${dn}.`)}
    else{if(A)toGY(w,'f',a);me.lp+=df;lg(`${nm} perde para ${dn}: -${-df} LP.`)}}}}
  chk();done(true)})}
function aiStep(){if(B.over||B.turn!='o'||B.pr)return;const a=Ai.next(B);if(!a)return endTurn();
 if(a.t=='atk'&&B.ph!='bp'){B.ph='bp';lg('O oponente entra na Fase de Batalha.')}
 const nx=ok=>{if(!ok)return endTurn();render();if(!B.over)setTimeout(aiStep,900)};
 if(a.t=='sum')summon('o',a.i,a.def,nx);else if(a.t=='atk')attack('o',a.a,a.tg,nx);else if(a.t=='spell')spell('o',a.i,undefined,nx);else nx(a.t=='trap'?setTrap('o',a.i):flip('o',a.k))}
// ---------- visual ----------
function cardEl(c,cls,m){const a=m?m.atk:c.attack,d=m?m.def:c.defense,col=AT[c.attr]||'#8a6a3a';
 return `<div class="cd ${c.type} ${c.sub||''} R${c.rarity} ${c.fusion?'fus':c.level>=7?'hi':''} ${cls||''}" data-c="${c.id}" style="--at:${col}"><div class=nm>${c.name}</div><div class=ls>${c.type=='monster'?'★'.repeat(Math.min(c.level,12)):c.type=='spell'?SUBL[c.sub]:'ARMADILHA'}</div><div class=ar><img src="./assets/cards/${c.id}.png" alt="" onerror="this.remove()">${c.attr?`<i class=gem>${c.attr[0]}</i>`:''}</div>${c.type=='monster'?`<div class=tp>${c.race}</div><div class=ad><b class="${m&&a>c.attack?'up':m&&a<c.attack?'dn':''}">${a}</b>/${d}</div>`:''}</div>`}
const inspHTML=id=>{const c=card(id);return cardEl(c,'big')+`<small>${c.type=='monster'?`${c.race} · ${c.attr} · Nv ${c.level} · ${need(c)?need(c)+' sacrif.':'sem sacrif.'}<br>`:''}${c.text||''}</small>`},
mcell=(s,w,i)=>{const m=s.f[i],g=B.tg&&B.tg.t,hl=(w=='o'&&m&&((B.sel!=null&&B.ph=='bp')||g=='destroy'||g=='def'||g=='bounce'))||(w=='p'&&m&&(B.tb||g=='equip'));
 return `<div class="sl ${m&&m.nw?'pop':''} ${w=='p'&&B.sel===i?'sel':''} ${hl?'hl':''} ${w=='p'&&B.tb&&B.tb.pick.includes(i)?'sel':''}" data-w="${w}" data-i="${i}">${m?cardEl(card(m.id),(m.pos=='d'?'dp ':'')+(m.used?'used':''),m):''}</div>`},
scell=(s,w,i)=>{const t=s.st[i];return `<div class="sl2 ${t&&t.nw?'pop':''}" data-sw="${w}" data-si="${i}">${t?(t.up||w=='p'?cardEl(card(t.id),t.up?'':'setc'):'<div class="cd back"></div>'):''}</div>`},
fzone=(s,w)=>`<div class="zn fzn" data-z="fz${w}">${s.fz?cardEl(card(s.fz)):'<small>CAMPO</small>'}</div>`,
deckz=(s,w)=>`<div class="zn dkz" data-z="dk${w}"><div class=stack style="--n:${Math.min(s.deck.length,10)}"></div><b>${s.deck.length}</b><small>DECK</small></div>`,
exz=(s,w)=>`<div class="zn exz" data-z="ex${w}">${s.ex.length?'<div class="cd back"></div>':''}<b>${s.ex.length}</b><small>EXTRA</small></div>`,
gyz=(s,w)=>`<div class="zn gyz" data-z="gy${w}">${s.gy.length?cardEl(card(s.gy[s.gy.length-1])):''}<b>${s.gy.length}</b><small>CEM.</small></div>`,
mrow=(s,w)=>{const c=[0,1,2,3,4].map(i=>mcell(s,w,i));return (w=='p'?[fzone(s,w),...c,deckz(s,w)]:[deckz(s,w),...c.reverse(),fzone(s,w)]).join('')},
zrow=(s,w)=>{const c=[0,1,2,3,4].map(i=>scell(s,w,i));return (w=='p'?[exz(s,w),...c,gyz(s,w)]:[gyz(s,w),...c.reverse(),exz(s,w)]).join('')};
function ctxHTML(){const p=B.p;if(B.tg)return '<small>Escolha o alvo da mágica</small><button id=cn>Cancelar</button>';
 if(B.tb)return `<small>Escolha ${B.tb.n} sacrifício(s) (${B.tb.pick.length}/${B.tb.n})</small><button id=cn>Cancelar</button>`;
 if(B.hs!=null&&p.hand[B.hs]){const c=card(p.hand[B.hs]);return c.type=='monster'?'<button id=a1>Invocar em ATK</button><button id=a2>Baixar em DEF</button>':c.type=='spell'?'<button id=as>Ativar</button>':'<button id=at>Baixar</button>'}
 if(B.sel!=null&&p.f[B.sel])return (B.ph=='bp'?(B.o.f.some(Boolean)?'<small>Clique num monstro rival para atacar</small>':'<button id=ak>Ataque direto</button>'):'')+'<button id=af>Mudar posição</button>';
 return `<small>${B.turn=='p'?'Selecione uma carta da mão ou do campo.':'Turno do oponente…'}</small>`}
function render(){const p=B.p,o=B.o,cur=B.ph=='m1'?1:B.ph=='bp'?2:3,my=B.turn=='p'&&!B.over,F=B.fld&&card(B.fld).field,
 pl=(s,w)=>`<div class=pl><b>${s.n}</b><div class=lpb><i id=lb${w}></i><span id=lt${w}>${lps[w]}</span></div></div>`;
 let lst='';if(B.lst){const s=B[B.lst.w],k=B.lst.k,ids=k=='gy'?s.gy:s.ex,hid=k=='ex'&&B.lst.w=='o';
  lst=`<div class=lst><div class=lh><b>${k=='gy'?'Cemitério':'Extra Deck'} de ${s.n} (${ids.length})</b><button id=lc>Fechar</button></div><div class=lg>${ids.length?ids.map(id=>hid?'<div class=lt><div class=cw><div class="cd back"></div></div></div>':`<div class=lt data-c="${id}"><div class=cw>${cardEl(card(id))}</div></div>`).join(''):'<small>Vazio</small>'}</div></div>`}
 ui.innerHTML=`<div class="b2 f-${F?F.bg:'none'}"><div class=side>${pl(o,'o')}<div class=insp id=insp>${B.insp?inspHTML(B.insp):'<small>Passe o mouse/toque numa carta para ver detalhes.</small>'}</div><div class=ctx>${ctxHTML()}</div>
<div class=acts><button id=nx ${my?'':'disabled'}>${B.ph=='m1'?(B.n>1?'Batalha ▶':'Principal 2 ▶'):B.ph=='bp'?'Principal 2 ▶':'Fim ▶'}</button><button id=en ${my?'':'disabled'}>Encerrar turno</button></div>${pl(p,'p')}</div>
<div class=field><div class=board><div class=mat><div class="row zr far">${zrow(o,'o')}</div><div class="row mr far">${mrow(o,'o')}</div><div class="row mr">${mrow(p,'p')}</div><div class="row zr">${zrow(p,'p')}</div></div></div>
<div class=mid><div class=chips>${PH.map((n,i)=>`<span class="${i==cur?'on':''}">${n}</span>`).join('')}</div><div class=lgl>${B.log.slice(-2).join(' · ')}</div></div>
<div class=hand>${p.hand.map((id,i)=>`<div class="hc ${B.hs===i?'sel':''}" data-h="${i}">${cardEl(card(id))}</div>`).join('')}</div></div>
${lst}${B.pr?`<div class=menu><p>${B.pr.txt}</p>${B.pr.opts.map((x,i)=>`<button data-pr=${i}>${x[0]}</button>`).join('')}</div>`:''}
${B.over?`<div class=menu><h1>${B.win?'VITÓRIA':'DERROTA'}</h1><button id=bk>Continuar</button></div>`:''}</div>`;
 [...B.p.f,...B.o.f,...B.p.st,...B.o.st].forEach(m=>m&&(m.nw=false))}
function battleClick(e){const t=e.target.closest('[data-pr],[data-h],[data-w],[data-z],button');if(!t)return;
 if(t.id=='bk')return bcb(B.win);
 if(t.dataset.pr!=null){const f=B.pr.opts[+t.dataset.pr][1];B.pr=null;f();return render()}
 if(t.id=='lc'){B.lst=null;return render()}
 if(t.dataset.z){const z=t.dataset.z,k=z.slice(0,2),w=z[2];if(k=='gy'||k=='ex')B.lst={k,w};else if(k=='fz'&&B[w].fz)B.insp=B[w].fz;return render()}
 if(B.over||B.turn!='p'||B.pr)return;
 const id=t.id,p=B.p,rs=()=>{B.hs=B.sel=B.tb=B.tg=null};
 if(id=='en')return endTurn();if(id=='nx')return nextPhase();
 if(id=='cn')B.tb=B.tg=null;
 else if(id=='a1'||id=='a2'){const i=B.hs,n=need(card(p.hand[i])),def=id=='a2';
  if(!n)return summon('p',i,def,ok=>{if(!ok)lg('Invocação impossível agora (fase, zona ou já invocou).');rs();render()});
  if(p.f.filter(Boolean).length<n)lg('Sacrifícios insuficientes.');else B.tb={i,def,n,pick:[]}}
 else if(id=='as'){const i=B.hs,e=card(p.hand[i]).effect;
  if(['destroy','def','bounce','equip'].includes(e.t)){const ar=e.t=='equip'?p.f:B.o.f;if(!ar.some(Boolean)||B.ph=='bp'||(e.t=='equip'&&!p.st.includes(null)))lg('Sem alvo, sem zona livre ou fase errada.');else{B.tg={i,t:e.t};B.hs=null}}
  else if(e.t=='revive'||e.t=='fuse'){const ops=e.t=='revive'?[...new Set(p.gy.filter(x=>card(x).type=='monster'&&!card(x).fusion&&!RL.includes(x)))].map(x=>[card(x).name,x]):fuseOpts(p).map(o=>[card(o.id).name,o.id]);
   if(!ops.length||B.ph=='bp')lg('Sem alvo ou fase errada.');else{rs();B.pr={txt:'Escolha o alvo:',opts:[...ops.slice(0,6).map(o=>[o[0],()=>spell('p',i,o[1],()=>render())]),['Cancelar',()=>{}]]};return render()}}
  else return spell('p',i,undefined,ok=>{if(!ok)lg('Não dá para usar agora (fase, zona ou sem requisito).');rs();render()})}
 else if(id=='at'){if(!setTrap('p',B.hs))lg('Sem zona livre ou fase errada.');rs()}
 else if(id=='ak'){const s=B.sel;rs();return attack('p',s,null,ok=>{if(!ok)lg('Ataque direto impossível.');render()})}
 else if(id=='af'){if(!flip('p',B.sel))lg('Não dá para mudar a posição agora.');B.sel=null}
 else if(B.tg&&t.dataset.w){const g=B.tg,k=+t.dataset.i,w=t.dataset.w;if((g.t=='equip')==(w=='p')&&B[w].f[k]){B.tg=null;return spell('p',g.i,k,r=>{if(!r)lg('Não deu certo.');render()})}}
 else if(t.dataset.h!=null){B.hs=+t.dataset.h;B.sel=null;B.tb=null;B.tg=null;B.insp=p.hand[B.hs]}
 else if(t.dataset.w=='p'){const k=+t.dataset.i,m=p.f[k];
  if(B.tb){if(m){const q=B.tb.pick,x=q.indexOf(k);x<0?q.push(k):q.splice(x,1);
   if(q.length==B.tb.n){const b=B.tb;rs();return summon('p',b.i,b.def,ok=>{if(!ok)lg('Invocação impossível.');render()},b.pick)}}}
  else if(m){B.sel=k;B.hs=null;B.insp=m.id}}
 else if(t.dataset.w=='o'){const m=B.o.f[+t.dataset.i];if(m)B.insp=m.id;
  if(m&&B.sel!=null&&B.ph=='bp'){const s=B.sel;B.sel=null;return attack('p',s,+t.dataset.i,ok=>{if(!ok)lg('Ataque inválido (monstro em DEF ou já atacou).');render()})}}
 render()}
function battleHover(e){const c=e.target.closest('[data-c]');if(!c||!B||c.dataset.c==B.insp)return;B.insp=c.dataset.c;const el=document.getElementById('insp');if(el)el.innerHTML=inspHTML(B.insp)}
function pop(t,w,g){const e=document.createElement('div');e.className='fl'+(g?' g':'');e.textContent=t;e.style.left='3cqw';e.style[w=='o'?'top':'bottom']=w=='o'?'6cqw':'6cqw';$('fx').appendChild(e);setTimeout(()=>e.remove(),1000)}
function tick(){if(!B||mode!='battle'){tk=false;return}
 for(const w of['p','o']){const s=B[w];if(s.lp!==pv[w]){const d=s.lp-pv[w];pop((d>0?'+':'')+d,w,d>0);if(d<=-1000){const g=$('game');g.classList.add('shake');setTimeout(()=>g.classList.remove('shake'),300)}pv[w]=s.lp}
  const k=lps[w]-s.lp;lps[w]-=Math.abs(k)<=10?k:(Math.sign(k)*Math.max(10,Math.abs(k)/12)|0);
  const a=document.getElementById('lb'+w),b=document.getElementById('lt'+w);if(a){a.style.width=Math.max(0,lps[w]/40)+'%';b.textContent=lps[w]}}
 requestAnimationFrame(tick)}
