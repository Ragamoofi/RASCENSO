/* Motor de liga ORIGINAL de RASCENSO. Cada punto nace de un partido simulado.
 * No utiliza ni reproduce el código de Copero.
 */
import { COUNTRIES } from './countries.mjs';
const bound=(v,a,b)=>Math.max(a,Math.min(b,v));
function rand(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return ()=>{h+=0x6d2b79f5;let t=Math.imul(h^(h>>>15),1|h);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
function goals(mean,random){let n=0,p=Math.exp(-mean),prod=1;do{n++;prod*=random();}while(prod>p&&n<=10);return Math.min(8,n-1);}
function roleOf(state,level){const diff=(state.ovr||60)-level+(state.coachTrust-50)*.075;
 return diff>=-3?'Titular':diff>=-12?'Rotación':diff>=-22?'Suplente':'Reserva';}
export function leagueParticipants(countryCode,clubId){
 const country=COUNTRIES.find(c=>c.code===countryCode);if(!country)return [];
 const all=[...country.clubs].sort((a,b)=>b.level-a.level||a.id.localeCompare(b.id));
 const limit=all.length>=20?20:all.length>=16?16:all.length>=12?12:all.length>=8?8:all.length;
 const clubs=all.slice(0,limit);if(!clubs.some(c=>c.id===clubId)){const selected=all.find(c=>c.id===clubId);if(selected)clubs.splice(Math.max(0,clubs.length-1),1,selected);}
 return clubs.sort((a,b)=>a.id.localeCompare(b.id));
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
 const selected=leagueParticipants(country.code,state.clubId),teams=Object.fromEntries(selected.map(t=>[t.id,t]));
 const year=(state.startYear||2026)+(state.age-(state.startAge||16));
 const r=rand(`${state.seed}|liga-original-v1|${year}|${state.clubId}|${state.seasonPlan||'equilibrio'}`);
 const plan=state.seasonPlan||'equilibrio';
 const trust=bound(state.coachTrust??50,0,100);
 const own=teams[state.clubId];const role=roleOf(state,own.level);
 const playRate=bound(({Titular:.88,'Rotación':.62,Suplente:.35,Reserva:.14})[role]+(trust-50)/320-(state.age<=18?.08:0),.04,.98);
 const fixtureList=calendar(selected);
 const injuryRoll=r();const prone=state.injuryProfile==='fragil'?.085:state.injuryProfile==='resistente'?.025:.05;
 const injuryWeeks=injuryRoll<prone+Math.max(0,state.age-29)*.008?(2+Math.floor(r()*11)):0;
 const absence=injuryWeeks?new Set(Array.from({length:Math.min(injuryWeeks,fixtureList.length)},(_,i)=>Math.floor((r()*.7+.1)*fixtureList.length)+i).map(x=>x%Math.max(1,fixtureList.length))):new Set();
 const rows=Object.fromEntries(selected.map(t=>[t.id,{id:t.id,name:t.name,level:t.level,played:0,wins:0,draws:0,losses:0,for:0,against:0,gd:0,points:0}]));
 const skillGroup=groups[state.position]||'middle';
 let matches=0,minutes=0,userGoals=0,userAssists=0,cleanSheets=0,goalsConceded=0;
 const personal=[];const results=[];
 for(const f of fixtureList){
  const home=teams[f.home],away=teams[f.away];
  const isOwn=home.id===state.clubId||away.id===state.clubId;
  const available=isOwn&&!absence.has(f.round*1000+results.length)&&!absence.has(results.length);
  const plays=available&&r()<playRate;
  let gameMinutes=plays?(role==='Titular'?Math.round(70+r()*25):role==='Rotación'?Math.round(30+r()*62):Math.round(8+r()*40)):0;
  const impact=plays?bound((state.ovr-own.level)*.18+gameMinutes/90*1.2,-3.5,4.0):0;
  const sHome=home.level+(home.id===state.clubId?impact:0);
  const sAway=away.level+(away.id===state.clubId?impact:0);
  const tilt=(sHome-sAway)/22;
  const lambdaHome=bound(1.38+.25+tilt*.42,0.18,3.6),lambdaAway=bound(1.38-.25-tilt*.42,0.18,3.6);
  let gh=goals(lambdaHome,r),ga=goals(lambdaAway,r);
  if(plays&&plan==='ataque'){if(r()<.18){if(home.id===state.clubId)gh=Math.min(8,gh+1);else ga=Math.min(8,ga+1);}}
  if(plays&&plan==='defensa'){if(r()<.20){if(home.id===state.clubId)ga=Math.max(0,ga-1);else gh=Math.max(0,gh-1);}}
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
    const scoringChance={attack:.36,middle:.16,defense:.036,goalkeeper:0}[skillGroup]*(plan==='ataque'?1.18:plan==='defensa'?.82:1)*(state.style==='goleador'?1.10:1)*gameMinutes/90;
    const assistingChance={attack:.21,middle:.32,defense:.08,goalkeeper:.01}[skillGroup]*(plan==='ataque'?1.12:1)*(state.style==='creador'?1.15:1)*gameMinutes/90;
    for(let k=0;k<forGoals;k++){if(r()<scoringChance)g++;else if(r()<assistingChance)a++;}
    userGoals+=g;userAssists+=a;
    if(skillGroup==='goalkeeper'){goalsConceded+=against;if(against===0){cleanSheets++;clean=1;}}
   }
   personal.push({round:f.round,home:f.home,away:f.away,score:`${gh}-${ga}`,played:plays,minutes:gameMinutes,goals:g,assists:a,cleanSheets:clean});
  }
 }
 const table=Object.values(rows).map(t=>({...t,gd:t.for-t.against})).sort((a,b)=>b.points-a.points||b.gd-a.gd||b.for-a.for||a.name.localeCompare(b.name,'es'))
  .map((row,i)=>({...row,position:i+1,isPlayer:row.id===state.clubId}));
 const playerRow=table.find(t=>t.id===state.clubId);
 return {year,league:country.league,countryCode:country.code,teams:selected.map(t=>normalizedClub(t,t.level)),fixtureResults:results,standings:table,
  playerMatches:personal,role,matches,minutes,goals:userGoals,assists:userAssists,cleanSheets,goalsConceded,injuryWeeks,
  leaguePosition:playerRow.position,champion:table[0]?.id,plan};
}
