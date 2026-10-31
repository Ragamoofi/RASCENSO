/* RASCENSO 0.7: mercado original de carrera. Valores económicos estimativos en EUR/año.
   Prestigio deportivo / presupuesto no equivalen al nivel 0-75 del catálogo semilla. */
import { COUNTRIES } from './countries.mjs';
import { getInauguralLeague, VERIFIED_LEAGUES } from './leagues2026.mjs';
import { choiceFx, marketRarity } from './identity30.mjs';
import { socialEffects } from './career20.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function random(seed){let x=hash(seed);return ()=>{x+=0x6d2b79f5;let t=Math.imul(x^(x>>>15),1|x);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const STARS={
 'Real Madrid':97,'Barcelona':95,'Manchester City':96,'Liverpool':95,'Arsenal':94,'Chelsea':91,'Manchester United':90,'Bayern Múnich':96,
 'Borussia Dortmund':91,'Bayer Leverkusen':90,'Inter de Milán':94,'Juventus':92,'Milan':91,'AC Milan':91,'Napoli':90,
 'Paris Saint-Germain':96,'Atlético de Madrid':91,'Tottenham':88,'Tottenham Hotspur':88,'Newcastle United':86,'Aston Villa':86,
 'Atalanta':87,'Roma':87,'RB Leipzig':87,'Benfica':87,'Porto':87,'FC Porto':87,'Sporting CP':87,
 'Ajax':85,'PSV':86,'Feyenoord':84,'Al Hilal':90,'Al Nassr':90,'Al Ittihad':87,'Al Ahli':87,
 'Flamengo':86,'Palmeiras':86,'Botafogo':81,'River Plate':84,'Boca Juniors':84,'São Paulo':81,
 'Colo-Colo':78,'Universidad de Chile':77,'Universidad Católica':76
};
const COUNTRY_BASE={EN:83,ES:82,DE:82,IT:81,FR:79,PT:77,NL:76,SA:78,BR:75,AR:72,TR:74,MX:72,US:72,BE:72,SC:70,CL:66,UY:68,CO:67,JP:67,KR:66,QA:72,CH:70,AT:70,GR:70,DK:69,SE:67,NO:67,PL:67,CR:63,BO:60};
const FINANCES={ // techo salarial anual aproximado de una estrella, NO nómina oficial de cada club
 EN:18000000,ES:16000000,DE:14000000,IT:11500000,FR:13500000,SA:18500000,
 PT:5000000,NL:4700000,TR:6500000,BR:3300000,AR:1500000,MX:2500000,US:3900000,
 BE:3100000,SC:2800000,CH:2600000,AT:2400000,GR:2800000,DK:1600000,
 CL:570000,UY:480000,CO:670000,PE:620000,EC:540000,PY:380000,BO:270000,VE:230000,
 QA:9000000,JP:2300000,KR:1700000,CN:1900000,AU:1000000
};
export const CLUBS=COUNTRIES.flatMap(c=>c.clubs.map(x=>({...x,countryCode:c.code,country:c.name}))).filter(c=>!c.inactive);
const byId=Object.fromEntries(CLUBS.map(c=>[c.id,c]));
const validLeagueCountry=new Set(VERIFIED_LEAGUES.map(l=>l.countryCode));
/** Nivel deportivo para la simulación. El catálogo semilla subestima a varios gigantes
 * (Arsenal 67, Atlético 67…); los clubes reconocidos reciben un mínimo acorde a su prestigio. */
export function simLevel(club){if(!club)return 60;const star=STARS[club.name];return star?Math.max(club.level,Math.round(72+(star-84)*.9)):club.level;}
export function marketClub(id){return byId[id]||null;}
/** Prestigio con la evolución del mundo de la partida (inversiones, crisis, resultados). */
export function livePrestige(state,club){return clamp(clubPrestige(club)+Math.round((state?.world?.clubs?.[club?.id]?.d||0)*.7),40,99);}
function computePrestige(club){
 if(!club)return 0;
 const code=club.countryCode||club.id?.slice(0,2).toUpperCase();
 const league=getInauguralLeague(club.id);
 const base=COUNTRY_BASE[code]||65;
 let rating=base+(club.level-69)*.54;
 if(league?.tier===2)rating-=12;
 if(league?.tier>=3)rating-=19;
 if(validLeagueCountry.has(code)&&!league)rating-=19;
 return clamp(Math.round(Math.max(rating,STARS[club.name]||0)),41,98);
}// Prestigio base: depende solo del catálogo, se calcula una vez por club y nivel.
const PRESTIGE_CACHE=new Map();
export function clubPrestige(club){
 if(!club)return 0;
 const key=`${club.id}|${club.level}|${club.countryCode||''}|${club.name}`;
 let v=PRESTIGE_CACHE.get(key);if(v===undefined){v=computePrestige(club);PRESTIGE_CACHE.set(key,v);}
 return v;
}

function wageCeiling(club){const base=FINANCES[club.countryCode]||750000;const p=clubPrestige(club);const tier=getInauguralLeague(club.id)?.tier||1;
 return Math.round(base*clamp(Math.pow(p/86,2),.25,1.3)*(tier>=2?.20:1));}
export function annualSalary(club,ovr,role='Titular',seed=''){if(!club)return 0;
 const p=clubPrestige(club),talent=clamp((ovr-48)/43,.08,1.14);
 const roleFactor=role==='Reserva'?.33:role==='Rotación'?.67:role==='Cesión'?.55:1;
 const minor=clamp(1+(hash(`${club.id}:${seed}`)%17-8)/100,.92,1.08);
 const high=clamp(.23+talent**2.8*.88,.14,1.15);
 return Math.max(9000,Math.round(wageCeiling(club)*high*roleFactor*minor/1000)*1000);
}
export function annualSalaryLabel(value){return new Intl.NumberFormat('es-CL',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value||0);}
function performance(state){
 const seasons=(state.history||[]).slice(-2);
 if(!seasons.length)return 0;
 const last=seasons.at(-1),games=Math.max(1,last.matches||0);
 const isAttack=['DC','EI','ED','MCO'].includes(state.position);
 const production=(last.goals||0)*1.4+(last.assists||0)*1.1;
 const score=clamp((production/games)*(isAttack?22:12)-3,0,23);
 return score+(last.leaguePosition<=3?4:0)+(last.international?3:0)+(last.rating?clamp((last.rating-6.6)*6,-4,6):0);
}
export function playerDemand(state){const age=state.age||20;const veteran=Math.max(0,age-31)*1.7;return clamp((state.ovr||60)+marketRarity(state)+(performance(state)-9)*.32+((state.reputation||0)-35)*.036-veteran,42,98);}
function eligibleClubs(state){return CLUBS.filter(c=>c.id!==state.clubId&&(!validLeagueCountry.has(c.countryCode)||!!getInauguralLeague(c.id)));}
function weightClub(state,c,focus){
 const prestige=livePrestige(state,c),demand=playerDemand(state),gap=prestige-demand;
 const elite=demand>=84;
 if(elite&&prestige<79)return 0;
 if(demand>=77&&prestige<68)return 0;
 if(demand<76&&gap>20)return 0;
 if(gap<-12||gap>16)return 0;
 let w=Math.exp(-Math.pow((gap+(elite?1:2))/10,2));
 if(state.age>=34){const years=state.age-33;w*=clamp(1-years*.09,.2,1);}
 if(state.age>=38){const years=state.age-37;w*=clamp(1-years*.065,.10,.95);if(prestige>=82)w*=clamp(1-years*.09,.04,.92);if(c.countryCode===state.country)w*=1.5;}
 const recent=(state.history||[]).length;
 if(recent<3&&c.countryCode!==state.country)w*=.30;
 if(focus==='international'&&c.countryCode===state.country)w*=.14;
 if(focus==='local'&&c.countryCode!==state.country)w*=.16;
 if(focus==='money')w*=clamp(wageCeiling(c)/1600000,.35,4);
 if(focus==='minutes'&&gap>4)w*=.5;
 const social=socialEffects(state);if(gap>0)w*=1+social.agentQuality*Math.min(1,gap/12);
 if(state.riskProfile==='hogareno')w*=c.countryCode===state.country?1.5:.7;
 if(state.riskProfile==='aventurero'&&c.countryCode!==state.country)w*=1.35;
 if(state.riskProfile==='leal')w*=.75;
 if(state.riskProfile==='audaz'&&gap>3)w*=1.22;
 if(state.riskProfile==='paciente'&&gap>5)w*=.65;
 if(state.riskProfile==='economico')w*=clamp(wageCeiling(c)/1000000,.65,2.2);
 if(state.publicImage==='mediatico'&&prestige>=85)w*=1.15;
 // Sueños y ambición: europa/ambicioso miran a los grandes; regresar premia a los clubes de tu país en la veteranía.
 const cf=choiceFx(state);
 if(cf.market>1&&prestige>=80)w*=cf.market;
 if(state.dream==='regresar'&&state.age>=30&&c.countryCode===state.country)w*=1.25;
 if(c.id===state.fanClubId)w*=1.0; // El equipo favorito no tiene fichaje garantizado.
 return w;
}
export function buildTransferOffers(state,{attempt=0,focus='balanced',forced=false}={}){
 const seed=`${state.seed}:mercado07:${state.age}:${state.clubId}:${attempt}:${focus}`;
 const r=random(seed),demand=playerDemand(state);
 const selected=[];
 const weighted=eligibleClubs(state).map(c=>({c,w:weightClub(state,c,focus)})).filter(x=>x.w>.00001);
 let count=demand>=84?3:2+Math.floor(r()*2);if(socialEffects(state).agentMarket>1.12&&count<4)count++;
 if(state.age>=35&&state.age<38)count=Math.max(0,count-1-(r()<.4?1:0));
 if(state.age>=38){const probability=clamp(.94-(state.age-38)*.095-(state.ovr<58?.18:0),0,.95);count=Array.from({length:3},()=>r()<probability).filter(Boolean).length;}
 for(let k=0;k<count&&weighted.length;k++){
  const total=weighted.reduce((a,x)=>a+x.w,0);let roll=r()*total;
  let index=weighted.findIndex(x=>(roll-=x.w)<=0);if(index<0)index=weighted.length-1;
  const {c}=weighted.splice(index,1)[0];const prestige=livePrestige(state,c);const gap=prestige-demand;
  const kind=state.age<=23&&gap<-3&&r()<.12?'loan':'transfer';
  const role=gap>7?'Rotación':gap<-5?'Titular':r()<.22?'Rotación':'Titular';
  const years=kind==='loan'?1:state.age>=36?1+(r()<.20?1:0):2+Math.floor(r()*3);
  const salary=annualSalary(c,state.ovr,role,seed+':'+k);
  selected.push({...c,prestige,kind,role,years,salary,fee:Math.round((state.ovr||60)*90000*(prestige/85)),project:gap>6?'Competencia por minutos':gap<-5?'Jugador importante':'Pieza de primer equipo'});
 }
 // Un grande que preguntó por ti durante la temporada concreta su oferta si tu nivel acompaña.
 const interest=(state.threads||[]).find(t=>t.kind==='big_club_interest'&&!t.resolved);
 if(interest&&byId[interest.data?.clubId]&&!selected.some(x=>x.id===interest.data.clubId)){
  const c=byId[interest.data.clubId],prestige=livePrestige(state,c);
  if(demand>=prestige-11){const role=prestige-demand>6?'Rotación':'Titular';selected.unshift({...c,prestige,kind:'transfer',role,years:3+(r()<.5?1:0),salary:annualSalary(c,state.ovr,role,seed+':interest'),fee:Math.round((state.ovr||60)*110000*(prestige/85)),project:'Te seguían desde hace meses',highlight:true});}
 }
 if(forced&&!selected.length&&state.age<37){
  const possible=eligibleClubs(state).filter(c=>livePrestige(state,c)>=demand-25).sort((a,b)=>Math.abs(livePrestige(state,a)-demand)-Math.abs(livePrestige(state,b)-demand));
  if(possible[0]){const c=possible[0];selected.push({...c,prestige:livePrestige(state,c),kind:'transfer',role:'Rotación',years:2,salary:annualSalary(c,state.ovr,'Rotación'),project:'Oportunidad para continuar'});}
 }
 return selected;
}
export function evaluateClubFuture(state){
 const year=(state.startYear||2026)+(state.age-(state.startAge||16));
 const expiring=!state.contract||state.contract.ends<=year;
 const club=marketClub(state.clubId);if(!club)return {canStay:false,reason:'free',renewal:null};
 const perf=performance(state),trust=state.coachTrust??50;
 const r=random(`${state.seed}:club-policy07:${state.age}:${state.clubId}`);
 const underperform=(state.lastSeason?.matches||0)<10&&state.age>=22;
 const surplus=state.ovr>=86&&livePrestige(state,club)<77;
 const senior=state.age>=38;
 const veteranRisk=senior?clamp(.08+(state.age-38)*.092+(state.ovr<60?.22:0)-(trust>75?.08:0),0,.98):0;
 const board=state.squad?.board??55;
 const nonrenew=expiring&&(underperform||trust<27||board<22&&r()<.6||r()<.07||senior&&r()<veteranRisk||state.age>=35&&state.ovr<64&&r()<.5);
 const placed=state.age<=23&&!expiring&&trust<33&&r()<.42;
 const listed=!expiring&&(surplus&&r()<.25||trust<20&&r()<.25||board<20&&r()<.3);
 let reason=nonrenew?'released':placed?'loan-request':listed?'listed':expiring?'renewal':'normal';
 const canStay=!nonrenew&&!placed&&!listed;
 const renewal=canStay&&expiring?{ends:year+(senior?1:2+Math.floor(r()*3)),salary:Math.round(annualSalary(club,state.ovr,trust>=52?'Titular':'Rotación',year)*(board>=72?1.1:board<35?.92:1)*(state.squad?.idol?1.08:1)/1000)*1000}:null;
 return {canStay,reason,renewal};
}
