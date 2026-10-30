/* Protocolo de intercambio a futuro. La IA puede proponer narración y opciones,
 * nunca cambiar directamente marcadores, OVR, contratos, fichajes ni guardados.
 * NO se realizan llamadas a modelos y NO se guardan claves en GitHub Pages.
 */
const limit=(v,n)=>String(v??'').trim().slice(0,n);
export function narrativeContext(s){return {
 schemaVersion:1,game:'RASCENSO',season:(s.startYear||2026)+s.age-(s.startAge||16),
 player:{name:limit(s.name,44),position:limit(s.position,5),age:s.age,overall:s.ovr,character:limit(s.personality,35),dream:limit(s.dream,35)},
 clubId:limit(s.clubId,50),favoriteClubId:limit(s.fanClubId,50),
 lastSeasons:(s.history||[]).slice(-3).map(h=>({year:h.year,clubId:h.clubId,matches:h.matches,goals:h.goals,assists:h.assists,leaguePosition:h.leaguePosition})),
 recentEvents:(s.storyLog||[]).slice(-5).map(x=>({id:limit(x.id,40),choice:limit(x.choice,140),result:limit(x.result,180)}))
};}
export function validateNarrativeProposal(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Propuesta inválida');
 const type=limit(data.type,20);if(type!=='career_event')throw Error('Tipo de evento no permitido');
 const narration=limit(data.narration,1400),title=limit(data.title,110);
 if(!narration||!title||!Array.isArray(data.options)||data.options.length<2||data.options.length>4)throw Error('Evento incompleto');
 const options=data.options.map((o,i)=>{
  if(!o||typeof o!=='object'||typeof o.title!=='string'||!o.title.trim())throw Error('Opción inválida');
  const effects={};
  for(const [k,v] of Object.entries(o.effects||{})){
   if(!['coachTrust','morale','reputation'].includes(k)||typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>3||!Number.isInteger(v))throw Error('Efecto no autorizado');
   effects[k]=v;
  }
  return {id:`choice-${i}`,title:limit(o.title,95),detail:limit(o.detail,220),effects};
 });
 return {type,title,narration,options};
}
