/* RASCENSO 1.3 · simulación competitiva global simplificada.
   Los nombres representan competiciones reales. Los cupos, el sorteo y el
   calendario se simplifican: NO reproducen los reglamentos oficiales. */
import { COUNTRIES } from './countries.mjs';
import { playGroupTournament, playQualification, seededRng, cupContributionRates } from './competitions14.mjs';
import { VERIFIED_LEAGUES, getInauguralLeague } from './leagues2026.mjs';
import { choiceFx } from './identity30.mjs';
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
   if(playing){played++;minutes+=80;const teamGoals=a.id===playerTeamId?m.home:m.away;const rates=cupContributionRates(state?.position);for(let g=0;g<teamGoals;g++){if(r()<rates.goals)pg++;else if(r()<rates.assists)pa++;}goals+=pg;assists+=pa;}
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
/* Cupos internos reducidos: referencia de juego, no clasificación oficial. */
export const WORLD_QUALIFYING_QUOTAS={UEFA:13,CONMEBOL:7,CAF:5,AFC:4,CONCACAF:2,OFC:1};
const extraNations={CONCACAF:[['CA','Canadá',76],['PA','Panamá',70],['JM','Jamaica',68],['HN','Honduras',66]],
 OFC:[['FJ','Fiyi',62],['SB','Islas Salomón',60],['PG','Papúa Nueva Guinea',59],['VU','Vanuatu',55]],
 AFC:[['AE','Emiratos Árabes Unidos',71],['UZ','Uzbekistán',73]],
 CONMEBOL:[['CA','Canadá',76],['US','Estados Unidos',76],['MX','México',77],['CR','Costa Rica',71],['JM','Jamaica',68],['PA','Panamá',70]]};
function confNations(conf,includeGuests=false){
 const base=COUNTRIES.filter(c=>c.confederation===conf).map(c=>nation(c.code));
 if(!includeGuests)return base;
 return [...base,...(extraNations[conf]||[]).map(([id,name,level])=>({id,name,level,countryCode:id}))];
}
const nationalById=new Map([...COUNTRIES.map(c=>[c.code,nation(c.code)]),...Object.values(extraNations).flat().map(([id,name,level])=>[id,{id,name,level,countryCode:id}])]);
const QUALIFICATION_CACHE=new Map();
/** La tabla de 2029 decide el Mundial 2030; nunca se recalcula en 2030 con otro criterio. */
export function worldQualifiers(seed,year){
 const key=`${seed}:${year}`,cached=QUALIFICATION_CACHE.get(key);if(cached)return cached;
 const results={},qualified=[];
 for(const conf of Object.keys(WORLD_QUALIFYING_QUOTAS)){
  const teams=confNations(conf,['OFC','CONCACAF','AFC'].includes(conf)),quota=WORLD_QUALIFYING_QUOTAS[conf];
  const cup=playQualification({id:`WCQ-${conf}`,name:`Eliminatorias mundialistas · ${conf}`,year,
    teams,playerTeamId:'',seed,quota});
  results[conf]=cup;qualified.push(...cup.qualified);
 }
 const value={results,qualified:[...new Set(qualified)]};
 if(QUALIFICATION_CACHE.size>60)QUALIFICATION_CACHE.clear();
 QUALIFICATION_CACHE.set(key,value);return value;
}
function ownPreviousPosition(state,club,league){
 const previous=(state.history||[]).at(-1);
 if(previous?.clubId===club.id&&Number.isInteger(previous.leaguePosition))return previous.leaguePosition;
 // Primera campaña: todavía no existe una temporada anterior dentro del guardado.
 // Se conserva el acceso provisional del 1.3, indicando su procedencia en el registro.
 if(!previous)return league.leaguePosition;
 // Fichaje reciente: el jugador no hereda la clasificación de su exclub.
 const domestic=allClubs.filter(c=>c.countryCode===club.countryCode).sort((a,b)=>b.level-a.level);
 return domestic.findIndex(x=>x.id===club.id)+1;
}
/** Sin cupos de primera por clasificar primero en segunda. El año previo manda. */
export function continentalEligibility(state,club,league){
 const previous=(state.history||[]).at(-1);
 const currentTier=league.division??VERIFIED_LEAGUES.find(l=>(state.leagueRosters?.[l.id]||l.teamIds).includes(club.id))?.tier??null;
 const previousTier=previous?.leagueDivision??VERIFIED_LEAGUES.find(l=>l.id===previous?.leagueId)?.tier??null;
 const nationalCupChampion=!!(previous?.clubId===club.id&&(previous.competitions||[]).some(c=>c.kind==='national-cup'&&c.championWon));
 if(currentTier!=null&&currentTier!==1)return {eligible:false,place:null,source:'No se otorga cupo de liga desde segunda división'};
 if(previous?.clubId===club.id&&previousTier!=null&&previousTier!==1&&!nationalCupChampion)return {eligible:false,place:null,source:'Ascenso reciente: la posición de segunda no clasifica a copas continentales'};
 if(nationalCupChampion)return {eligible:true,place:4,source:'Copa nacional ganada en la temporada anterior'};
 const place=ownPreviousPosition(state,club,league);
 return {eligible:Number.isFinite(place)&&place<=8,place,source:!previous?'Acceso provisional de temporada inicial':previous.clubId===club.id?`Liga previa: ${place}°`:'Estimación de nivel del nuevo club (no hereda cupos del anterior)'};
}
function regionalField(conf,year,seed){
 let teams=confNations(conf,true);
 // Cuadros 4/8/16: las rondas de clasificación se reducen a un ranking anual del catálogo.
 const size=Math.min(16,2**Math.floor(Math.log2(teams.length)));
 const r=seededRng(`${seed}:regional:${conf}:${year}`);
 teams=teams.map(t=>({...t,score:t.level+(r()-.5)*12})).sort((a,b)=>b.score-a.score);
 return teams.slice(0,size).map(({score,...team})=>team);
}
function clubWorldField(club,state,year){
 const qualified=(state.history||[]).some(h=>h.year>=year-4&&(h.competitions||[]).some(c=>c.kind==='continental'&&c.championWon));
 const best=[...allClubs].sort((a,b)=>b.level-a.level).filter(t=>t.id!==club.id);
 // Sólo los campeones continentales anteriores del futbolista reciben un cupo propio.
 return {eligible:qualified,teams:[...(qualified?[club]:[]),...best.slice(0,qualified?31:32)]};
}
/** Reglas de convocatoria de selección mayor: desempeño, trayectoria y jerarquía.
 * Un juvenil debutante del ascenso no puede jugar directamente el Mundial. */
export function nationalSelectionEligibility(state,league,competition='normal'){
 const conf=byCode.get(state.country)?.confederation;
 if(!conf)return {eligible:false,reason:'Sin federación'};
 const appearances=league.matches||0,age=state.age||17,history=state.history||[];
 const club=getInauguralLeague(state.clubId);
 const currentTier=Number(league.division);
 const tier=Number.isFinite(currentTier)&&currentTier>0?currentTier:(club?.tier??null);
 const experience=history.filter(h=>(h.matches||0)>=12).length;
 const caps=history.reduce((sum,h)=>sum+(h.nationalCaps||0),0);
 const reputation=state.reputation||0,ovr=state.ovr||50;
 const productivity=Math.min(4,((league.goals||0)+(league.assists||0))/9);
 const roleBonus=league.role==='Titular'?1:league.role==='Reserva'?-2:0;
 const previousRating=Number(history.at(-1)?.rating);
 const formBonus=Number.isFinite(previousRating)?Math.max(-2,Math.min(2,(previousRating-6.7)*3)):0;
 const score=ovr+productivity+(appearances>=20?2:-4)+choiceFx(state).callup*.4+Math.min(4,reputation/15)+Math.min(2,caps*.1)+roleBonus+formBonus
  -(tier>=2?9:0)-(age<=18?4:0);
 const threshold={UEFA:77,CONMEBOL:75,CAF:73,AFC:72,CONCACAF:72,OFC:69}[conf]||75;
 // Excepciones para promesas extraordinarias son deliberadamente escasas.
 const exceptional=age>=18&&ovr>=83&&reputation>=45&&appearances>=20&&tier!=null&&tier<2;
 const minMinutes=Math.min(12,Math.max(5,Math.round((league.playerMatches?.length||30)*.5)));
 if((appearances<minMinutes||(Number.isFinite(league.minutes)&&league.minutes<450))&&!exceptional)return {eligible:false,score,reason:'Pocos minutos profesionales'};
 if(age<18)return {eligible:false,score,reason:'Edad de formación'};
 if(experience===0&&tier>=2&&!exceptional)return {eligible:false,score,reason:'Debutante del ascenso'};
 const major=competition==='world-cup'||competition==='regional';
 if(major&&!exceptional){
  if(tier>=2||ovr<75||reputation<25||(experience<1&&caps===0))return {eligible:false,score,reason:'Sin trayectoria de selección mayor'};
  if(competition==='world-cup'&&caps===0&&experience<2)return {eligible:false,score,reason:'Mundial requiere experiencia previa'};
 }
 const floor=threshold+(major?competition==='world-cup'?6:3:0);
 return {eligible:score>=floor,score,threshold:floor,reason:score>=floor?'En evaluación deportiva':'Nivel insuficiente'};
}
export function simulateGlobalSeason(state,league){
 const club=allClubs.find(t=>t.id===state.clubId);if(!club)return {competitions:[],titles:[],trophyRecords:[],international:0,nationalCaps:0};
 const year=league.year,seed=state.seed,r=rand(`${seed}:global14:${year}:${club.id}`),competitions=[];
 const domestic=playCup({id:`CUP-${club.countryCode}`,name:countryCups.get(club.countryCode)||'Copa nacional',year,kind:'national-cup',teams:countryClubs(club.countryCode,club),playerTeamId:club.id,seed,state});
 if(domestic)competitions.push({...domestic,qualification:'Participación en copa nacional'});
 const eligibility=continentalEligibility(state,club,league);
 const entry=eligibility.eligible?continentalEntries(club,eligibility.place,seed,year):null;
 if(entry){const cup=playGroupTournament({...entry,year,kind:'continental',playerTeamId:club.id,seed,state});
  if(cup)competitions.push({...cup,qualification:eligibility.source});
 }
 // Campeones continentales del año anterior disputan una supercopa regional.
 const previous=(state.history||[]).at(-1);
 if(previous?.clubId===club.id&&(previous.competitions||[]).some(c=>c.championWon&&c.kind==='continental')){
  const conf=club.confederation||confOf(club.countryCode),name=conf==='CONMEBOL'?'Recopa Sudamericana':conf==='UEFA'?'Supercopa de la UEFA':`Supercopa continental · ${conf}`;
  const rival=allClubs.filter(t=>t.confederation===conf&&t.id!==club.id).sort((a,b)=>b.level-a.level)[0];
  if(rival)competitions.push(playCup({id:`SUPER-${conf}`,name,year,kind:'supercup',teams:[club,rival],playerTeamId:club.id,seed,state}));
 }
 if(year>=2029&&(year-2029)%4===0){
  const field=clubWorldField(club,state,year);
  if(field.eligible){const wc=playGroupTournament({id:'CLUB-WORLD',name:'Mundial de Clubes',year,kind:'club-world-cup',teams:field.teams,playerTeamId:club.id,seed,state,legs:1});if(wc)competitions.push(wc);}
 }
 const country=byCode.get(state.country),conf=country?.confederation;let calledUp=false;
 if(conf){
  const calendar=selectionCalendar(conf,year),countryId=state.country,nationState={...state,coachTrust:86};
  const needsMajor=calendar.worldCup?'world-cup':calendar.regional?'regional':'normal';
  const eligibility=nationalSelectionEligibility(state,league,needsMajor);
  calledUp=eligibility.eligible&&eligibility.score+r()*3>=eligibility.threshold;
  if(calledUp){
   if(calendar.qualifiers){
    const q=playQualification({id:`WCQ-${conf}`,name:`Eliminatorias mundialistas · ${conf}`,year,
      teams:confNations(conf,['OFC','CONCACAF','AFC'].includes(conf)),playerTeamId:countryId,seed,quota:WORLD_QUALIFYING_QUOTAS[conf],state:nationState});
    competitions.push(q);
   }
   if(calendar.regional){
    const entrants=regionalField(conf,year,seed);
    if(entrants.some(t=>t.id===countryId)){
      const cup=playGroupTournament({id:`NAT-${conf}`,name:NATIONAL_CUPS[conf],year,kind:'international',teams:entrants,playerTeamId:countryId,seed,state:nationState,legs:1});
      if(cup)competitions.push(cup);
    }
   }
   if(calendar.worldCup){
    const qualified=worldQualifiers(seed,year-1).qualified;
    if(qualified.includes(countryId)){
      const entrants=qualified.map(id=>nationalById.get(id)).filter(Boolean);
      const cup=playGroupTournament({id:'WORLD-CUP',name:'Copa Mundial de la FIFA',year,kind:'world-cup',teams:entrants,playerTeamId:countryId,seed,state:nationState,legs:1});
      if(cup)competitions.push(cup);
    }
   }
   if(!competitions.some(c=>['qualifiers','international','world-cup'].includes(c.kind))){
    const others=confNations(conf,true).filter(t=>t.id!==countryId).sort((a,b)=>b.level-a.level).slice(0,3);
    if(others.length){const friendly=playCup({id:`FRIENDLY-${conf}`,name:`Amistosos internacionales · ${conf}`,year,kind:'friendly',teams:[nation(countryId),others[0]],playerTeamId:countryId,seed,state:nationState});
      if(friendly)competitions.push(friendly);}
   }
  }
 }
 const trophies=competitions.filter(c=>c.championWon&&!['qualifiers','friendly'].includes(c.kind)).map(c=>({title:c.name,year,clubId:['national-cup','continental','supercup','club-world-cup'].includes(c.kind)?club.id:null,countryCode:state.country,leagueId:c.id,kind:c.kind,competitionId:c.id}));
 const international=competitions.filter(c=>['qualifiers','international','world-cup','friendly'].includes(c.kind));
 const nationalCaps=international.reduce((n,c)=>n+c.played,0),nationalGoals=international.reduce((n,c)=>n+c.goals,0);
 const totalCupMatches=competitions.filter(c=>['national-cup','continental','supercup','club-world-cup'].includes(c.kind)).reduce((n,c)=>n+c.played,0);
 const calendar=competitions.flatMap(c=>c.playerFixtures.map(f=>({competition:c.name,kind:c.kind,stage:f.stage,round:f.round,date:f.date||`Ronda ${f.round}`,home:f.homeName,away:f.awayName,score:f.score,minutes:f.playerMinutes||0,goals:f.playerGoals||0,assists:f.playerAssists||0})));
 return {competitions,calledUp,nationalCaps,nationalGoals,totalCupMatches,calendar,titles:trophies.map(x=>x.title),trophyRecords:trophies,
  international:nationalCaps,worldCupResult:competitions.find(c=>c.id==='WORLD-CUP')?.outcome||null};
}
export function competitionSummary(history){return (history?.competitions||[]).map(c=>({id:c.id,name:c.name,kind:c.kind,played:c.played,goals:c.goals,assists:c.assists,outcome:c.outcome,champion:c.championName,fixtures:c.playerFixtures||[],groupTables:c.groupTables||[],format:c.format||'',qualification:c.qualification||''}));}
export const GLOBAL_COUNTRIES=COUNTRIES.length;
export const GLOBAL_CONFEDERATIONS=[...new Set(COUNTRIES.map(c=>c.confederation))];
