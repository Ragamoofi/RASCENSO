/* RASCENSO 1.3 · simulación competitiva global simplificada.
   Los nombres representan competiciones reales. Los cupos, el sorteo y el
   calendario se simplifican: NO reproducen los reglamentos oficiales. */
import { COUNTRIES } from './countries.mjs';
const byCode=new Map(COUNTRIES.map(c=>[c.code,c]));
const min=(a,b)=>Math.min(a,b), max=(a,b)=>Math.max(a,b);
function hash(input){let x=2166136261;for(const c of String(input)){x^=c.charCodeAt(0);x=Math.imul(x,16777619);}return x>>>0;}
function rand(seed){let a=hash(seed);return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const shuffle=(arr,r)=>{let copy=[...arr];for(let i=copy.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;};
const confOf=code=>byCode.get(code)?.confederation||'UEFA';
const allClubs=COUNTRIES.flatMap(c=>c.clubs.filter(t=>!t.inactive).map(t=>({...t,countryCode:c.code,confederation:c.confederation})));
const cupNames={CL:'Copa Chile',AR:'Copa Argentina',BR:'Copa do Brasil',UY:'Copa Uruguay',CO:'Copa Colombia',PY:'Copa Paraguay',PE:'Copa Perú',EC:'Copa Ecuador',BO:'Copa Bolivia',VE:'Copa Venezuela',EN:'FA Cup',ES:'Copa del Rey',DE:'DFB-Pokal',IT:'Coppa Italia',FR:'Coupe de France',PT:'Taça de Portugal',NL:'KNVB Beker',SC:'Scottish Cup',US:'US Open Cup',MX:'Copa México',NZ:'Chatham Cup',JP:'Copa del Emperador',KR:'Korean FA Cup',AU:'Australia Cup',SA:'Copa del Rey de Campeones'};
const countryCups=new Map(COUNTRIES.map(c=>[c.code,cupNames[c.code]||`Copa nacional · ${c.name}`]));
export const CONTINENTAL_CLUB_CUPS={
 CONMEBOL:['Copa Libertadores','Copa Sudamericana'],
 UEFA:['UEFA Champions League','UEFA Europa League','UEFA Conference League'],
 CONCACAF:['Concacaf Champions Cup'],
 AFC:['AFC Champions League Elite','AFC Champions League Two'],
 CAF:['CAF Champions League','CAF Confederation Cup'],
 OFC:['OFC Champions League']
};
export const NATIONAL_CUPS={CONMEBOL:'Copa América',UEFA:'Eurocopa',CAF:'Copa Africana de Naciones',AFC:'Copa Asiática',CONCACAF:'Copa Oro',OFC:'Copa de Naciones de la OFC'};
const nationPower={BR:86,AR:86,FR:86,ES:85,EN:85,DE:83,PT:81,NL:80,IT:83,HR:78,UY:78,CL:72,CO:74,MA:78,EG:73,NG:74,JP:76,KR:76,US:74,MX:74,NZ:65};
function nation(code){const c=byCode.get(code);return {id:code,name:c?.name||code,level:nationPower[code]||((c?.confederation==='UEFA'?70:65)+hash(code)%7),countryCode:code};}
function stages(count){return count>=16?'Octavos':count>=8?'Cuartos':count>=4?'Semifinal':'Final';}
function scoreGame(a,b,r,boostA=0,boostB=0){
 const diff=((a.level||60)+boostA-(b.level||60)-boostB)/22;
 const roll=(mean)=>{let total=0;for(let i=0;i<6;i++)if(r()<mean/6)total++;return min(6,total);};
 let home=roll(max(.6,min(3.8,1.45+diff*.42))),away=roll(max(.6,min(3.8,1.23-diff*.42)));
 const pen=home===away?(r()<.5?a.id:b.id):null;
 return {home,away,winner:home>away?a.id:away>home?b.id:pen,pen};
}
/** Bracket anual con resultados concretos en todas las llaves, incluso cuando el jugador ya fue eliminado. */
export function playCup({id,name,year,teams,playerTeamId,seed,kind='club',state=null}){
 const r=rand(`${seed}|${id}|${year}`);
 const unique=[...new Map(teams.map(t=>[t.id,t])).values()];
 const size=Math.min(16,2**Math.floor(Math.log2(unique.length)));
 if(size<2)return null;
 const own=unique.find(t=>t.id===playerTeamId);
 const others=unique.filter(t=>t.id!==playerTeamId).sort((a,b)=>b.level-a.level||a.id.localeCompare(b.id));
 const participants=own?[own,...others.slice(0,size-1)]:others.slice(0,size);
 let live=shuffle(participants,r),round=0,played=0,minutes=0,goals=0,assists=0;
 const fixtures=[];
 while(live.length>1){
  const stage=stages(live.length),next=[];
  for(let k=0;k<live.length;k+=2){
   const a=live[k],b=live[k+1];const involved=a.id===playerTeamId||b.id===playerTeamId;
   const playing=involved&&r()<min(.96,max(.18,(state?.coachTrust??60)/100*.87));
   const boost=playing?max(-2,min(5,((state?.ovr??65)-Math.max(a.level,b.level))*.2)):0;
   const m=scoreGame(a,b,r,a.id===playerTeamId?boost:0,b.id===playerTeamId?boost:0);
   const win=participants.find(t=>t.id===m.winner);
   next.push(win);
   let pg=0,pa=0;
   if(playing){played++;minutes+=80;const teamGoals=a.id===playerTeamId?m.home:m.away;for(let g=0;g<teamGoals;g++){if(r()<.28)pg++;else if(r()<.19)pa++;}goals+=pg;assists+=pa;}
   fixtures.push({stage,round:round+1,home:a.id,away:b.id,homeName:a.name,awayName:b.name,score:`${m.home}-${m.away}`,winner:m.winner,penalties:m.pen===null?false:true,playerPlayed:playing,playerGoals:pg,playerAssists:pa});
  }
  round++;live=next;
 }
 const champion=live[0];
 const playerFixtures=fixtures.filter(f=>f.home===playerTeamId||f.away===playerTeamId);
 const last=playerFixtures.at(-1);
 const outcome=champion.id===playerTeamId?'Campeón':last?.stage||'No clasificado';
 return {id,name,year,kind,champion:champion.id,championName:champion.name,playerTeamId,outcome,participated:!!playerFixtures.length,
  played,minutes,goals,assists,fixtures,playerFixtures,championWon:champion.id===playerTeamId,format:'Eliminación directa simplificada'};
}
function countryClubs(code,club){const selected=allClubs.filter(t=>t.countryCode===code).sort((a,b)=>b.level-a.level);const picked=selected.slice(0,15);if(!picked.some(t=>t.id===club.id))picked.push(club);return picked;}
function continentalEntries(club,place,seed,year){
 const conf=club.confederation||confOf(club.countryCode),names=CONTINENTAL_CLUB_CUPS[conf]||[];
 const ownEntry=place<=2?0:place<=5?1:place<=8?2:-1;
 const idx=min(names.length-1,ownEntry);if(ownEntry<0||idx<0)return null;
 const filtered=allClubs.filter(t=>t.confederation===conf && t.countryCode!==club.countryCode).sort((a,b)=>b.level-a.level||a.id.localeCompare(b.id));
 const rivals=shuffle(filtered.slice(0,45),rand(`continental:${conf}:${year}:${seed}`)).slice(0,15);
 const local=allClubs.filter(t=>t.countryCode===club.countryCode&&t.id!==club.id).sort((a,b)=>b.level-a.level).slice(0,2);
 return {id:`CONT-${conf}-${idx+1}`,name:names[idx],teams:[club,...rivals.slice(0,Math.max(0,15-local.length)),...local]};
}
export function selectionCalendar(conf,year){
 const worldCup=year>=2026 && (year-2026)%4===0;
 const qualifiers=year>=2029&&(year-2029)%4===0;
 let regional=false;
 if(conf==='CONMEBOL'||conf==='UEFA'||conf==='OFC')regional=year>=2028&&(year-2028)%4===0;
 else if(conf==='CAF'||conf==='CONCACAF')regional=year>=2027&&(year-2027)%2===0;
 else if(conf==='AFC')regional=year>=2027&&(year-2027)%4===0;
 return {worldCup,qualifiers,regional};
}
function qualifiedForWorld(code,year,seed){
 const c=byCode.get(code);if(!c)return false;
 const teams=COUNTRIES.filter(t=>t.confederation===c.confederation).map(t=>nation(t.code)).sort((a,b)=>b.level-a.level);
 const quota=Math.max(1,Math.ceil(teams.length*.5));
 const r=rand(`clasificatorias:${seed}:${year}:${c.confederation}`);
 const ordered=teams.map(t=>({...t,rank:t.level+(r()-.5)*17})).sort((a,b)=>b.rank-a.rank);
 return ordered.slice(0,quota).some(t=>t.id===code);
}
function nationalField(conf,playerCode,seed,year,world=false){
 const list=COUNTRIES.filter(c=>world||c.confederation===conf).map(c=>nation(c.code));
 const own=nation(playerCode),r=rand(`national-pool:${conf}:${seed}:${year}:${world}`);
 const others=shuffle(list.filter(t=>t.id!==playerCode).sort((a,b)=>b.level-a.level).slice(0,32),r);
 return [own,...others.slice(0,15)];
}
export function simulateGlobalSeason(state,league){
 const club=allClubs.find(t=>t.id===state.clubId);if(!club)return {competitions:[],titles:[],trophyRecords:[],international:0,nationalCaps:0};
 const year=league.year,place=league.leaguePosition,r=rand(`${state.seed}:global:${year}:${club.id}`),competitions=[];
 const domestic=playCup({id:`CUP-${club.countryCode}`,name:countryCups.get(club.countryCode)||'Copa nacional',year,kind:'national-cup',teams:countryClubs(club.countryCode,club),playerTeamId:club.id,seed:state.seed,state});
 if(domestic)competitions.push(domestic);
 const candidate=continentalEntries(club,place,state.seed,year);
 if(candidate){const cup=playCup({...candidate,year,kind:'continental',playerTeamId:club.id,seed:state.seed,state});if(cup)competitions.push(cup);}
 const country=byCode.get(state.country),conf=country?.confederation;
 const caps=[];let calledUp=false;
 if(conf){
  const score=(state.ovr||50)+(league.matches>=18?3:0)+Math.min(5,(league.goals+league.assists)/8);
  const threshold={UEFA:70,CONMEBOL:68,CAF:65,AFC:65,CONCACAF:65,OFC:58}[conf]||68;
  const seededCallup=score+r()*8>=threshold;
  calledUp=seededCallup;
  if(calledUp){
   const plan=selectionCalendar(conf,year);
   if(plan.qualifiers)caps.push({id:`WCQ-${conf}`,name:`Eliminatorias mundialistas · ${conf}`,teams:nationalField(conf,state.country,state.seed,year),year,kind:'qualifiers'});
   if(plan.regional)caps.push({id:`NAT-${conf}`,name:NATIONAL_CUPS[conf],teams:nationalField(conf,state.country,state.seed,year),year,kind:'international'});
   if(plan.worldCup&&qualifiedForWorld(state.country,year,state.seed))caps.push({id:'WORLD-CUP',name:'Copa Mundial de la FIFA',teams:nationalField(conf,state.country,state.seed,year,true),year,kind:'world-cup'});
   if(!caps.length)caps.push({id:`FRIENDLY-${conf}`,name:`Serie internacional · ${conf}`,teams:nationalField(conf,state.country,state.seed,year),year,kind:'friendly'});
   for(const comp of caps){const cup=playCup({...comp,playerTeamId:state.country,seed:state.seed,state:{...state,coachTrust:85}});if(cup)competitions.push(cup);}
  }
 }
 const trophies=competitions.filter(c=>c.championWon&&c.kind!=='qualifiers'&&c.kind!=='friendly').map(c=>({title:c.name,year,clubId:c.kind==='national-cup'||c.kind==='continental'?club.id:null,countryCode:state.country,leagueId:c.id,kind:c.kind,competitionId:c.id}));
 const nationalCaps=competitions.filter(c=>['qualifiers','international','world-cup','friendly'].includes(c.kind)).reduce((n,c)=>n+c.played,0);
 const nationalGoals=competitions.filter(c=>['qualifiers','international','world-cup','friendly'].includes(c.kind)).reduce((n,c)=>n+c.goals,0);
 return {competitions,calledUp,nationalCaps,nationalGoals,titles:trophies.map(x=>x.title),trophyRecords:trophies,international:nationalCaps,worldCupResult:competitions.find(c=>c.id==='WORLD-CUP')?.outcome||null};
}
export function competitionSummary(history){return (history?.competitions||[]).map(c=>({id:c.id,name:c.name,kind:c.kind,played:c.played,goals:c.goals,assists:c.assists,outcome:c.outcome,champion:c.championName,fixtures:c.playerFixtures||[]}));}
export const GLOBAL_COUNTRIES=COUNTRIES.length;
export const GLOBAL_CONFEDERATIONS=[...new Set(COUNTRIES.map(c=>c.confederation))];
