// Regras (fase 1): 40 cartas, mão 5, 5 zonas, 4000 LP, 1 invocação/turno, sacrifícios 1 (nv 5-6) / 2 (nv 7+).
let B,bcb;
const opp=w=>w=='p'?'o':'p',need=c=>c.level>=7?2:c.level>=5?1:0,
shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a},
side=(n,d)=>({n,lp:4000,deck:shuffle([...d]),hand:[],f:[null,null,null,null,null]}),
lg=t=>B.log.push(t);
function startBattle(a,f,done){bcb=done;B={p:side(esc(a.n),a.deck),o:side(esc(f.n),f.deck),turn:'p',n:0,sum:false,sel:null,log:['O duelo começa!'],over:false,win:false};
 for(let i=0;i<5;i++){draw(B.p);draw(B.o)}beginTurn()}
function draw(s){if(!s.deck.length){s.lp=0;return}s.hand.push(s.deck.pop())}
function beginTurn(){B.n++;B.sum=false;B.sel=null;const s=B[B.turn];s.f.forEach(m=>m&&(m.used=false));if(B.n>1)draw(s);chk();render();
 if(B.turn=='o'&&!B.over)setTimeout(aiStep,900)}
function endTurn(){if(B.over)return;B.turn=opp(B.turn);beginTurn()}
function chk(){if(B.over)return;const p=B.p.lp<=0,o=B.o.lp<=0;if(p||o){B.p.lp=Math.max(0,B.p.lp);B.o.lp=Math.max(0,B.o.lp);B.over=true;B.win=!p}}
function summon(w,i){const me=B[w],c=card(me.hand[i]);if(!c||c.type!='monster'||B.sum)return false;const n=need(c);
 const mine=me.f.map((m,k)=>m?k:-1).filter(k=>k>=0).sort((a,b)=>me.f[a].atk-me.f[b].atk);
 if(mine.length<n||(n==0&&mine.length>=5))return false;
 mine.slice(0,n).forEach(k=>{lg(`${card(me.f[k].id).name} foi sacrificado.`);me.f[k]=null});
 me.f[me.f.indexOf(null)]={id:c.id,atk:c.attack,used:false};me.hand.splice(i,1);B.sum=true;lg(`${me.n} invocou ${c.name} (${c.attack}).`);return true}
function spell(w,i){const me=B[w],yo=B[opp(w)],c=card(me.hand[i]);if(!c||c.type!='spell')return false;const e=c.effect,
 mine=me.f.filter(Boolean).sort((a,b)=>b.atk-a.atk),theirs=yo.f.filter(Boolean).sort((a,b)=>b.atk-a.atk);
 if((e.t=='boost'&&!mine.length)||(e.t=='destroy'&&!theirs.length))return false;
 me.hand.splice(i,1);
 if(e.t=='heal')me.lp+=e.v;if(e.t=='burn')yo.lp-=e.v;if(e.t=='boost')mine[0].atk+=e.v;
 if(e.t=='draw')for(let k=0;k<e.v;k++)draw(me);
 if(e.t=='destroy')yo.f[yo.f.indexOf(theirs[0])]=null;
 lg(`${me.n} usou ${c.name}.`);chk();return true}
function attack(w,a,t){if(B.n<2)return false;const me=B[w],yo=B[opp(w)],m=me.f[a];if(!m||m.used)return false;const nm=card(m.id).name;
 if(t==null){if(yo.f.some(Boolean))return false;m.used=true;yo.lp-=m.atk;lg(`${nm} ataca direto: -${m.atk} LP.`)}
 else{const d=yo.f[t];if(!d)return false;m.used=true;const df=m.atk-d.atk,dn=card(d.id).name;
  if(df>0){yo.f[t]=null;yo.lp-=df;lg(`${nm} destrói ${dn}: -${df} LP.`)}
  else if(df==0){yo.f[t]=null;me.f[a]=null;lg(`${nm} e ${dn} se destroem.`)}
  else{me.f[a]=null;me.lp+=df;lg(`${nm} é destruído por ${dn}: -${-df} LP.`)}}
 chk();return true}
function aiStep(){if(B.over||B.turn!='o')return;const a=Ai.next(B);
 const ok=a&&(a.t=='sum'?summon('o',a.i):a.t=='spell'?spell('o',a.i):attack('o',a.a,a.tg));
 if(!ok)return endTurn();render();if(!B.over)setTimeout(aiStep,800)}
function slots(s,w){return s.f.map((m,i)=>{const c=m&&card(m.id);return `<div class="sl ${m?'f':''} ${w=='p'&&B.sel===i?'sel':''}" data-w="${w}" data-i="${i}">${m?`${c.name}<br>ATK ${m.atk}${m.used?' ✓':''}`:''}</div>`}).join('')}
function render(){const p=B.p,o=B.o,my=B.turn=='p'&&!B.over;
 ui.innerHTML=`<div class=bt><div class=hud><span>${o.n}: ${o.lp} LP</span><span>Mão ${o.hand.length} · Deck ${o.deck.length}</span></div>
<div class=row>${slots(o,'o')}</div><div class=log>${B.log.slice(-4).join('<br>')}</div><div class=row>${slots(p,'p')}</div>
<div class=hud><span>${p.n}: ${p.lp} LP</span><span>Turno ${B.n} · ${my?'seu turno':'oponente'}</span></div>
<div class=hand>${p.hand.map((id,i)=>{const c=card(id);return `<div class="hc ${c.type=='spell'?'sp':''}" data-h="${i}">${c.name}<br>${c.type=='monster'?`★${c.level} · ${c.attack}`:c.text}</div>`}).join('')}</div>
<div class=acts><button id=dr>Ataque direto</button><button id=en>Encerrar turno</button></div>
${B.over?`<div class=menu><h1>${B.win?'VITÓRIA':'DERROTA'}</h1><button id=bk>Continuar</button></div>`:''}</div>`}
function battleClick(e){const t=e.target.closest('[data-h],[data-w],#en,#dr,#bk');if(!t)return;
 if(t.id=='bk')return bcb(B.win);if(B.over||B.turn!='p')return;
 if(t.id=='en')return endTurn();
 if(t.id=='dr'){if(B.sel==null||!attack('p',B.sel,null))lg('Selecione um monstro; ataque direto exige campo inimigo vazio.');B.sel=null}
 else if(t.dataset.h!=null){const i=+t.dataset.h,c=card(B.p.hand[i]);if(!(c.type=='monster'?summon('p',i):spell('p',i)))lg('Jogada impossível agora (sacrifícios, zona ou invocação já feita).')}
 else if(t.dataset.w=='p'){const m=B.p.f[+t.dataset.i];if(m&&B.n<2)lg('Sem ataques no primeiro turno.');else if(m&&!m.used)B.sel=+t.dataset.i}
 else if(B.sel!=null){attack('p',B.sel,+t.dataset.i);B.sel=null}
 render()}
