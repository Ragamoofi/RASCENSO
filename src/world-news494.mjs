/* RASCENSO 4.9.4: normalización de titulares, rankings históricos y estimación
   económica de fichajes. Funciones puras; nunca cambia el guardado original. */
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const clubId=/\b([a-z0-9]{2,5}-\d{1,5})\b/gi;
const text=v=>String(v??'');
const sameYear=(news,entry)=>Number(entry?.year)===Number(news?.year);

export function transferFee494(player,fromClub,toClub,marketValue,seed=''){
 const ovr=Number(player?.ovr),age=Number(player?.age);
 if(!Number.isFinite(ovr)||ovr<40||ovr>99||!Number.isFinite(age)||age<15||age>46)return null;
 // La base es la misma fórmula que usa la valoración del jugador en RASCENSO.
 const estimated=Number(marketValue?.({ovr,age,potential:Math.max(ovr,Number(player?.pot||player?.potential||ovr))},fromClub||null));
 if(!Number.isFinite(estimated)||estimated<=0)return null;
 const seller=Number(fromClub?.prestige??fromClub?.level??75);
 const buyer=Number(toClub?.prestige??toClub?.level??75);
 // Club de mayor capacidad económica puede pagar más; variación estable por operación.
 let hash=2166136261;for(const ch of text(seed))hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
 const variance=.9+(hash%2001)/10000; // 0,90-1,10
 const premium=clamp(1+(buyer-seller)*.009,.77,1.35);
 return Math.round(clamp(estimated*variance*premium,35000,245000000)/1000)*1000;
}

export function formatTransferFee494(amount){
 if(!Number.isFinite(amount)||amount<=0)return null;
 const format=(n,d=1)=>n.toLocaleString('es-CL',{maximumFractionDigits:d,minimumFractionDigits:d});
 if(amount>=1e6)return `€${format(amount/1e6)} M`;
 if(amount>=1000)return `€${format(amount/1000,0)} mil`;
 return `€${format(amount,0)}`;
}

export function enrichWorld494(state,helpers={}){
 if(!state?.world)return state;
 const {getMeta=()=>null,getClub=()=>null,getLive=()=>null,marketValue=()=>0}=helpers;
 const old=state.world;
 // No recalcular temporadas pasadas ni alterar sus resultados o puntuaciones.
 const awards=(old.awards||[]).map(award=>{
  if(!Array.isArray(award?.ranking))return award;
  return {...award,ranking:award.ranking.map(r=>{
   if(r.you)return {...r,cc:state.country||r.cc||null};
   const real=String(r.id||'').startsWith('fm26:')?getMeta({id:r.id}):!r.id?getMeta({name:r.name}):null;
   // Un jugador auténtico se identifica por su UID, o por nombre único no ambiguo.
   if(!real?.cc)return r;
   return {...r,cc:real.cc};
  })};
 });
 const news=(old.news||[]).map(n=>{
  if(n?.kind!=='transfer')return n;
  let title=text(n.title),desc=text(n.text);
  const pattern=/\bTraspaso de ([a-z0-9]{2,5}-\d{1,5}) a ([a-z0-9]{2,5}-\d{1,5})\b/i;
  const match=pattern.exec(desc);
  const transfers=state.fm26?.changes?.[n.playerId]?.transferHistory||[];
  const record=transfers.filter(t=>sameYear(n,t)).at(-1);
  const fromId=match?.[1]||record?.from||null;
  const toId=match?.[2]||record?.to||n.clubId||null;
  const from=fromId?getClub(fromId):null;
  const to=toId?getClub(toId):null;
  const fromName=from?.name||(fromId?'club sin identificar':null);
  const toName=to?.name||(toId?'club sin identificar':null);
  // Nombres de clubes en lugar de claves internas; si no se reconoce, no inventar.
  desc=desc.replace(pattern,()=>`Traspaso de ${fromName||'un club'} a ${toName||'otro club'}`);
  desc=desc.replace(clubId,(token)=>getClub(token)?.name||'club sin identificar');
  title=title.replace(clubId,(token)=>getClub(token)?.name||'club sin identificar');
  if(toName)title=title.replace(/ficha por otro club/i,`ficha por ${toName}`);
  // En noticias históricas usamos la media/edad de la época, no la del último guardado.
  const original=String(n.playerId||'').startsWith('fm26:')?getMeta({id:n.playerId}):!n.playerId?getMeta({name:title.replace(/ ficha por .*/i,'')}):null;
  const current=getLive(n.playerId,state);
  const historic=original?{
   ovr:original.ovr,age:Number(original.age)+Math.max(0,Number(n.year||2026)-2026),
   pot:current?.pot??original.pot??original.ovr
  }:current?{
   ovr:current.ovr,age:Math.max(15,Number(current.age||20)-Math.max(0,Number(state.world.year)-Number(n.year))),
   pot:current.pot
  }:null;
  const hasSeller=!!fromId||/acepta la salida de/i.test(desc);
  const amount=hasSeller&&historic?transferFee494(historic,from,to,marketValue,`${n.playerId}:${n.year}:${fromId}:${toId}`):null;
  const price=formatTransferFee494(amount);
  if(price&&!/\b(?:estimad[oa]|valor del traspaso|monto del traspaso|€)\b/i.test(desc)){
   // Resumen corto: el importe se ve en las tarjetas sin quedar tapado por el texto.
   let route=fromName&&toName?`${fromName} → ${toName}`:null;
   if(!route){
    const npc=/^(.+?) acepta la salida de /i.exec(desc);
    const destination=/ ficha por (.+)$/i.exec(title);
    if(npc&&destination)route=`${npc[1]} → ${destination[1]}`;
   }
   desc=`${route?route+' · ':''}${price} (traspaso estimado)${route?'':'. '+desc}`;
  }
  return {...n,title,text:desc};
 });
 return {...state,world:{...old,awards,news}};
}
