// Fase 2.1: fases (Compra/Main1/Batalha/Main2/Fim), corrente LIFO de armadilhas, escolha de sacrifícios, inspetor de cartas, animações.
let B,bcb,lps,pv,tk=false;
const opp=w=>w=='p'?'o':'p',need=c=>c.level>=7?2:c.level>=5?1:0,EX=['EX01','EX02','EX03','EX04','EX05'],PH=['Compra','Principal 1','Batalha','Principal 2','Fim'],
shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a},
side=(n,d,ex)=>({n,lp:4000,ex:ex||[],deck:shuffle([...d]),hand:[],f:Array(5).fill(null),st:Array(5).fill(null),gy:[]}),
lg=t=>B.log.push(t),kill=(s,i)=>{if(s.f[i]){s.gy.push(s.f[i].id);s.f[i]=null}},
mon=(c,pos)=>({id:c.id,atk:c.attack,def:c.defense,pos,used:false,moved:false,fresh:true});
function startBattle(a,f,prof,done){bcb=done;B={p:side(esc(a.n),a.deck,a.extra),o:side(esc(f.n),f.deck,f.extra),prof:prof||{},turn:'p',n:0,ph:'m1',sum:false,sel:null,hs:null,tb:null,insp:null,pr:null,log:['O duelo começa!'],over:false,win:false};
 lps={p:4000,o:4000};pv={p:4000,o:4000};for(let i=0;i<5;i++){draw(B.p);draw(B.o)}beginTurn();if(!tk){tk=true;tick()}}
function draw(s){if(!s.deck.length){s.lp=0;return}s.hand.push(s.deck.pop())}
function beginTurn(){B.n++;B.ph='m1';B.sum=false;B.sel=B.hs=B.tb=null;const s=B[B.turn];s.f.forEach(m=>m&&(m.used=m.moved=m.fresh=false));if(B.n>1)draw(s);
 lg(`— Turno ${B.n}: ${s.n} —`);chk();render();if(B.turn=='o'&&!B.over)setTimeout(aiStep,900)}
function endTurn(){if(B.over||B.pr)return;const s=B[B.turn];
 while(s.hand.length>6){const c=card(s.hand.pop());s.gy.push(c.id);lg(`${s.n} descartou ${c.name}.`)}
 B.turn=opp(B.turn);beginTurn()}
function nextPhase(){if(B.pr||B.over||B.turn!='p')return;B.hs=B.sel=B.tb=null;
 if(B.ph=='m1')B.ph=B.n>1?'bp':'m2';else if(B.ph=='bp')B.ph='m2';else return endTurn();render()}
function chk(){if(B.over)return;
 for(const w of['p','o'])if(EX.every(e=>B[w].hand.includes(e))){B[opp(w)].lp=0;lg(`${B[w].n} reuniu Exodia!`)}
 const p=B.p.lp<=0,o=B.o.lp<=0;if(p||o){B.p.lp=Math.max(0,B.p.lp);B.o.lp=Math.max(0,B.o.lp);B.over=true;B.win=!p}}
function summon(w,i,def,done,pick){done=done||(()=>{});const me=B[w],c=card(me.hand[i]);
 if(!c||c.type!='monster'||B.sum||B.over||B.ph=='bp')return done(false);const n=need(c),
 mine=me.f.map((m,k)=>m?k:-1).filter(k=>k>=0).sort((a,b)=>me.f[a].atk-me.f[b].atk),ks=pick||mine.slice(0,n);
 if(mine.length<n||ks.length!=n||ks.some(k=>!me.f[k])||(n==0&&mine.length>=5))return done(false);
 ks.forEach(k=>{lg(`${card(me.f[k].id).name} foi sacrificado.`);kill(me,k)});
 const k=me.f.indexOf(null);me.f[k]=mon(c,def?'d':'a');me.hand.splice(i,1);B.sum=true;lg(`${me.n} invocou ${c.name} em ${def?'DEF':'ATK'}.`);
 trap(opp(w),'sum',{w,k},()=>{chk();done(true)})}
function fuseMats(me,f){const cand=[...me.hand.map((id,i)=>({s:'h',i,c:card(id)})),...me.f.map((m,i)=>m?{s:'f',i,c:card(m.id)}:null)].filter(x=>x&&x.c.type=='monster'&&!x.c.fusion),used=[];
 for(const s of [...f.fusion].sort((a,b)=>(a[0]=='~')-(b[0]=='~'))){const x=cand.find(q=>!used.includes(q)&&(s[0]=='~'?q.c.name.includes(s.slice(1)):q.c.id==s));if(!x)return null;used.push(x)}
 return used}
const fuseOpts=me=>me.ex.map((id,i)=>({id,m:fuseMats(me,card(id))})).filter(x=>x.m&&(me.f.includes(null)||x.m.some(y=>y.s=='f')));
// Mágicas com alvo (tg) e janela de corrente: o rival pode anular a ativação (trigger 'spl').
function spell(w,i,tg,done){done=done||(()=>{});const me=B[w],yo=B[opp(w)],c=card(me.hand[i]);if(!c||c.type!='spell'||B.over||B.ph=='bp')return done(false);const e=c.effect,
 mine=me.f.filter(Boolean),theirs=yo.f.filter(Boolean),rv=me.gy.map(card).filter(x=>x.type=='monster'&&!x.fusion)[0];
 if(({boost:!mine.length,destroy:!theirs.length,def:!theirs.length,revive:!rv||!me.f.includes(null),storm:![...me.st,...yo.st].some(Boolean),fuse:!fuseOpts(me).length})[e.t])return done(false);
 me.hand.splice(i,1);me.gy.push(c.id);lg(`${me.n} ativa ${c.name}.`);
 trap(opp(w),'spl',{w},neg=>{if(neg){lg(`${c.name} foi anulada!`);chk();return done(true)}
  const m2=me.f.filter(Boolean).sort((a,b)=>b.atk-a.atk),t2=yo.f.filter(Boolean).sort((a,b)=>b.atk-a.atk),num=typeof tg=='number',
  ty=num&&yo.f[tg]?yo.f[tg]:t2[0],tm=num&&me.f[tg]?me.f[tg]:m2[0];
  if(e.t=='heal')me.lp+=e.v;if(e.t=='burn')yo.lp-=e.v;if(e.t=='boost'&&tm){tm.atk+=e.v;tm.def+=e.v}
  if(e.t=='draw')for(let k=0;k<e.v;k++)draw(me);
  if(e.t=='destroy'&&ty)kill(yo,yo.f.indexOf(ty));
  if(e.t=='def'&&ty)ty.pos='d';
  if(e.t=='revive'){const gy=me.gy.map(card).filter(x=>x.type=='monster'&&!x.fusion),r=gy.find(x=>x.id==tg)||gy.sort((a,b)=>b.attack-a.attack)[0],k=me.f.indexOf(null);if(r&&k>=0){me.gy.splice(me.gy.indexOf(r.id),1);me.f[k]=mon(r,'a')}}
  if(e.t=='fuse'){const fo=fuseOpts(me).sort((a,b)=>card(b.id).attack-card(a.id).attack),o=fo.find(x=>x.id==tg)||fo[0];
   if(o){me.ex.splice(me.ex.indexOf(o.id),1);const ms=o.m;ms.filter(x=>x.s=='f').forEach(x=>kill(me,x.i));
    ms.filter(x=>x.s=='h').map(x=>x.i).sort((a,b)=>b-a).forEach(k=>{me.gy.push(me.hand[k]);me.hand.splice(k,1)});
    me.f[me.f.indexOf(null)]=mon(card(o.id),'a');lg(`${me.n} invoca por Fusão: ${card(o.id).name}!`)}else lg('A fusão falhou.')}
  if(e.t=='bhole')[me,yo].forEach(s=>s.f.forEach((m,k)=>kill(s,k)));
  if(e.t=='storm')[me,yo].forEach(s=>s.st.forEach((t,k)=>{if(t){s.gy.push(t);s.st[k]=null}}));
  chk();done(true)})}
function setTrap(w,i){const me=B[w],c=card(me.hand[i]),k=me.st.indexOf(null);if(!c||c.type!='trap'||k<0||B.over||B.ph=='bp')return false;
 me.st[k]=c.id;me.hand.splice(i,1);lg(`${me.n} baixou uma carta.`);return true}
function flip(w,k){const m=B[w].f[k];if(!m||m.moved||m.used||m.fresh||B.over||B.ph=='bp')return false;
 m.pos=m.pos=='a'?'d':'a';m.moved=true;lg(`${B[w].n} mudou ${card(m.id).name} para ${m.pos=='a'?'ATK':'DEF'}.`);return true}
// Corrente (pilha LIFO): cada ativação pode receber resposta do outro lado; resolve do topo para a base.
function trap(d,tr,x,cont){const chain=[];
 const resolve=()=>{let neg=false;
  for(let k=chain.length-1;k>=0;k--){const L=chain[k];if(L.neg)continue;
   if(L.c.effect.t=='neg'){if(chain[k-1]){chain[k-1].neg=true;lg(`${chain[k-1].c.name} foi anulada!`)}}
   else neg=fx(L.side,L.c.effect.t,x)||neg}
  cont(neg)};
 const offer=(side,trg)=>{const s=B[side],ix=s.st.map((t,i)=>t&&card(t).effect.tr==trg?i:-1).filter(i=>i>=0);
  if(!ix.length||B.over)return resolve();
  const go=()=>{const i=ix[0],c=card(s.st[i]);s.st[i]=null;s.gy.push(c.id);chain.push({side,c,neg:false});lg(`Corrente ${chain.length}: ${s.n} ativa ${c.name}!`);offer(opp(side),'resp')};
  if(side=='o')return go();
  B.pr={txt:`${trg=='resp'?'Responder com':'Ativar'} ${card(s.st[ix[0]]).name}?`,opts:[['Ativar',go],['Não',resolve]]};render()};
 offer(d,tr)}
function fx(d,t,x){if(t=='spn')return true;const at=B[x.w],df=B[d],m=at.f[x.k];if(!m)return false;
 if(t=='cyl'){at.lp-=m.atk;return true}
 if(t=='mir'){at.f.forEach((q,i)=>q&&q.pos=='a'&&kill(at,i));return true}
 if(t=='ring'){kill(at,x.k);at.lp-=m.atk;df.lp-=m.atk;return true}
 if(t=='pit'&&m.atk>=1500)kill(at,x.k);
 if(t=='jail')kill(at,x.k);
 if(t=='flood')[at,df].forEach(s=>s.f.forEach((q,i)=>kill(s,i)));
 return t=='flood'}
function attack(w,a,t,done){done=done||(()=>{});const me=B[w],yo=B[opp(w)],m=me.f[a];
 if(B.n<2||B.over||B.ph!='bp'||!m||m.used||m.pos!='a'||(t==null?yo.f.some(Boolean):!yo.f[t]))return done(false);
 m.used=true;const nm=card(m.id).name;
 trap(opp(w),'atk',{w,k:a},neg=>{
  if(!neg&&me.f[a]===m){
   if(t==null){yo.lp-=m.atk;lg(`${nm} ataca direto: -${m.atk} LP.`)}
   else{const d=yo.f[t];if(d){const dn=card(d.id).name,A=d.pos=='a',df=m.atk-(A?d.atk:d.def);
    if(df>0){kill(yo,t);if(A)yo.lp-=df;lg(`${nm} destrói ${dn}${A?`: -${df} LP`:''}.`)}
    else if(df==0){if(A){kill(yo,t);kill(me,a)}lg(A?`${nm} e ${dn} se destroem.`:`${nm} não supera ${dn}.`)}
    else{if(A)kill(me,a);me.lp+=df;lg(`${nm} perde para ${dn}: -${-df} LP.`)}}}}
  chk();done(true)})}
function aiStep(){if(B.over||B.turn!='o'||B.pr)return;const a=Ai.next(B);if(!a)return endTurn();
 if(a.t=='atk'&&B.ph!='bp'){B.ph='bp';lg('O oponente entra na Fase de Batalha.')}
 const nx=ok=>{if(!ok)return endTurn();render();if(!B.over)setTimeout(aiStep,850)};
 if(a.t=='sum')summon('o',a.i,a.def,nx);else if(a.t=='atk')attack('o',a.a,a.tg,nx);
 else if(a.t=='spell')spell('o',a.i,undefined,nx);else nx(a.t=='trap'?setTrap('o',a.i):flip('o',a.k))}
// ---------- visual ----------
const EM=[[/Dragão/,'dragon'],[/Mago|Maga|Bruxa|Aprendiz/,'mage'],[/Cavaleiro|Guerreiro|Buster|Gearfried|Soldado|Gilford|Pantera|Rocket|Gaia|Paladino/,'knight'],[/Caveira|Zumbi|Múmia|Exodia|Proibido/,'skull'],[/Serpente|Lagarto/,'snake'],[/Escorpi/,'scorpion'],[/Lobo|Chacal|Uraby/,'wolf'],[/Harpia/,'bird'],[/Kuriboh/,'eye'],[/Esfinge|Escriba|Guardião|Elfo|Jinzo|Máquina|Kazejin|Suijin|Sanga/,'golem']],
art=c=>c.fusion?(EM.find(e=>e[0].test(c.name))||[0,'fusion'])[1]:c.type=='spell'?'spell':c.type=='trap'?'trap':(EM.find(e=>e[0].test(c.name))||[0,'urn'])[1];
function cardEl(c,cls,m){const h=[...c.id].reduce((a,ch)=>a+ch.charCodeAt(0)*7,0)%360,a=m?m.atk:c.attack,d=m?m.def:c.defense;
 return `<div class="cd ${c.type} R${c.rarity} ${c.fusion?'fus':c.level>=7?'hi':''} ${cls||''}" data-c="${c.id}"><div class=nm>${c.name}</div><div class=ls>${c.type=='monster'?'★'.repeat(Math.min(c.level,12)):c.type=='spell'?'MÁGICA':'ARMADILHA'}</div><div class=ar style="background:radial-gradient(circle at 50% 35%,hsl(${h} 55% 55%),hsl(${h} 45% 22%))"><img class=sp src="./assets/art/${art(c)}.png" style="filter:hue-rotate(${h%50}deg)" alt=""><img src="./assets/cards/${c.id}.png" alt="" onerror="this.remove()"></div>${c.type=='monster'?`<div class=ad>${a}/${d}</div>`:''}</div>`}
const inspHTML=id=>{const c=card(id);return cardEl(c,'big')+`<small>${c.type=='monster'?`Nível ${c.level} · ${need(c)?need(c)+' sacrifício(s)':'sem sacrifício'} · ${c.rarity}`:c.text}</small>`},
mslots=(s,w)=>s.f.map((m,i)=>{const g=B.tg&&B.tg.t,tg=(w=='o'&&m&&((B.sel!=null&&B.ph=='bp')||g=='destroy'||g=='def'))||(w=='p'&&m&&(B.tb||g=='boost'));
 return `<div class="sl ${w=='p'&&B.sel===i?'sel':''} ${tg?'hl':''} ${w=='p'&&B.tb&&B.tb.pick.includes(i)?'sel':''}" data-w="${w}" data-i="${i}">${m?cardEl(card(m.id),(m.pos=='d'?'dp ':'')+(m.used?'used':''),m):''}</div>`}).join(''),
tslots=(s,w)=>s.st.map(t=>`<div class=sl2>${t?(w=='p'?`<div class="cd trap mini" data-c="${t}">${card(t).name}</div>`:'<div class="cd back mini"></div>'):''}</div>`).join('');
const zrow=(s,w)=>`<div class="zn" data-z="ex${w}">EXTRA<br>${s.ex.length}</div>${tslots(s,w)}<div class="zn" data-z="gy${w}">CEM.<br>${s.gy.length}</div>`;
function ctxHTML(){const p=B.p;if(B.tg)return '<small>Escolha o alvo da mágica</small><button id=cn>Cancelar</button>';if(B.tb)return `<small>Escolha ${B.tb.n} sacrifício(s) entre seus monstros (${B.tb.pick.length}/${B.tb.n})</small><button id=cn>Cancelar</button>`;
 if(B.hs!=null&&p.hand[B.hs]){const c=card(p.hand[B.hs]);return c.type=='monster'?'<button id=a1>Invocar em ATK</button><button id=a2>Baixar em DEF</button>':c.type=='spell'?'<button id=as>Ativar</button>':'<button id=at>Baixar</button>'}
 if(B.sel!=null&&p.f[B.sel])return (B.ph=='bp'?(B.o.f.some(Boolean)?'<small>Clique num monstro rival para atacar</small>':'<button id=ak>Ataque direto</button>'):'')+'<button id=af>Mudar posição</button>';
 return `<small>${B.turn=='p'?'Selecione uma carta da mão ou do campo.':'Turno do oponente…'}</small>`}
function render(){const p=B.p,o=B.o,cur=B.ph=='m1'?1:B.ph=='bp'?2:3,my=B.turn=='p'&&!B.over,
 pl=(s,w)=>`<div class=pl><b>${s.n}</b><div class=lpb><i id=lb${w}></i><span id=lt${w}>${lps[w]}</span></div><small>Mão ${s.hand.length} · Deck ${s.deck.length} · Cem. ${s.gy.length}</small></div>`;
 ui.innerHTML=`<div class=b2><div class=side>${pl(o,'o')}<div class=insp id=insp>${B.insp?inspHTML(B.insp):'<small>Passe o mouse/toque numa carta para ver detalhes.</small>'}</div><div class=ctx>${ctxHTML()}</div>${pl(p,'p')}</div>
<div class=field><div class=board><div class=mat><div class="row far">${zrow(o,'o')}</div><div class="row far">${mslots(o,'o')}</div><div class=row>${mslots(p,'p')}</div><div class=row>${zrow(p,'p')}</div></div></div>
<div class=mid><div class=chips>${PH.map((n,i)=>`<span class="${i==cur?'on':''}">${n}</span>`).join('')}</div><div class=lgl>${B.log.slice(-2).join(' · ')}</div></div>
<div class=hand>${p.hand.map((id,i)=>`<div class="hc ${B.hs===i?'sel':''}" data-h="${i}">${cardEl(card(id))}</div>`).join('')}</div>
<div class=acts><button id=nx ${my?'':'disabled'}>${B.ph=='m1'?(B.n>1?'Batalha ▶':'Principal 2 ▶'):B.ph=='bp'?'Principal 2 ▶':'Fim ▶'}</button><button id=en ${my?'':'disabled'}>Encerrar turno</button></div></div>
${B.pr?`<div class=menu><p>${B.pr.txt}</p>${B.pr.opts.map((x,i)=>`<button data-pr=${i}>${x[0]}</button>`).join('')}</div>`:''}
${B.over?`<div class=menu><h1>${B.win?'VITÓRIA':'DERROTA'}</h1><button id=bk>Continuar</button></div>`:''}</div>`}
function battleClick(e){const t=e.target.closest('[data-pr],[data-h],[data-w],[data-z],button');if(!t)return;
 if(t.id=='bk')return bcb(B.win);
 if(t.dataset.pr!=null){const f=B.pr.opts[+t.dataset.pr][1];B.pr=null;f();return render()}
 if(B.over||B.turn!='p'||B.pr)return;
 if(t.dataset.z){const z=t.dataset.z,k=z.slice(0,2),w=z[2],s=B[w],l=k=='gy'?s.gy:(w=='p'?s.ex:[]);B.pr={txt:(k=='gy'?'Cemitério':'Extra Deck')+' de '+s.n+': '+(l.length?l.map(i=>card(i).name).join(', '):(k=='ex'&&w=='o'?s.ex.length+' carta(s) ocultas':'vazio')),opts:[['Fechar',()=>{}]]};return render()}
 const id=t.id,p=B.p,rs=()=>{B.hs=B.sel=B.tb=B.tg=null};
 if(id=='en')return endTurn();if(id=='nx')return nextPhase();
 if(id=='cn')B.tb=B.tg=null;
 else if(id=='a1'||id=='a2'){const i=B.hs,n=need(card(p.hand[i])),def=id=='a2';
  if(!n)return summon('p',i,def,ok=>{if(!ok)lg('Invocação impossível agora (fase, zona ou já invocou).');rs();render()});
  if(p.f.filter(Boolean).length<n)lg('Sacrifícios insuficientes.');else B.tb={i,def,n,pick:[]}}
 else if(id=='as'){const i=B.hs,e=card(p.hand[i]).effect,ar=e.t=='boost'?p.f:B.o.f;
  if(['destroy','def','boost'].includes(e.t)){if(!ar.some(Boolean)||B.ph=='bp')lg('Sem alvo ou fase errada.');else{B.tg={i,t:e.t};B.hs=null}}
  else if(e.t=='revive'||e.t=='fuse'){const ops=e.t=='revive'?[...new Set(p.gy.filter(x=>card(x).type=='monster'&&!card(x).fusion))].map(x=>[card(x).name,x]):fuseOpts(p).map(o=>[card(o.id).name,o.id]);
   if(!ops.length||B.ph=='bp')lg('Sem alvo ou fase errada.');else{rs();B.pr={txt:'Escolha o alvo:',opts:[...ops.slice(0,6).map(o=>[o[0],()=>spell('p',i,o[1],()=>render())]),['Cancelar',()=>{}]]};return render()}}
  else return spell('p',i,undefined,ok=>{if(!ok)lg('Não dá para usar agora.');rs();render()})}
 else if(id=='at'){if(!setTrap('p',B.hs))lg('Sem zona livre ou fase errada.');rs()}
 else if(id=='ak'){const s=B.sel;rs();return attack('p',s,null,ok=>{if(!ok)lg('Ataque direto impossível.');render()})}
 else if(id=='af'){if(!flip('p',B.sel))lg('Não dá para mudar a posição agora.');B.sel=null}
 else if(B.tg&&t.dataset.w){const g=B.tg,k=+t.dataset.i,w=t.dataset.w;if((g.t=='boost')==(w=='p')&&B[w].f[k]){B.tg=null;return spell('p',g.i,k,r=>{if(!r)lg('Não deu certo.');render()})}}
 else if(t.dataset.h!=null){B.hs=+t.dataset.h;B.sel=null;B.tb=null;B.tg=null;B.insp=p.hand[B.hs]}
 else if(t.dataset.w=='p'){const k=+t.dataset.i,m=p.f[k];
  if(B.tb){if(m){const q=B.tb.pick,x=q.indexOf(k);x<0?q.push(k):q.splice(x,1);
   if(q.length==B.tb.n){const b=B.tb;rs();return summon('p',b.i,b.def,ok=>{if(!ok)lg('Invocação impossível.');render()},b.pick)}}}
  else if(m){B.sel=k;B.hs=null;B.insp=m.id}}
 else if(t.dataset.w=='o'){const m=B.o.f[+t.dataset.i];if(m)B.insp=m.id;
  if(m&&B.sel!=null&&B.ph=='bp'){const s=B.sel;B.sel=null;return attack('p',s,+t.dataset.i,ok=>{if(!ok)lg('Ataque inválido (monstro em DEF ou já atacou).');render()})}}
 render()}
function battleHover(e){const c=e.target.closest('[data-c]');if(!c||!B||c.dataset.c==B.insp)return;B.insp=c.dataset.c;const el=document.getElementById('insp');if(el)el.innerHTML=inspHTML(B.insp)}
function pop(t,w,g){const e=document.createElement('div');e.className='fl'+(g?' g':'');e.textContent=t;e.style.left='3cqw';e.style[w=='o'?'top':'bottom']=w=='o'?'7cqw':'17cqw';document.getElementById('fx').appendChild(e);setTimeout(()=>e.remove(),1000)}
function tick(){if(!B||mode!='battle'){tk=false;return}
 for(const w of['p','o']){const s=B[w];if(s.lp!==pv[w]){const d=s.lp-pv[w];pop((d>0?'+':'')+d,w,d>0);if(d<=-1000){const g=document.getElementById('game');g.classList.add('shake');setTimeout(()=>g.classList.remove('shake'),300)}pv[w]=s.lp}
  const k=lps[w]-s.lp;lps[w]-=Math.abs(k)<=10?k:(Math.sign(k)*Math.max(10,Math.abs(k)/12)|0);
  const a=document.getElementById('lb'+w),b=document.getElementById('lt'+w);if(a){a.style.width=Math.max(0,lps[w]/40)+'%';b.textContent=lps[w]}}
 requestAnimationFrame(tick)}
