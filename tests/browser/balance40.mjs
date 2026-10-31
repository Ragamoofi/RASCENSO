/* Evaluación de dificultad: bot con acceso a estados internos; no equivale a jugadores humanos. */
import './scenes-node.mjs';
import {PLAYS} from '../../src/plays30.mjs';
const sample=100,rows=[],problems=[];
for(const type of Object.keys(PLAYS))for(const [level,difficulty] of [[55,.25],[55,.85],[85,.25],[85,.85]]){
 let wins=0,unfinished=0;for(let i=0;i<sample;i++){const r=globalThis.runSmart(type,{level,difficulty,seed:`balance-${i}`});if(r.error||!r.finished)unfinished++;if(r.success)wins++;}
 rows.push({type,level,difficulty,wins,unfinished});if(unfinished)problems.push(`${type} ${level}/${difficulty}: ${unfinished} sin resultado`);
}
console.log('Balance automatizado (bot con información interna):',JSON.stringify(rows));
console.log('Casos extremos para revisión humana:',JSON.stringify(rows.filter(r=>r.wins===0||r.wins>=95)));
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
