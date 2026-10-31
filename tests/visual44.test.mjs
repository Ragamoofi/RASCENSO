import test from 'node:test';
import assert from 'node:assert/strict';
import {PLAYS} from '../src/plays30.mjs';
import {sceneVisualStyle44,drawSceneFilm44,drawBriefFilm44,drawResultFilm44} from '../src/scene-visual44.mjs';
import {careerActs,renderCareerActs,careerSignature} from '../src/legacy-presentation44.mjs';
import {matchdayPanel} from '../src/matchday41.mjs';

test('las 20 escenas pertenecen a una identidad artística visual',()=>{
 const names=Object.keys(PLAYS);
 assert.equal(names.length,20);
 const groups=new Set();
 for(const type of names){
  const s=sceneVisualStyle44(type);
  assert.ok(s.accent&&s.shadow&&s.label&&s.group,type);
  groups.add(s.group);
 }
 assert.equal(groups.size,5);
 for(const name of ['duelo','vuelo','lectura','presion','velocidad'])assert.ok(groups.has(name));
});
test('iluminación y efectos son puramente gráficos, sin modificar el estado ni RNG',()=>{
 const context=new Proxy({
  createLinearGradient(){return {addColorStop(){}};},
  createRadialGradient(){return {addColorStop(){}};}
 },{get(target,key){if(key in target)return target[key];return ()=>{};},set(target,key,value){target[key]=value;return true;}});
 const state={play:{type:'penal',kind:'attack',pressure:90},t:2.4,phase:'outro',outT:1,
  timer:10,result:{success:true,quality:.8}};
 const original=JSON.stringify(state);
 drawSceneFilm44(state,context);
 drawBriefFilm44(state,context);
 drawResultFilm44(state,context);
 assert.equal(JSON.stringify(state),original);
});
test('historia de tres actos usa años y clubes reales, incluso si la carrera fue corta',()=>{
 const s={name:'<Persona>',position:'DC',history:[
  {year:2026,club:'Barrio FC',matches:10,goals:2,assists:1,ovrAfter:60},
  {year:2029,club:'Gran Club',matches:37,goals:26,assists:9,titles:['Copa'],ovrAfter:85},
  {year:2045,club:'Último Club',matches:3,goals:0,assists:1,ovrAfter:50}
 ]};
 const acts=careerActs(s);
 assert.deepEqual(acts.map(a=>a.year),[2026,2029,2045]);
 assert.match(renderCareerActs(s),/Gran Club/);
 assert.match(renderCareerActs(s),/TRES ACTOS/);
 assert.equal(careerActs({...s,history:[]}).length,0);
 const tiny={...s,history:s.history.slice(0,1)};
 assert.equal(careerActs(tiny).length,3);
});
test('la firma deportiva solo refleja logros registrados, sin fabricar una leyenda',()=>{
 const s={position:'DC'};
 assert.deepEqual(careerSignature(s,{a:{},history:[]}),['Trayectoria profesional']);
 const d={a:{caps:35,titles:8,goals:200,assists:120,clubs:[1,2,3,4,5,6]},history:Array.from({length:17},()=>({}))};
 assert.equal(careerSignature(s,d).length,3);
 assert.ok(careerSignature({...s,position:'POR'},{a:{},history:Array.from({length:10},()=>({}))}).includes('Guardián de la portería'));
});
test('marcador muestra escudos de los clubes correctos sin alterar las jugadas',()=>{
 const s={clubId:'a',position:'DC',attributes:{shot:70,pace:70,pass:70,physical:70,defense:70,dribble:70}};
 const p={id:'jugada',type:'penal',kind:'attack',credit:'goal',rival:'Rival',rivalId:'b',
  isHome:true,before:{gf:1,ga:2},minute:84,round:12,pressure:80,difficulty:.6,fatigue:.1,tag:'Partido clave'};
 const plays=[p],original=JSON.stringify(plays);
 const html=matchdayPanel(s,plays,id=>({a:{name:'Local'},b:{name:'Rival'}}[id]),id=>'<img alt="escudo" data-club="'+id+'">');
 assert.match(html,/matchday-arena/);
 assert.match(html,/matchday-situation/);
 assert.match(html,/data-club="a"/);
 assert.match(html,/data-club="b"/);
 assert.match(html,/1.*:.*2/s);
 assert.equal(JSON.stringify(plays),original);
});
