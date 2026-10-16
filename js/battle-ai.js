// Perfis: {aggr:1} agressivo; {def:1} defensivo; {} tático.
const Ai={
pool(p){return D.cards.filter(c=>['C','U','R','SR','UR'].slice(0,p+1).includes(c.rarity)&&!RL.includes(c.id))},
build(p){const pool=Ai.pool(p),mon=pool.filter(c=>c.type=='monster'&&!c.fusion),
 pick=(arr,n)=>{const d=[],cnt={};let g=0;while(d.length<n&&g++<999){const c=arr[Math.random()*arr.length|0],lim=c.rarity=='SR'||c.rarity=='UR'?1:3;if((cnt[c.id]||0)<lim){cnt[c.id]=(cnt[c.id]||0)+1;d.push(c.id)}}return d};
 const d=[...pick(mon.filter(c=>c.level<=4),14),...pick(mon,10),...pick(pool.filter(c=>c.type=='spell'),9),...pick(pool.filter(c=>c.type=='trap'),7)];
 if(p>=2){const fs=pool.filter(c=>c.fusion&&c.fusion.every(s=>/^M/.test(s)));if(fs.length){const f=fs[Math.random()*fs.length|0];d.splice(0,f.fusion.length+2,...f.fusion,'S009','S009')}}
 return d},
extra(p){return Ai.pool(p).filter(c=>c.fusion).map(c=>c.id)},
next(B){const me=B.o,you=B.p,pr=B.prof,mine=me.f.filter(Boolean),theirs=you.f.filter(Boolean),mx=a=>Math.max(0,...a.map(m=>m.atk)),
 free=me.f.includes(null),stF=me.st.includes(null),gy=me.gy.some(x=>{const c=card(x);return c.type=='monster'&&!c.fusion&&!RL.includes(x)}),
 cnt=(a,s)=>s.f.filter(m=>m&&card(m.id).attr==a).length;
 for(let i=0;i<me.hand.length;i++){const c=card(me.hand[i]);if(c.type!='spell')continue;const e=c.effect,F=c.field;if(!cnd(me,you,e.cond,null,-1))continue;
  const ok={heal:me.lp<=2500,healA:cnt(e.a,me)>0&&me.lp<3500,burn:true,burnA:cnt(e.a,me)>0,draw:me.deck.length>8,destroy:theirs.length>0&&mx(theirs)>=mx(mine),revive:gy&&free,tb:B.n>1&&mine.some(m=>m.pos=='a'&&!m.used),tteam:B.n>1&&mine.some(m=>m.pos=='a'&&!m.used),twall:theirs.length>0&&mine.length>0,toggle:theirs.some(m=>m.pos=='a'&&m.def<mx(mine)),
   bhole:theirs.length>1&&mine.length<theirs.length,storm:you.st.some(Boolean),def:theirs.length>0&&mine.length>0,bounce:theirs.length>0&&mx(theirs)>mx(mine),fuse:fuseOpts(me).length>0,
   purge:theirs.filter(m=>m.atk>=e.v).length>mine.filter(m=>m.atk>=e.v).length,pact:me.lp>2500&&me.deck.length>8,tutor:me.deck.some(id=>card(id).race==e.r),
   equip:mine.length>0&&stF,cont:stF&&!me.st.some(t=>t&&t.id==c.id),field:!!F&&B.fld!=c.id&&cnt(F.a,me)>cnt(F.a,you)}[e.t];
  if(ok)return{t:'spell',i}}
 if(!B.sum){let best=null,bv=0;me.hand.forEach((id,i)=>{const c=card(id);if(c.type!='monster')return;const n=need(c);
  if(mine.length<n||(n==0&&mine.length>=5))return;
  const lost=mine.map(m=>m.atk).sort((a,b)=>a-b).slice(0,n).reduce((a,b)=>a+b,0),v=c.attack-lost+(n==0?1:0);
  if(v>bv){bv=v;best={t:'sum',i,def:!pr.aggr&&(!!pr.def||(theirs.length>0&&mx(theirs)>c.attack&&c.defense>=c.attack*.8))}}});
  if(best)return best}
 const ti=me.hand.findIndex(id=>card(id).type=='trap');if(ti>=0&&stF)return{t:'trap',i:ti};
 for(let k=0;k<5;k++){const m=me.f[k];if(!m||m.moved||m.used||m.fresh)continue;
  if(m.pos=='a'&&!pr.aggr&&mx(theirs)>m.atk&&m.def>m.atk)return{t:'flip',k};
  if(m.pos=='d'&&!pr.def&&B.n>1&&m.atk>mx(theirs))return{t:'flip',k}}
 if(B.n>1)for(let a=0;a<5;a++){const m=me.f[a];if(!m||m.used||m.pos!='a')continue;
  if(!theirs.length)return{t:'atk',a,tg:null};
  let tg=null,tv=-1;you.f.forEach((d,k)=>{if(!d)return;const v=d.pos=='a'?d.atk:d.def;
   if((m.atk>v||(pr.aggr&&d.pos=='a'&&m.atk==v))&&d.atk>tv){tv=d.atk;tg=k}});
  if(tg!=null)return{t:'atk',a,tg}}
 return null}};
