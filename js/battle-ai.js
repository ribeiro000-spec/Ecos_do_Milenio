const Ai={next(B){const me=B.o,you=B.p,mine=me.f.filter(Boolean),theirs=you.f.filter(Boolean),mx=a=>Math.max(0,...a.map(m=>m.atk));
 for(let i=0;i<me.hand.length;i++){const c=card(me.hand[i]);if(c.type!='spell')continue;
  const ok={heal:me.lp<=2500,draw:me.deck.length>8,burn:true,boost:mine.length>0,destroy:theirs.length>0&&mx(theirs)>mx(mine)}[c.effect.t];
  if(ok)return{t:'spell',i}}
 if(!B.sum){let best=null,bv=0;me.hand.forEach((id,i)=>{const c=card(id);if(c.type!='monster')return;const n=need(c);
  if(mine.length<n||(n==0&&mine.length>=5))return;
  const lost=mine.map(m=>m.atk).sort((a,b)=>a-b).slice(0,n).reduce((a,b)=>a+b,0),v=c.attack-lost+(n==0?1:0);
  if(v>bv){bv=v;best={t:'sum',i}}});if(best)return best}
 if(B.n>1)for(let a=0;a<5;a++){const m=me.f[a];if(!m||m.used)continue;
  if(!theirs.length)return{t:'atk',a,tg:null};
  let tg=null,tv=-1;you.f.forEach((d,k)=>{if(d&&d.atk<m.atk&&d.atk>tv){tv=d.atk;tg=k}});
  if(tg!=null)return{t:'atk',a,tg}}
 return null}};
