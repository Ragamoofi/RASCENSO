import { profileMatchEffects } from './archetypes17.mjs';
/* Motor de liga ORIGINAL de RASCENSO. Cada punto nace de un partido simulado.
 * No utiliza ni reproduce el código de Copero.
 */
import { COUNTRIES } from './countries.mjs';
import { identitySeasonEffects, preparationEffects, creatorIdentityEffects } from './career08.mjs';
import { seasonAgendaEffects } from './agenda09.mjs';
import { momentScoreDelta } from './moments15.mjs';
import { fixturePlayDelta } from './plays30.mjs';
import { VERIFIED_LEAGUES, getInauguralLeague } from './leagues2026.mjs';
import { dynamicLevel, coachFor } from './world20.mjs';
import { squadRole, threadEffects, coachSeasonEffects } from './career20.mjs';
const bound=(v,a,b)=>Math.max(a,Math.min(b,v));
function rand(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return ()=>{h+=0x6d2b79f5;let t=Math.imul(h^(h>>>15),1|h);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
function goals(mean,random){let n=0,p=Math.exp(-mean),prod=1;do{n++;prod*=random();}while(prod>p&&n<=10);return Math.min(8,n-1);}
function roleOf(state,level){const diff=(state.ovr||60)-level+(state.coachTrust-50)*.075;
 return diff>=-3?'Titular':diff>=-12?'Rotación':diff>=-22?'Suplente':'Reserva';}
export function getCompetitionForCareer(state){
 const mapping=state?.leagueRosters||{};
 const match=VERIFIED_LEAGUES.find(l=>(mapping[l.id]||l.teamIds).includes(state?.clubId));
 if(match)return {...match,teamIds:mapping[match.id]||match.teamIds,rosterStatus:'2026 verificado'};
 // Legacy saves or countries not yet validated keep playing in an explicitly marked reference competition.
 const country=COUNTRIES.find(c=>c.clubs.some(x=>x.id===state?.clubId));
 return country?{id:`REF-${country.code}`,countryCode:country.code,name:`Circuito de referencia · ${country.name}`,format:'reference',verified:false,season:'No verificada',tier:null,teamIds:[]}:null;
}
export function leagueParticipants(countryCode,clubId,state={}){
 const league=getCompetitionForCareer({...state,clubId});
 const country=COUNTRIES.find(c=>c.code===countryCode);
 if(!country)return [];
 const live=list=>list.map(c=>({...c,level:dynamicLevel(state,c)}));
 if(league?.verified)return live(league.teamIds.map(id=>country.clubs.find(c=>c.id===id)).filter(Boolean));
 // Unverified countries: explicitly fictional grouping, never presented as a real 2026 league.
 const active=country.clubs.filter(c=>!c.inactive);
 const selected=active.filter(c=>!getInauguralLeague(c.id)).sort((a,b)=>b.level-a.level||a.id.localeCompare(b.id));
 if(!selected.some(c=>c.id===clubId)){const mine=country.clubs.find(c=>c.id===clubId);if(mine)selected.unshift(mine);}
 const size=Math.min(16,selected.length);const top=selected.slice(0,size);if(clubId&&!top.some(c=>c.id===clubId)){const mine=country.clubs.find(c=>c.id===clubId);if(mine)top[top.length-1]=mine;}return live(top);
}
/** Two-tier countries use the actual 2026 rosters as a baseline. Subsequent changes are fictional results of this save, never real-world future claims. */
export function nextLeagueRosters(state,playedLeague){
 const current=Object.fromEntries(VERIFIED_LEAGUES.map(l=>[l.id,[...(state.leagueRosters?.[l.id]||l.teamIds)]]));
 const code=playedLeague.countryCode;
 const higher=VERIFIED_LEAGUES.find(l=>l.countryCode===code&&l.tier===1);
 const lower=VERIFIED_LEAGUES.find(l=>l.countryCode===code&&l.tier===2);
 if(!higher||!lower)return current;
 const neutral=(league)=>playLeague({
  ...state,clubId:current[league.id][0],ovr:40,coachTrust:0,position:'POR',injuryProfile:'resistente',
  seasonPlan:'equilibrio',neutralLeague:true,
 });
 const hi=playedLeague.leagueId===higher.id?playedLeague:neutral(higher);
 const lo=playedLeague.leagueId===lower.id?playedLeague:neutral(lower);
 const drops=hi.standings.slice(-2).map(r=>r.id),rises=lo.standings.slice(0,2).map(r=>r.id);
 if(drops.length!==2||rises.length!==2)return current;
 current[higher.id]=current[higher.id].filter(id=>!drops.includes(id)).concat(rises);
 current[lower.id]=current[lower.id].filter(id=>!rises.includes(id)).concat(drops);
 return current;
}
/** La lesión comienza en una fecha concreta y afecta jornadas consecutivas del club. */
export function injuryAbsenceSlots(fixtures,clubId,weeks,random){
 const clubIndices=fixtures.map((f,i)=>f.home===clubId||f.away===clubId?i:-1).filter(i=>i>=0);
 if(!weeks||!clubIndices.length)return new Set();
 const count=Math.min(clubIndices.length,Math.max(0,Math.floor(weeks)));
 const start=Math.floor(random()*Math.max(1,clubIndices.length-count+1));
 return new Set(clubIndices.slice(start,start+count));
}
export function calendar(clubs){
 const arr=clubs.map(x=>x.id);if(arr.length<2)return [];
 if(arr.length%2)arr.push(null);
 const n=arr.length, rounds=[];let order=[...arr];
 for(let day=0;day<n-1;day++){
  const matches=[];
  for(let j=0;j<n/2;j++){
   const a=order[j],b=order[n-1-j];if(!a||!b)continue;
   matches.push(day%2===0?[a,b]:[b,a]);
  }
  rounds.push(matches);order=[order[0],order[n-1],...order.slice(1,n-1)];
 }
 const fixtures=[];
 for(const [day,matches] of rounds.entries())for(const [home,away] of matches)fixtures.push({round:day+1,home,away});
 for(const [day,matches] of rounds.entries())for(const [home,away] of matches)fixtures.push({round:day+rounds.length+1,home:away,away:home});
 return fixtures;
}
const groups={POR:'goalkeeper',DFC:'defense',LI:'defense',LD:'defense',MCD:'defense',MC:'middle',MI:'middle',MD:'middle',MCO:'middle',EI:'attack',ED:'attack',DC:'attack'};
function normalizedClub(team,level){return {id:team.id,name:team.name,level};}
/** Determinista con la misma carrera, la misma plantilla y el mismo plan. */
export function playLeague(state){
 const country=COUNTRIES.find(c=>c.clubs.some(t=>t.id===state.clubId));if(!country)throw Error('El club actual no pertenece a una liga.');
 const league=getCompetitionForCareer(state);
 const selected=leagueParticipants(country.code,state.clubId,state),teams=Object.fromEntries(selected.map(t=>[t.id,t]));
 const year=(state.startYear||2026)+(state.age-(state.startAge||16));
 const r=rand(`${state.seed}|liga-original-v1|${year}|${state.clubId}|${state.seasonPlan||'equilibrio'}`);
 const plan=state.seasonPlan||'equilibrio';
 const trust=bound(state.coachTrust??50,0,100);
 const prep=preparationEffects(state),traits=identitySeasonEffects(state),persona=creatorIdentityEffects(state),agenda=seasonAgendaEffects(state),profile=profileMatchEffects(state);
 const own=teams[state.clubId];
 const coach=state.world&&!state.neutralLeague?coachFor(state,state.clubId):null;
 // Un único algoritmo de rol: squadRole usa al competidor si existe y, si no, el nivel del club.
 // roleOf solo queda para las ligas neutrales (simulaciones de otros campeonatos sin jugador).
 const modern=!state.neutralLeague;
 const role=modern?squadRole(state,own.level,coach):roleOf(state,own.level);
 const tfx=modern?threadEffects(state):{minutes:0,injury:1,goals:1};const cfx=modern?coachSeasonEffects(coach,state):{goals:1,starterMinutes:0};
 const playRate=bound(({Titular:.88,'Rotación':.62,Suplente:.35,Reserva:.14})[role]+(trust-50)/320-(state.age<=18?.08:0)+prep.minutes+traits.minutes+(agenda.minutes||0)+profile.minutes+persona.minutes+tfx.minutes+(role==='Titular'?cfx.starterMinutes:0),.04,.98);
 const fixtureList=league?.format==='argentina-zones'&&league.zones
  ?(()=>{const za=selected.filter(c=>league.zones.A.includes(c.id)),zb=selected.filter(c=>league.zones.B.includes(c.id));
    const a=calendar(za).filter(f=>f.round<=15),b=calendar(zb).filter(f=>f.round<=15);
    // Apertura and Clausura: one-way rounds in each zone. Interzonal contests are paired deterministically.
    const first=[...a,...b];const second=first.map(f=>({...f,round:f.round+15,home:f.away,away:f.home}));
    const inter=[];for(let i=0;i<15;i++){inter.push({round:15,home:za[i].id,away:zb[i].id},{round:30,home:zb[i].id,away:za[i].id});}
    return [...first,...second,...inter];
   })()
  :calendar(selected);
 const injuryRoll=r();const prone=(state.injuryProfile==='fragil'?.085:state.injuryProfile==='resistente'?.025:.05)*prep.injury*traits.injury*(agenda.injury||1)*profile.injury*persona.injury*tfx.injury;
 const injuryWeeks=injuryRoll<prone+Math.max(0,state.age-29)*.008?(2+Math.floor(r()*11)):0;
 const absence=injuryAbsenceSlots(fixtureList,state.clubId,injuryWeeks,r);
 const rows=Object.fromEntries(selected.map(t=>[t.id,{id:t.id,name:t.name,level:t.level,played:0,wins:0,draws:0,losses:0,for:0,against:0,gd:0,points:0}]));
 const skillGroup=groups[state.position]||'middle';
 let matches=0,minutes=0,userGoals=0,userAssists=0,cleanSheets=0,goalsConceded=0;
 const personal=[];const results=[];
 for(const f of fixtureList){
  const home=teams[f.home],away=teams[f.away];
  const isOwn=home.id===state.clubId||away.id===state.clubId;
  const available=isOwn&&!absence.has(results.length);
  const plays=!state.neutralLeague&&available&&r()<playRate;
  let gameMinutes=plays?(role==='Titular'?Math.round(70+r()*25):role==='Rotación'?Math.round(30+r()*62):Math.round(8+r()*40)):0;
  const impact=plays?bound((state.ovr-own.level)*.18+gameMinutes/90*1.2,-3.5,4.0):0;
  const sHome=home.level+(home.id===state.clubId?impact:0);
  const sAway=away.level+(away.id===state.clubId?impact:0);
  const tilt=(sHome-sAway)/22;
  const lambdaHome=bound(1.38+.25+tilt*.42,0.18,3.6),lambdaAway=bound(1.38-.25-tilt*.42,0.18,3.6);
  let gh=goals(lambdaHome,r),ga=goals(lambdaAway,r);
  if(plays&&plan==='ataque'){if(r()<.18){if(home.id===state.clubId)gh=Math.min(8,gh+1);else ga=Math.min(8,ga+1);}}
  if(plays&&plan==='defensa'){if(r()<.20){if(home.id===state.clubId)ga=Math.max(0,ga-1);else gh=Math.max(0,gh-1);}}
  // Jugadas Vivas 3.0 (varias por temporada) o la jugada única de partidas anteriores.
  const clutch=fixturePlayDelta(state.plays30?.year===year?state.plays30.results:null,f,plays)||momentScoreDelta(state.clutchMoment,f,plays);
  if(clutch?.attack){if(f.home===state.clubId)gh=Math.min(9,gh+1);else ga=Math.min(9,ga+1);}
  if(clutch?.defend){if(f.home===state.clubId)ga=Math.max(0,ga-1);else gh=Math.max(0,gh-1);}
  const homeRow=rows[f.home],awayRow=rows[f.away];
  for(const row of [homeRow,awayRow])row.played++;
  homeRow.for+=gh;homeRow.against+=ga;awayRow.for+=ga;awayRow.against+=gh;
  if(gh===ga){homeRow.draws++;awayRow.draws++;homeRow.points++;awayRow.points++;}
  else if(gh>ga){homeRow.wins++;homeRow.points+=3;awayRow.losses++;}
  else{awayRow.wins++;awayRow.points+=3;homeRow.losses++;}
  results.push([f.round,f.home,f.away,gh,ga]);
  if(isOwn){
   let g=0,a=0,clean=0;
   if(plays){matches++;minutes+=gameMinutes;const forGoals=home.id===state.clubId?gh:ga;const against=home.id===state.clubId?ga:gh;
    const scoringChance={attack:.36,middle:.16,defense:.036,goalkeeper:0}[skillGroup]*(plan==='ataque'?1.18:plan==='defensa'?.82:1)*(state.style==='goleador'?1.10:1)*prep.goals*traits.goals*(agenda.goals||1)*profile.goals*persona.goals*tfx.goals*cfx.goals*gameMinutes/90;
    const assistingChance={attack:.21,middle:.32,defense:.08,goalkeeper:.01}[skillGroup]*(plan==='ataque'?1.12:1)*(state.style==='creador'?1.15:1)*prep.assists*(agenda.assists||1)*profile.assists*persona.assists*gameMinutes/90;
    // La jugada decisiva agrega exactamente UNA acción atribuida al jugador;
    // no debe entrar también al reparto aleatorio de los goles ordinarios.
    const regularGoals=Math.max(0,forGoals-(clutch?.attack?1:0));
    for(let k=0;k<regularGoals;k++){if(r()<scoringChance)g++;else if(r()<assistingChance)a++;}
    if(clutch?.attack){if(clutch.credit?clutch.credit==='assist':['pase','corner','centro'].includes(clutch.type))a++;else g++;}
    userGoals+=g;userAssists+=a;
    if(skillGroup==='goalkeeper'){goalsConceded+=against;if(against===0){cleanSheets++;clean=1;}}
   }
   personal.push({round:f.round,home:f.home,away:f.away,score:`${gh}-${ga}`,played:plays,minutes:gameMinutes,goals:g,assists:a,cleanSheets:clean});
  }
 }
 const table=Object.values(rows).map(t=>({...t,gd:t.for-t.against})).sort((a,b)=>b.points-a.points||b.gd-a.gd||b.for-a.for||a.name.localeCompare(b.name,'es'))
  .map((row,i)=>({...row,position:i+1,isPlayer:row.id===state.clubId}));
 const playerRow=table.find(t=>t.id===state.clubId);
 return {year,league:league?.name||country.league,leagueId:league?.id||null,verified:!!league?.verified,division:league?.tier,seasonLabel:league?.season||'No verificada',countryCode:country.code,teams:selected.map(t=>normalizedClub(t,t.level)),fixtureResults:results,standings:table,
  playerMatches:personal,role,matches,minutes,goals:userGoals,assists:userAssists,cleanSheets,goalsConceded,injuryWeeks,
  leaguePosition:playerRow.position,champion:table[0]?.id,plan};
}
