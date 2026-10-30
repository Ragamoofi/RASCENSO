/* RASCENSO 1.0: contexto deportivo verificable y recapitulación de temporada.
 * No inventa rivales ni resultados y nunca reescribe los partidos simulados.
 */
const clip=(v,min,max)=>Math.min(max,Math.max(min,v));
export function standoutMatch(s){
 const season=s?.lastSeason;
 if(!season||!Array.isArray(season.playerMatches)||!season.playerMatches.length)return null;
 const opponents=new Map((season.table||[]).map(t=>[t.id,t]));
 const latest=season.playerMatches.filter(m=>m&&m.home&&m.away&&/^[0-9]+-[0-9]+$/.test(String(m.score)));
 if(!latest.length)return null;
 const maxRound=Math.max(...latest.map(m=>Number(m.round)||0));
 const candidates=latest.map(m=>{
  const isHome=m.home===season.clubId, opponentId=isHome?m.away:m.home;
  const position=opponents.get(opponentId)?.position||99;
  const [hg,ag]=String(m.score).split('-').map(Number);
  const diff=isHome?hg-ag:ag-hg;
  const rating=(m.goals||0)*4+(m.assists||0)*3+(m.played?3:0)+(position<=4?5:0)+(Number(m.round)>=maxRound-3?5:0)+(Math.abs(diff)<=1?2:0)+(diff>0?1:0);
  return {...m,opponentId,position,isHome,ourGoals:isHome?hg:ag,theirGoals:isHome?ag:hg,diff,rating};
 });
 candidates.sort((a,b)=>b.rating-a.rating||(Number(b.round)||0)-(Number(a.round)||0));
 return candidates[0];
}
export function matchContext(s, getClub){
 const m=standoutMatch(s);if(!m)return null;
 const home=getClub(m.home),away=getClub(m.away),opponent=getClub(m.opponentId);
 const result=m.diff>0?'victoria':m.diff===0?'empate':'derrota';
 const context=m.position<=4?'uno de los equipos más fuertes de la competición':m.round>=26?'una fecha del tramo final del campeonato':'un rival de la competición';
 return {...m,homeName:home?.name||m.home,awayName:away?.name||m.away,opponentName:opponent?.name||m.opponentId,
  result,context,headline:`${home?.name||m.home} ${m.score} ${away?.name||m.away}`};
}
export function seasonReview(s, getClub){
 const a=s?.lastSeason;if(!a)return null;
 const club=getClub(a.clubId)?.name||a.club||'Tu club';
 const starts=Number(a.matches)||0,goals=Number(a.goals)||0,assists=Number(a.assists)||0;
 const overallDelta=(Number(a.ovrAfter)||0)-(Number(a.ovrBefore)||0);
 const position=Number(a.leaguePosition)||null;
 const medal=Array.isArray(a.titles)&&a.titles.length>0;
 const solid=starts>=23, impactful=goals+assists>=16, injured=(a.injuryWeeks||0)>=5;
 const voices=[];
 if(medal)voices.push({speaker:'Entrenador',tone:'orgullo',quote:`Ganamos ${a.titles.join(' y ')}. El grupo se lo ganó en la cancha. Ahora empieza otro desafío.`});
 else if(impacted(goals,assists,starts))voices.push({speaker:'Prensa deportiva',tone:'reconocimiento',quote:`${goals} goles y ${assists} asistencias: tu aporte con ${club} fue uno de los temas de la campaña.`});
 else if(injured)voices.push({speaker:'Entrenador',tone:'apoyo',quote:'Las lesiones nos complicaron. Lo principal es recuperar tu continuidad para la próxima temporada.'});
 else if(!solid)voices.push({speaker:'Entrenador',tone:'exigencia',quote:`Jugaste ${starts} encuentros. Todavía queda un puesto por pelear; necesitamos constancia.`});
 else if(position&&position<=4)voices.push({speaker:'Prensa deportiva',tone:'expectativa',quote:`${club} terminó ${position}° y llega con expectativas renovadas al próximo campeonato.`});
 else voices.push({speaker:'Entrenador',tone:'balance',quote:'Terminamos otra temporada. Hay cosas buenas y otras que mejorar. El siguiente año empieza desde cero.'});
 const alternate=position&&position>=12?`La clasificación exige mejorar: ${club} terminó ${position}°.`:
  `El equipo terminó ${position||'sin posición registrada'}° en ${a.leagueName||'su competición'}.`;
 const summary=[`${starts} partidos, ${goals} goles y ${assists} asistencias.`,alternate,
  overallDelta>0?`Tu media subió ${overallDelta} punto${overallDelta===1?'':'s'}.`:overallDelta<0?`Tu media bajó ${Math.abs(overallDelta)} punto${overallDelta===-1?'':'s'}.`:'Tu media no cambió esta temporada.',
  injured?`Sufriste ${a.injuryWeeks} semanas de lesión.`:null].filter(Boolean);
 return {year:a.year,club,league:a.leagueName||'Competición de referencia',position,starts,goals,assists,ovrBefore:a.ovrBefore,ovrAfter:a.ovrAfter,overallDelta,injuryWeeks:a.injuryWeeks||0,medal,titles:[...(a.titles||[])],summary,voice:voices[0],match:matchContext(s,getClub)};
}
function impacted(goals,assists,starts){return starts>=12&&goals+assists>=16;}
export function chatContext(s, getClub){
 const review=seasonReview(s,getClub),club=getClub(s.clubId);
 return {
  game:'RASCENSO',mode:'intercambio voluntario con ChatGPT',year:(s.startYear||2026)+s.age-(s.startAge||16),
  player:{name:String(s.name||'').slice(0,44),age:s.age,position:s.position,ovr:s.ovr,personality:s.personality,dream:s.dream},
  currentClub:club?.name||'Sin equipo',fanClub:getClub(s.fanClubId)?.name||'No elegido',
  recentSeasons:(s.history||[]).slice(-4).map(x=>({year:x.year,club:x.club,position:x.leaguePosition,played:x.matches,goals:x.goals,assists:x.assists})),
  lastReview:review?{year:review.year,club:review.club,position:review.position,titles:review.titles,summary:review.summary}:null,
  currentStage:s.phase,currentScene:s.pendingEvent||null
 };
}
export function chatPrompt(s,getClub,userMessage){
 const msg=String(userMessage||'').trim().slice(0,1200);
 const context=JSON.stringify(chatContext(s,getClub),null,2);
 return `Eres el Director Narrativo de RASCENSO, un juego de carrera de futbolista. Escribe en español latinoamericano natural, con diálogos cortos y personajes consistentes. Interpreta las decisiones y escenas deportivas del usuario, sin inventar partidos ya jugados ni alterar los resultados, contratos, media, puntos, salarios o fichajes. No des por hecho que un rumor es una oferta formal. No decidas por el jugador. Haz avanzar solo una escena pequeña y devuelve el turno.\n\nCONTEXTO DEL JUEGO (datos del motor; no los modifiques):\n${context}\n\nMENSAJE DEL JUGADOR:\n${msg||'Quiero conversar sobre mi futuro deportivo y lo que ocurrió en mi última temporada.'}`;
}
