/* RASCENSO 1.5 — jugadas originales, reproducibles y sin APIs externas.
   El juego simula la temporada; el usuario puede influir en UN lance especial al año.
*/
import { fixtureContext } from './career15.mjs';
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const roles={POR:'atajada',DFC:'corte',LI:'corte',LD:'corte',MCD:'corte',MC:'pase',MI:'pase',MD:'pase',MCO:'pase',EI:'libre',ED:'libre',DC:'penal'};
export const MOMENT_NAMES={penal:'Penal decisivo',libre:'Tiro libre peligroso',pase:'Pase que rompe líneas',corte:'Cierre defensivo',atajada:'Mano a mano contra el arquero'};
export function upcomingMoment(s,playerMatches,getClub){
 if(s.phase!=='season'||!playerMatches?.length)return null;
 const eligible=playerMatches.filter(x=>x.played);
 if(!eligible.length)return null;
 const choices=eligible.map(m=>({m,ctx:fixtureContext(s,m,getClub)}));
 const favorites=choices.filter(x=>x.ctx.classic||x.m.round>=Math.max(10,Math.round(playerMatches.length*.70)));
 const pool=favorites.length?favorites:choices;
 const selected=pool[hash(`${s.seed}:${s.age}:${s.clubId}:momento15`)%pool.length];
 const type=roles[s.position]||'pase';const y=(s.startYear||2026)+(s.age-(s.startAge||16));
 const i=hash(`${s.seed}:${y}:${selected.m.round}:${type}`);
 return {year:y,home:selected.m.home,away:selected.m.away,round:selected.m.round,rival:selected.ctx.rival,club:selected.ctx.club,homeName:selected.ctx.home,awayName:selected.ctx.away,classic:selected.ctx.classic,tag:selected.ctx.tag,type,aim:i%3,pressure:55+i%31};
}
export const ZONES=['Izquierda','Centro','Derecha'];
export function solveMoment(s,match,zone){
 if(s.phase!=='season'||s.clutchMoment||!match||![0,1,2].includes(zone))return s;
 const attr=s.attributes||{};
 const skill=({penal:attr.shot,libre:attr.shot,pase:attr.pass,corte:attr.defense,atajada:attr.defense})[match.type]||s.ovr||60;
 const precision=Math.max(0,Math.min(100,Math.round(skill*.77+(s.coachTrust||50)*.14+(s.morale||70)*.09)));
 const challenge=match.pressure||65;
 const distance=Math.abs(zone-match.aim);
 const chance=distance===0?Math.max(35,Math.min(96,precision+22-challenge*.35)):distance===1?Math.max(12,Math.min(75,precision-18-challenge*.38)):Math.max(4,Math.min(37,precision-41-challenge*.4));
 const roll=hash(`${s.seed}:${s.age}:${s.clubId}:${match.round}:${zone}`)%100;
 const success=roll<chance;
 return {...s,clutchMoment:{...match,zone,success,chance,roll},careerMoments:[...(s.careerMoments||[]),{year:match.year,kind:'on-field',text:`${MOMENT_NAMES[match.type]} ante ${match.rival}: ${success?'éxito':'fallo'} (${ZONES[zone]})`}].slice(-120)};
}
export function momentScoreDelta(moment,fixture,plays){
 if(!moment?.success||!plays||moment.home!==fixture.home||moment.away!==fixture.away||moment.round!==fixture.round)return null;
 return {type:moment.type,attack:['penal','libre','pase'].includes(moment.type),defend:['corte','atajada'].includes(moment.type)};
}
