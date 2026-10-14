// Perfis: {aggr:1} agressivo (aceita trocas iguais, nunca recua); {def:1} defensivo (prefere DEF); {} tático.
const Ai={
pool(p){return D.cards.filter(c=>['C','U','R','SR','UR'].slice(0,p+1).includes(c.rarity)&&!c.id.startsWith('EX'))},
build(p){const pool=Ai.pool(p),mon=pool.filter(c=>c.type=='monster'&&!c.fusion),
 pick=(arr,n)=>{const d=[],cnt={};let g=0;while(d.length<n&&g++<999){const c=arr[Math.random()*arr.length|0],lim=c.rarity=='SR'||c.rarity=='UR'?1:3;if((cnt[c.id]||0)<lim){cnt[c.id]=(cnt[c.id]||0)+1;d.push(c.id)}}return d};
 const d=[...pick(mon.filter(c=>c.level<=4),14),...pick(mon,10),...pick(pool.filter(c=>c.type=='spell'),9),...pick(pool.filter(c=>c.type=='trap'),7)];
 if(p>=2){const fs=pool.filter(c=>c.fusion&&c.fusion.every(s=>s[0]!='~')&&c.fusion.length<3);if(fs.length){const f=fs[Math.random()*fs.length|0];d.splice(0,f.fusion.length+2,...f.fusion,'SP010','SP010')}}
 return d},
extra(p){return Ai.pool(p).filter(c=>c.fusion).map(c=>c.id)},
next(B){const me=B.o,you=B.p,pr=B.prof,mine=me.f.filter(Boolean),theirs=you.f.filter(Boolean),mx=a=>Math.max(0,...a.map(m=>m.atk)),
 free=me.f.includes(null),gy=me.gy.some(x=>card(x).type=='monster');
 for(let i=0;i<me.hand.length;i++){const c=card(me.hand[i]);if(c.type!='spell')continue;
  const ok={heal:me.lp<=2500,draw:me.deck.length>8,burn:true,boost:mine.length>0,destroy:theirs.length>0&&mx(theirs)>mx(mine),
   revive:gy&&free,fuse:fuseOpts(me).length>0,bhole:theirs.length>1&&mine.length<theirs.length,storm:you.st.some(Boolean),def:theirs.length>0&&mine.length>0}[c.effect.t];
  if(ok)return{t:'spell',i}}
 if(!B.sum){let best=null,bv=0;me.hand.forEach((id,i)=>{const c=card(id);if(c.type!='monster')return;const n=need(c);
  if(mine.length<n||(n==0&&mine.length>=5))return;
  const lost=mine.map(m=>m.atk).sort((a,b)=>a-b).slice(0,n).reduce((a,b)=>a+b,0),v=c.attack-lost+(n==0?1:0);
  if(v>bv){bv=v;best={t:'sum',i,def:!pr.aggr&&(!!pr.def||(theirs.length>0&&mx(theirs)>c.attack&&c.defense>=c.attack*.8))}}});
  if(best)return best}
 const ti=me.hand.findIndex(id=>card(id).type=='trap');if(ti>=0&&me.st.includes(null))return{t:'trap',i:ti};
 for(let k=0;k<5;k++){const m=me.f[k];if(!m||m.moved||m.used||m.fresh)continue;
  if(m.pos=='a'&&!pr.aggr&&mx(theirs)>m.atk&&m.def>m.atk)return{t:'flip',k};
  if(m.pos=='d'&&!pr.def&&B.n>1&&m.atk>mx(theirs))return{t:'flip',k}}
 if(B.n>1)for(let a=0;a<5;a++){const m=me.f[a];if(!m||m.used||m.pos!='a')continue;
  if(!theirs.length)return{t:'atk',a,tg:null};
  let tg=null,tv=-1;you.f.forEach((d,k)=>{if(!d)return;const v=d.pos=='a'?d.atk:d.def;
   if((m.atk>v||(pr.aggr&&d.pos=='a'&&m.atk==v))&&d.atk>tv){tv=d.atk;tg=k}});
  if(tg!=null)return{t:'atk',a,tg}}
 return null}};
