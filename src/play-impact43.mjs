/* RASCENSO 4.3 — impacto deportivo verificable, aplicado una vez al cerrar la temporada. */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const round=v=>Math.round(v*10)/10;
/** La calidad y dificultad determinan el peso; jugar manualmente importa más que simular. */
export function momentWeight(result){
 const quality=clamp(Number(result.quality)||.4,0,1);
 return (result.auto?.62:1.14)*(result.decisive?1.35:1)*(0.75+quality*.5);
}
export function seasonMatchImpact(results=[]){
 const played=results.filter(x=>x&&typeof x.success==='boolean');
 const successful=played.filter(x=>x.success),manual=played.filter(x=>!x.auto);
 const raw=played.reduce((a,x)=>{
  const w=momentWeight(x),v=x.success?1:-.7;
  a.morale+=v*2.5*w;
  a.trust+=v*2.25*w;
  a.fans+=v*2*w;
  a.reputation+=x.success?(x.decisive?1.15:.55)*w:-.2*w;
  a.pressure+=x.success?-.5*w:.4*w;
  return a;
 },{morale:0,trust:0,fans:0,reputation:0,pressure:0});
 const effect={
  morale:round(clamp(raw.morale,-9,9)),
  trust:round(clamp(raw.trust,-8,9)),
  fans:round(clamp(raw.fans,-6,8)),
  reputation:round(clamp(raw.reputation,-3,5)),
  pressure:round(clamp(raw.pressure,-2,3))
 };
 // Solo noticias basadas en jugadas realmente resueltas; nada de eventos fabricados.
 const standout=[...successful].sort((a,b)=>Number(!!b.decisive)-Number(!!a.decisive)||momentWeight(b)-momentWeight(a))[0];
 const marked=standout&&(!standout.auto||standout.decisive)?standout:null;
 const slump=played.length>=3&&successful.length===0&&manual.length>=2;
 return {total:played.length,successes:successful.length,manual:manual.length,
  decisive:played.filter(x=>x.decisive).length,effect,standout:marked,slump};
}
export function matchImpactHeadline(s,year,impact){
 if(!impact.total)return null;
 const club=s.clubId;
 if(impact.standout){
  const x=impact.standout,action=x.kind==='defend'?'una intervención defensiva clave':x.credit==='assist'?'una asistencia decisiva':'una jugada clave';
  return {year,kind:'you',title:s.name+' aparece en los momentos decisivos',
   text:s.name+' protagonizó '+action+' contra '+x.rival+' en el minuto '+x.minute+'. Su rendimiento en '+impact.successes+' de '+impact.total+' momentos destacados de la temporada fortaleció su consideración deportiva.',
   mine:true,clubId:club,weight:160};
 }
 if(impact.slump)return {year,kind:'you',title:s.name+' busca recuperar confianza',
   text:'Tras '+impact.total+' ocasiones importantes sin éxito, '+s.name+' enfrenta críticas deportivas y el desafío de recuperar su nivel.',
   mine:true,clubId:club,weight:95};
 return null;
}
/** Proyección antes de simular temporada; no afirmar que ya cambió nada. */
export function impactPreview(results=[]){
 const a=seasonMatchImpact(results);
 if(!a.total)return 'Tus actuaciones en partidos importantes afectarán la confianza del DT, la hinchada y tu reputación al cerrar el año.';
 const signed=(v)=>v>0?'+'+v:String(v);
 return a.successes+'/'+a.total+' jugadas logradas · Proyección fin de temporada: DT '+signed(a.effect.trust)+', hinchada '+signed(a.effect.fans)+', reputación '+signed(a.effect.reputation)+'.';
}
