import { classFor, profileMatchEffects } from './archetypes17.mjs';
/* RASCENSO 1.5 — jugadas originales, reproducibles y sin APIs externas.
   El juego simula la temporada; el usuario puede influir en UN lance especial al año.
*/
import { fixtureContext } from './career15.mjs';
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const roles={POR:'atajada',DFC:'corte',LI:'corte',LD:'corte',MCD:'corte',MC:'pase',MI:'pase',MD:'pase',MCO:'pase',EI:'libre',ED:'libre',DC:'penal'};
export const MOMENT_NAMES={penal:'Penal decisivo',libre:'Tiro libre peligroso',pase:'Pase que rompe líneas',corte:'Cierre defensivo',atajada:'Mano a mano contra el arquero',corner:'Córner ensayado',cabeza:'Cabezazo en el área',remate:'Remate de primera',regate:'Uno contra uno',desmarque:'Desmarque en el momento justo',centro:'Centro a la carrera',despeje:'Despeje bajo presión',salida:'Salida por arriba',achique:'Achique ante el delantero'};
export const MINIGAME_MODES={penal:'precision',libre:'precision',pase:'memoria',corte:'reflejos',atajada:'reflejos',corner:'memoria',cabeza:'precision',remate:'precision',regate:'reflejos',desmarque:'reflejos',centro:'memoria',despeje:'reflejos',salida:'memoria',achique:'reflejos'};
export function minigameMode(match){return MINIGAME_MODES[match?.type]||'precision';}
export function memorySequence(match){const seed=hash(`${match.year}:${match.round}:${match.home}:${match.away}:${match.type}:patron`);return [seed%3,Math.floor(seed/7)%3,Math.floor(seed/31)%3];}
export function memoryAccuracy(match,answers){const seq=memorySequence(match);return Array.isArray(answers)&&answers.length===3&&seq.every((x,i)=>x===answers[i])?100:0;}
export function executionVerdict(match,timing,performance){
 const mode=minigameMode(match),accuracy=performance===null?null:Number(performance);
 if(mode==='memoria')return {valid:performance===null||accuracy===100,reason:performance===null?'Modo clásico':accuracy===100?'Secuencia correcta':'Secuencia equivocada'};
 const distance=timingQuality(match,timing).distance;
 if(distance===null)return {valid:true,reason:'Modo clásico'};
 return {valid:distance<=28,reason:distance<=28?'Ejecución dentro de la zona':'Fallaste la ventana de ejecución'};
}
export function upcomingMoment(s,playerMatches,getClub){
 if(s.phase!=='season'||!playerMatches?.length)return null;
 const eligible=playerMatches.filter(x=>x.played);
 if(!eligible.length)return null;
 const choices=eligible.map(m=>({m,ctx:fixtureContext(s,m,getClub)}));
 const favorites=choices.filter(x=>x.ctx.classic||x.m.round>=Math.max(10,Math.round(playerMatches.length*.70)));
 const pool=favorites.length?favorites:choices;
 const selected=pool[hash(`${s.seed}:${s.age}:${s.clubId}:momento15`)%pool.length];
 const y=(s.startYear||2026)+(s.age-(s.startAge||16));
 const primary=classFor(s)?.moment||roles[s.position]||'pase';
 const alternatives={DC:['penal','cabeza','remate','desmarque'],EI:['libre','corner','regate','centro'],ED:['libre','corner','regate','centro'],MC:['pase','corner','centro'],MCO:['pase','corner','libre'],MI:['pase','centro','regate'],MD:['pase','centro','regate'],MCD:['corte','despeje','pase'],DFC:['corte','despeje','cabeza'],LI:['corte','centro','despeje'],LD:['corte','centro','despeje'],POR:['atajada','salida','achique']};
 const variants=alternatives[s.position]||[primary];
 const type=y===(s.startYear||2026)?primary:variants[hash(`${s.seed}:${y}:minijuego18`)%variants.length];
 const i=hash(`${s.seed}:${y}:${selected.m.round}:${type}`);
 return {year:y,home:selected.m.home,away:selected.m.away,round:selected.m.round,rival:selected.ctx.rival,club:selected.ctx.club,homeName:selected.ctx.home,awayName:selected.ctx.away,classic:selected.ctx.classic,tag:selected.ctx.tag,type,aim:i%3,pressure:55+i%31+profileMatchEffects(s).pressure};
}
export const ZONES=['Izquierda','Centro','Derecha'];
// Centro de la ventana de ejecución. La ventana se ve durante el desafío;
// el usuario gana precisión deteniendo el cursor cerca de ella.
export function timingTarget(match){
 return 23+hash(`${match.year}:${match.round}:${match.home}:${match.away}:${match.type}:precision16`)%55;
}
export function timingQuality(match,timing){
 if(timing===null||timing===undefined)return {distance:null,bonus:0,grade:'Clásico'};
 const distance=Math.abs(Math.max(0,Math.min(100,Number(timing)))-timingTarget(match));
 return {distance,bonus:Math.max(-27,Math.min(23,Math.round(23-distance*.9))),grade:distance<=7?'Excelente':distance<=16?'Buena':distance<=28?'Ajustada':'Desviada'};
}
export function solveMoment(s,match,zone,timing=null,performance=null){
 if(s.phase!=='season'||s.clutchMoment||!match||![0,1,2].includes(zone))return s;
 const attr=s.attributes||{};
 const skill=({penal:attr.shot,libre:attr.shot,cabeza:attr.physical,remate:attr.shot,regate:attr.dribble,desmarque:attr.pace,corner:attr.pass,centro:attr.pass,pase:attr.pass,corte:attr.defense,despeje:attr.defense,atajada:attr.defense,salida:attr.defense,achique:attr.defense})[match.type]||s.ovr||60;
 const precision=Math.max(0,Math.min(100,Math.round(skill*.77+(s.coachTrust||50)*.14+(s.morale||70)*.09)));
 const challenge=match.pressure||65;
 const distance=Math.abs(zone-match.aim);
 const chance=distance===0?Math.max(35,Math.min(96,precision+22-challenge*.35)):distance===1?Math.max(12,Math.min(75,precision-18-challenge*.38)):Math.max(4,Math.min(37,precision-41-challenge*.4));
 const quality=timingQuality(match,timing);
 const finalChance=Math.max(3,Math.min(97,Math.round(chance+quality.bonus)));
 const roll=hash(`${s.seed}:${s.age}:${s.clubId}:${match.round}:${zone}`)%100;
 const execution=executionVerdict(match,timing,performance);
 const success=execution.valid&&roll<finalChance;
 return {...s,clutchMoment:{...match,zone,success,chance:finalChance,roll,timing:timing===null?null:Math.round(timing),timingTarget:timingTarget(match),timingGrade:quality.grade,performance,executionReason:execution.reason,executionValid:execution.valid},careerMoments:[...(s.careerMoments||[]),{year:match.year,kind:'on-field',text:`${MOMENT_NAMES[match.type]} ante ${match.rival}: ${success?'éxito':'fallo'} (${ZONES[zone]} · ${quality.grade})`}].slice(-120)};
}
export function momentScoreDelta(moment,fixture,plays){
 if(!moment?.success||!plays||moment.home!==fixture.home||moment.away!==fixture.away||moment.round!==fixture.round)return null;
 return {type:moment.type,attack:['penal','libre','pase','corner','cabeza','remate','regate','desmarque','centro'].includes(moment.type),defend:['corte','atajada','despeje','salida','achique'].includes(moment.type)};
}
