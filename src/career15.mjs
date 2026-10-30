/* RASCENSO 1.5 — Economía, contexto de rivalidades y archivo del futbolista. */
import { annualSalary, playerDemand, clubPrestige } from './market.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function marketValueEUR(s,club){
 if(!s?.ovr)return 0;
 const age=s.age||18, latest=s.history?.at(-1)||{};
 const form=clamp(((latest.goals||0)*1.5+(latest.assists||0)) / Math.max(1,latest.matches||20),0,2.5);
 const potential=Math.max(0,(s.potential||s.ovr)-s.ovr);
 const youth=age<=23?1.5:age<=28?1.22:age<=31?1:age<=34?.68:age<=38?.33:clamp(.20-(age-39)*.015,.035,.20);
 const prestige=club?clamp(clubPrestige(club)/78,.65,1.35):1;
 return Math.round(clamp(Math.pow(Math.max(1,s.ovr-42)/48,3)*37000000*youth*prestige*(1+form*.20)*(1+potential*.014),35000,180000000)/10000)*10000;
}
export function contractSnapshot(s){
 const end=s.contract?.ends;
 const remaining=Number.isFinite(end)?Math.max(0,end-((s.startYear||2026)+(s.age-(s.startAge||16)))):0;
 const annual=Number(s.contract?.salary)||0;
 return {annual,monthly:Math.round(annual/12),remaining,expires:end??null,valid:!!s.contract&&remaining>0};
}
const pairs=[
 ['Colo-Colo','Universidad de Chile'],['Universidad Católica','Universidad de Chile'],['Colo-Colo','Universidad Católica'],
 ['Real Madrid','Barcelona'],['Real Madrid','Atlético de Madrid'],['Barcelona','Espanyol'],
 ['Manchester United','Manchester City'],['Manchester United','Liverpool'],['Arsenal','Tottenham'],['Chelsea','Arsenal'],['Liverpool','Everton'],
 ['Inter de Milán','Milan'],['Juventus','Inter de Milán'],['Roma','Lazio'],
 ['Boca Juniors','River Plate'],['Independiente','Racing Club'],['Newell’s Old Boys','Rosario Central'],
 ['Peñarol','Nacional'],['Flamengo','Fluminense'],['Corinthians','Palmeiras'],['Grêmio','Internacional'],
 ['Celtic','Rangers'],['PSG','Marsella'],['Paris Saint-Germain','Marsella'],['Bayern Múnich','Borussia Dortmund'],
 ['Benfica','Sporting CP'],['Porto','Benfica'],['Ajax','Feyenoord'],['Galatasaray','Fenerbahçe'],
 ['Atlas','Guadalajara'],['América','Guadalajara'],['Alianza Lima','Universitario'],['Olimpia','Cerro Porteño'],
 ['Barcelona SC','Emelec'],['Millonarios','Santa Fe'],['Atlético Nacional','Independiente Medellín']
];
const key=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
const rivalry=new Set(pairs.flatMap(([a,b])=>[`${key(a)}:${key(b)}`,`${key(b)}:${key(a)}`]));
export function fixtureContext(s,match,getClub){
 if(!match)return null;
 const home=getClub(match.home)?.name||'Local',away=getClub(match.away)?.name||'Visita';
 const rival=match.home===s.clubId?away:home;
 const own=match.home===s.clubId?home:away;
 const classic=rivalry.has(`${key(own)}:${key(rival)}`);
 const important=classic||match.round>=24||(s.lastSeason?.leaguePosition||99)<=3;
 const tag=classic?'CLÁSICO':match.round>=24?'RECTA FINAL':important?'PARTIDO IMPORTANTE':'JORNADA DE LIGA';
 return {rival,club:own,home,away,classic,important,tag,round:match.round,score:match.score};
}
export function careerAchievements(s){
 const seasons=s.history||[],total={matches:0,goals:0,assists:0,caps:0};
 for(const x of seasons){total.matches+=x.matches||0;total.goals+=x.goals||0;total.assists+=x.assists||0;total.caps+=x.nationalCaps||0;}
 const clubs=[];for(const y of seasons){const found=clubs.find(x=>x.id===y.clubId);if(found){found.years.push(y.year);found.goals+=y.goals||0;found.matches+=y.matches||0;}else clubs.push({id:y.clubId,name:y.club||'Club',years:[y.year],goals:y.goals||0,matches:y.matches||0});}
 const titles=(s.trophyRecords||[]).map(x=>({name:x.title||x.name||'Título',year:x.year,clubId:x.clubId,kind:x.kind||'league'}));
 if(!titles.length){for(const y of seasons)for(const t of y.titles||[])titles.push({name:t,year:y.year,clubId:y.clubId,kind:'league'});}
 return {...total,seasons:seasons.length,clubs,titles,first:seasons[0]?.year,last:seasons.at(-1)?.year,peak:Math.max(0,...seasons.map(x=>x.ovrAfter||0)),totalEarnings:s.careerEarnings||0};
}
export function careerHeadline(s){const a=careerAchievements(s);return a.titles.length>=12?'Una leyenda que ganó en todas partes':a.goals>=300?'El goleador que marcó una época':a.clubs.length>=7?'Una vida recorriendo estadios':a.caps>=40?'Una carrera vistiendo dos camisetas':a.seasons>=20?'Toda una vida dedicada al fútbol':'Del barrio a la historia';}
