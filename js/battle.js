// Fase 2: posições ATK/DEF, mágicas, armadilhas (com resposta), cemitério, Exodia, descarte, perfis de IA.
let B,bcb;
const opp=w=>w=='p'?'o':'p',need=c=>c.level>=7?2:c.level>=5?1:0,EX=['EX01','EX02','EX03','EX04','EX05'],
shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a},
side=(n,d)=>({n,lp:4000,deck:shuffle([...d]),hand:[],f:Array(5).fill(null),st:Array(5).fill(null),gy:[]}),
lg=t=>B.log.push(t),kill=(s,i)=>{if(s.f[i]){s.gy.push(s.f[i].id);s.f[i]=null}},
mon=(c,pos)=>({id:c.id,atk:c.attack,def:c.defense,pos,used:false,moved:false,fresh:true});
function startBattle(a,f,prof,done){bcb=done;B={p:side(esc(a.n),a.deck),o:side(esc(f.n),f.deck),prof:prof||{},turn:'p',n:0,sum:false,sel:null,def:false,pr:null,log:['O duelo começa!'],over:false,win:false};
 for(let i=0;i<5;i++){draw(B.p);draw(B.o)}beginTurn()}
function draw(s){if(!s.deck.length){s.lp=0;return}s.hand.push(s.deck.pop())}
function beginTurn(){B.n++;B.sum=false;B.sel=null;const s=B[B.turn];s.f.forEach(m=>m&&(m.used=m.moved=m.fresh=false));if(B.n>1)draw(s);chk();render();
 if(B.turn=='o'&&!B.over)setTimeout(aiStep,900)}
function endTurn(){if(B.over||B.pr)return;const s=B[B.turn];
 while(s.hand.length>6){const c=card(s.hand.pop());s.gy.push(c.id);lg(`${s.n} descartou ${c.name}.`)}
 B.turn=opp(B.turn);beginTurn()}
function chk(){if(B.over)return;
 for(const w of['p','o'])if(EX.every(e=>B[w].hand.includes(e))){B[opp(w)].lp=0;lg(`${B[w].n} reuniu Exodia!`)}
 const p=B.p.lp<=0,o=B.o.lp<=0;if(p||o){B.p.lp=Math.max(0,B.p.lp);B.o.lp=Math.max(0,B.o.lp);B.over=true;B.win=!p}}
function summon(w,i,def,done){done=done||(()=>{});const me=B[w],c=card(me.hand[i]);
 if(!c||c.type!='monster'||B.sum||B.over)return done(false);const n=need(c),
 mine=me.f.map((m,k)=>m?k:-1).filter(k=>k>=0).sort((a,b)=>me.f[a].atk-me.f[b].atk);
 if(mine.length<n||(n==0&&mine.length>=5))return done(false);
 mine.slice(0,n).forEach(k=>{lg(`${card(me.f[k].id).name} foi sacrificado.`);kill(me,k)});
 const k=me.f.indexOf(null);me.f[k]=mon(c,def?'d':'a');me.hand.splice(i,1);B.sum=true;lg(`${me.n} invocou ${c.name} em ${def?'DEF':'ATK'}.`);
 trap(opp(w),'sum',{w,k},()=>{chk();done(true)})}
function spell(w,i){const me=B[w],yo=B[opp(w)],c=card(me.hand[i]);if(!c||c.type!='spell'||B.over)return false;const e=c.effect,
 mine=me.f.filter(Boolean).sort((a,b)=>b.atk-a.atk),theirs=yo.f.filter(Boolean).sort((a,b)=>b.atk-a.atk),
 rv=me.gy.map(card).filter(x=>x.type=='monster').sort((a,b)=>b.attack-a.attack)[0];
 if(({boost:!mine.length,destroy:!theirs.length,def:!theirs.length,revive:!rv||!me.f.includes(null),storm:![...me.st,...yo.st].some(Boolean)})[e.t])return false;
 me.hand.splice(i,1);me.gy.push(c.id);
 if(e.t=='heal')me.lp+=e.v;if(e.t=='burn')yo.lp-=e.v;if(e.t=='boost'){mine[0].atk+=e.v;mine[0].def+=e.v}
 if(e.t=='draw')for(let k=0;k<e.v;k++)draw(me);
 if(e.t=='destroy')kill(yo,yo.f.indexOf(theirs[0]));
 if(e.t=='def')theirs[0].pos='d';
 if(e.t=='revive'){me.gy.splice(me.gy.indexOf(rv.id),1);me.f[me.f.indexOf(null)]=mon(rv,'a')}
 if(e.t=='bhole')[me,yo].forEach(s=>s.f.forEach((m,k)=>kill(s,k)));
 if(e.t=='storm')[me,yo].forEach(s=>s.st.forEach((t,k)=>{if(t){s.gy.push(t);s.st[k]=null}}));
 lg(`${me.n} usou ${c.name}.`);chk();return true}
function setTrap(w,i){const me=B[w],c=card(me.hand[i]),k=me.st.indexOf(null);if(!c||c.type!='trap'||k<0||B.over)return false;
 me.st[k]=c.id;me.hand.splice(i,1);lg(`${me.n} baixou uma carta.`);return true}
function flip(w,k){const m=B[w].f[k];if(!m||m.moved||m.used||m.fresh||B.over)return false;
 m.pos=m.pos=='a'?'d':'a';m.moved=true;lg(`${B[w].n} mudou ${card(m.id).name} para ${m.pos=='a'?'ATK':'DEF'}.`);return true}
function trap(d,tr,x,cont){const s=B[d],ix=s.st.map((t,i)=>t&&card(t).effect.tr==tr?i:-1).filter(i=>i>=0);
 if(!ix.length||B.over)return cont(false);
 const run=()=>{const i=ix[0],c=card(s.st[i]);s.st[i]=null;s.gy.push(c.id);lg(`${s.n} ativa ${c.name}!`);cont(fx(d,c.effect.t,x))};
 if(d=='o')return run();
 B.pr={txt:`Ativar ${card(s.st[ix[0]]).name}?`,opts:[['Ativar',run],['Não',()=>cont(false)]]};render()}
function fx(d,t,x){const at=B[x.w],df=B[d],m=at.f[x.k];if(!m)return false;
 if(t=='cyl'){at.lp-=m.atk;return true}
 if(t=='mir'){at.f.forEach((q,i)=>q&&q.pos=='a'&&kill(at,i));return true}
 if(t=='ring'){kill(at,x.k);at.lp-=m.atk;df.lp-=m.atk;return true}
 if(t=='pit'&&m.atk>=1500)kill(at,x.k);
 if(t=='jail')kill(at,x.k);
 if(t=='flood')[at,df].forEach(s=>s.f.forEach((q,i)=>kill(s,i)));
 return t=='flood'}
function attack(w,a,t,done){done=done||(()=>{});const me=B[w],yo=B[opp(w)],m=me.f[a];
 if(B.n<2||B.over||!m||m.used||m.pos!='a'||(t==null?yo.f.some(Boolean):!yo.f[t]))return done(false);
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
 const nx=ok=>{if(!ok)return endTurn();render();if(!B.over)setTimeout(aiStep,800)};
 if(a.t=='sum')summon('o',a.i,a.def,nx);else if(a.t=='atk')attack('o',a.a,a.tg,nx);
 else nx(a.t=='spell'?spell('o',a.i):a.t=='trap'?setTrap('o',a.i):flip('o',a.k))}
const mslots=(s,w)=>s.f.map((m,i)=>`<div class="sl ${m?'f':''} ${m&&m.pos=='d'?'d':''} ${w=='p'&&B.sel===i?'sel':''}" data-w="${w}" data-i="${i}">${m?`${card(m.id).name}<br>${m.pos=='a'?'ATK '+m.atk:'DEF '+m.def}${m.used?' ✓':''}`:''}</div>`).join(''),
tslots=(s,w)=>s.st.map(t=>`<div class="st ${t?'f':''}">${t?(w=='p'?card(t).name:'?'):''}</div>`).join('');
function render(){const p=B.p,o=B.o,my=B.turn=='p'&&!B.over;
 ui.innerHTML=`<div class=bt><div class=hud><span>${o.n}: ${o.lp} LP</span><span>Mão ${o.hand.length} · Deck ${o.deck.length} · Cem. ${o.gy.length}</span></div>
<div class=row>${tslots(o,'o')}</div><div class=row>${mslots(o,'o')}</div><div class=log>${B.log.slice(-3).join('<br>')}</div><div class=row>${mslots(p,'p')}</div><div class=row>${tslots(p,'p')}</div>
<div class=hud><span>${p.n}: ${p.lp} LP</span><span>Turno ${B.n} · ${my?'seu turno':'oponente'} · Cem. ${p.gy.length}</span></div>
<div class=hand>${p.hand.map((id,i)=>{const c=card(id);return `<div class="hc ${c.type}" data-h="${i}">${c.name}<br>${c.type=='monster'?`★${c.level} · ${c.attack}/${c.defense}`:c.text}</div>`}).join('')}</div>
<div class=acts><button id=md>Invocar: ${B.def?'DEF':'ATK'}</button><button id=dr>Ataque direto</button><button id=fl>Mudar posição</button><button id=en>Encerrar turno</button></div>
${B.pr?`<div class=menu><p>${B.pr.txt}</p>${B.pr.opts.map((o,i)=>`<button data-pr=${i}>${o[0]}</button>`).join('')}</div>`:''}
${B.over?`<div class=menu><h1>${B.win?'VITÓRIA':'DERROTA'}</h1><button id=bk>Continuar</button></div>`:''}</div>`}
function battleClick(e){const t=e.target.closest('[data-pr],[data-h],[data-w],#en,#dr,#fl,#md,#bk');if(!t)return;
 if(t.id=='bk')return bcb(B.win);
 if(t.dataset.pr!=null){const f=B.pr.opts[+t.dataset.pr][1];B.pr=null;f();return render()}
 if(B.over||B.turn!='p'||B.pr)return;
 if(t.id=='en')return endTurn();
 if(t.id=='md')B.def=!B.def;
 else if(t.id=='fl'){if(B.sel==null||!flip('p',B.sel))lg('Não é possível mudar a posição agora.');B.sel=null}
 else if(t.id=='dr'){if(B.sel==null)lg('Selecione um monstro.');else{const s=B.sel;B.sel=null;return attack('p',s,null,ok=>{if(!ok)lg('Ataque direto exige monstro em ATK e campo inimigo vazio.');render()})}}
 else if(t.dataset.h!=null){const i=+t.dataset.h,c=card(B.p.hand[i]);
  if(c.type=='monster')return summon('p',i,B.def,ok=>{if(!ok)lg('Invocação impossível (sacrifícios, zona ou já invocou).');render()});
  if(!(c.type=='spell'?spell('p',i):setTrap('p',i)))lg('Jogada impossível agora.')}
 else if(t.dataset.w=='p'){if(B.p.f[+t.dataset.i])B.sel=+t.dataset.i}
 else if(B.sel!=null){const s=B.sel;B.sel=null;return attack('p',s,+t.dataset.i,ok=>{if(!ok)lg('Ataque inválido (1º turno, monstro em DEF ou já atacou).');render()})}
 render()}
