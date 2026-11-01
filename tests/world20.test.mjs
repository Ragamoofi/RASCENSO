import {autoSummerCareer} from '../src/summer-career4111.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { newCareer, acceptDraft, academyOffers, signAcademy, autoResolveEvent, advanceSeason, simulateToRetirement, migrateCareer, eventInfo, resolveEvent, finishEvent, currentObjectives, negotiateOffer, openAgentMarket, retireNow, canRetire, syncClub, draftChoices, SAVE_VERSION } from '../src/engine.mjs';
import { ovrFromAttributes, squadRole, threadEffects, addThread, juniorValue, juniorCeiling, seasonRating, KEY_ATTRS } from '../src/career20.mjs';
import { coachFor, worldRival, dynamicLevel, worldClub } from '../src/world20.mjs';
import { WORLD_SCENE_IDS, applyWorldEffects } from '../src/story20.mjs';

function start(seed,position='DC',country='CL',pick=0){let s=newCareer({name:'Prueba',position,country,seed});while(s.phase==='draft')s=acceptDraft(s,pick);s=signAcademy(s,academyOffers(s)[0].id);return autoResolveEvent(s);}
import { chooseTransfer, retireFromMarket } from '../src/engine.mjs';
function seasons(s,n){
 let k=0;
 while(s.history.length<n&&k++<80&&s.phase!=='retired'){
  if(s.phase==='season')s=advanceSeason(s);
  else if(s.phase==='event')s=autoResolveEvent(s);
  else if(s.phase==='summer')s=autoSummerCareer(s);
  else if(s.phase==='transfer')s=s.market?.canStay===false?(s.offers[0]?chooseTransfer(s,s.offers[0].id):retireFromMarket({...s,age:Math.max(31,s.age)})):chooseTransfer(s);
 }
 return s;
}

test('2.0 · el legado es una referencia: el juvenil empieza bajo y con techo propio',()=>{
 let s=newCareer({name:'Draft',position:'MC',seed:'draft20'});
 for(const c of draftChoices(s)){assert.ok(c.junior<=c.value||['skills','weak'].includes(c.key));assert.ok(c.ceiling>=c.junior);}
 assert.ok(juniorValue(99,'shot','icono')<=66);assert.ok(juniorCeiling(99,'shot','profesional')<=94);
 while(s.phase==='draft')s=acceptDraft(s,0);
 assert.equal(s.attrModel,2);
 assert.equal(s.ovr,ovrFromAttributes(s.position,s.attributes));
 for(const k of KEY_ATTRS)assert.ok(s.attrCeil[k]>=s.attributes[k],k);
 assert.ok(s.ovr>=40&&s.ovr<=70,`media inicial ${s.ovr}`);assert.ok(s.potential>=s.ovr);
});

test('2.0 · la media siempre se deriva de los atributos reales',()=>{
 let s=seasons(start('coherencia20','EI'),5);
 assert.equal(s.ovr,ovrFromAttributes(s.position,s.attributes));
 const last=s.history.at(-1);assert.equal(last.ovrAfter,ovrFromAttributes(s.position,last.attributesAfter));
 for(const h of s.history)for(const k of KEY_ATTRS)assert.ok(Math.abs(h.attributeChanges[k])<=8,`cambio anual exagerado en ${k}`);
});

test('2.0 · el mundo evoluciona: clubes, entrenadores, futbolistas, premios y noticias',()=>{
 const s=seasons(start('mundo20'),4);
 assert.ok(s.world&&s.world.year>=2029);
 assert.ok(s.world.news.length>=10);
 assert.ok(Object.values(s.world.clubs).some(c=>Math.abs(c.d||0)>=1),'algún club cambia de nivel');
 assert.ok(Object.values(s.world.clubs).some(c=>(c.cg||0)>0),'algún entrenador fue reemplazado');
 assert.ok(s.world.awards.length===4&&s.world.awards.every(a=>a.list.some(x=>x.id==='ball')));
 assert.ok(s.world.players.some(p=>p.kind==='prospect'),'aparecen nuevas promesas');
 assert.ok(worldRival(s),'existe un rival generacional');
 const club=worldClub(s.clubId);assert.equal(dynamicLevel(s,club),Math.max(40,Math.min(92,club.level+Math.round(s.world.clubs[club.id]?.d||0))));
});

test('2.0 · determinismo: misma semilla, mismo mundo y misma carrera',()=>{
 const a=seasons(start('det20'),3),b=seasons(start('det20'),3);
 assert.deepEqual(a.history.map(x=>[x.ovrAfter,x.goals,x.leaguePosition,x.rating]),b.history.map(x=>[x.ovrAfter,x.goals,x.leaguePosition,x.rating]));
 assert.deepEqual(a.world.news,b.world.news);
});

test('2.0 · vestuario: competidor directo, entrenador real y objetivos evaluados',()=>{
 let s=start('vest20','DFC');
 assert.ok(s.squad?.rival?.name&&s.squad.clubId===s.clubId);
 assert.equal(s.relationships.coach.name,coachFor(s,s.clubId).name);
 const obj=currentObjectives(s);assert.ok(obj.board.label&&obj.personal.target>0&&obj.minutes.target>0);
 s=advanceSeason(s);
 const ev=s.lastSeason.objectives;assert.equal(typeof ev.board.met,'boolean');assert.equal(typeof ev.personal.met,'boolean');
 assert.ok(s.lastSeason.rating>=5.6&&s.lastSeason.rating<=8.6);
 const high={...s,ovr:s.squad.rival.ovr+12},low={...s,ovr:s.squad.rival.ovr-15};
 assert.equal(squadRole(high,60,null),'Titular');assert.notEqual(squadRole(low,60,null),'Titular');
});

test('2.0 · los compromisos tienen efecto real en la simulación',()=>{
 const s=start('hilos20');
 const promised={...s,threads:addThread(s,'promise_minutes',{},1)};
 assert.ok(threadEffects(promised).role>threadEffects(s).role);
 const trained={...s,threads:addThread(s,'extra_training',{},1)};
 assert.ok(threadEffects(trained).growth>1&&threadEffects(trained).injury>1);
 const moved=applyWorldEffects(s,{position:'MCO'});
 assert.equal(moved.position,'MCO');assert.equal(moved.ovr,ovrFromAttributes('MCO',moved.attributes));
});

test('2.0 · todas las escenas del mundo se construyen y resuelven sin errores',()=>{
 let base=seasons(start('escenas20','MC'),2);
 if(base.phase!=='event')base={...base,phase:'event',recapPending:false};
 const club=Object.keys(base.world.clubs).find(id=>id!==base.clubId&&worldClub(id));
 for(const id of WORLD_SCENE_IDS){
  const s={...base,phase:'event',sceneBeat:0,pendingEvent:id,sceneData:{clubId:club,position:'MCO',newOvr:base.ovr+2,award:'Balón de Ascenso',youth:'Juan Pérez',youthAge:17,called:id==='w_national'},lastSeason:{...base.lastSeason,objectives:base.lastSeason.objectives,injuryWeeks:10}};
  const e=eventInfo(s);assert.ok(e.title&&e.options.length>=2,id);
  for(let i=0;i<e.options.length;i++){const r=resolveEvent(s,i);assert.equal(r.sceneBeat,1,id);const f=finishEvent(r);assert.ok(['season','event','transfer','summer','retired'].includes(f.phase),id);}
 }
});

test('2.0 · negociación determinista: acepta, mantiene o retira la oferta',()=>{
 let s=seasons(start('nego20'),2);while(s.phase!=='season'){s=s.phase==='event'?autoResolveEvent(s):s.phase==='transfer'?chooseTransfer(s):s.phase==='summer'?autoSummerCareer(s):s;}
 s=openAgentMarket(s);assert.equal(s.phase,'transfer');
 const offer=s.offers[0];if(!offer)return;
 const a=negotiateOffer(s,offer.id,'salary'),b=negotiateOffer(s,offer.id,'salary');
 assert.deepEqual(a.offers,b.offers);
 assert.ok(['accepted','rejected','withdrawn'].includes(a.lastNegotiation.result));
 if(a.lastNegotiation.result==='withdrawn')assert.ok(!a.offers.some(o=>o.id===offer.id));
 if(a.lastNegotiation.result==='accepted')assert.ok(a.offers.find(o=>o.id===offer.id).salary>offer.salary);
 assert.equal(negotiateOffer(a,offer.id,'role'),a,'una sola negociación por oferta');
});

test('2.0 · carreras realistas: retiro orgánico, pocos clubes y superestrellas escasas',()=>{
 const peaks=[],ends=[],clubs=[];
 for(let i=0;i<24;i++){const s=simulateToRetirement(start('dist20-'+i,['DC','MC','DFC','POR','EI','MCD'][i%6],['CL','AR','BR','MX'][i%4],i%3));peaks.push(Math.max(...s.history.map(h=>h.ovrAfter)));ends.push(s.age);clubs.push(new Set(s.history.map(h=>h.clubId)).size);assert.equal(s.phase,'retired');}
 assert.ok(ends.every(a=>a>=32&&a<=44),`edades de retiro ${ends}`);
 assert.ok(peaks.filter(p=>p>=90).length<=3,`demasiadas superestrellas ${peaks}`);
 assert.ok(peaks.filter(p=>p<75).length>=6,'también existen carreras modestas');
 const sorted=[...clubs].sort((a,b)=>a-b);assert.ok(sorted[Math.floor(sorted.length/2)]<=7,`clubes por carrera ${clubs}`);
});

test('2.0 · migración de partidas v8: atributos coherentes, historia intacta, mundo creado',()=>{
 const s=seasons(start('migra20','DC'),2);
 const legacy={...s,version:8,attrModel:undefined,attrCeil:undefined,world:undefined,squad:undefined,threads:undefined,awards:undefined,attributes:Object.fromEntries(Object.entries(s.attributes).map(([k,v])=>[k,['skills','weak'].includes(k)?v:v+9]))};
 const m=migrateCareer(legacy);
 assert.equal(m.version,SAVE_VERSION);assert.equal(m.attrModel,2);
 assert.ok(Math.abs(m.ovr-s.ovr)<=1);assert.equal(m.ovr,ovrFromAttributes(m.position,m.attributes));
 assert.deepEqual(m.history,s.history);
 if(['season','event','transfer'].includes(m.phase))assert.ok(m.world&&m.squad);
});

test('2.0 · retiro voluntario solo desde los 32 años',()=>{
 const s=seasons(start('retiro20'),1);const season={...s,phase:'season'};
 assert.equal(canRetire(season),false);assert.equal(retireNow(season),season);
 const veteran={...season,age:33};assert.equal(retireNow(veteran).phase,'retired');
});

test('2.0 · la nota media no premia a suplentes con pocos minutos',()=>{
 const sub=seasonRating({matches:8,minutes:240,goals:3,assists:0,leaguePosition:8,table:new Array(16)},'DC');
 const star=seasonRating({matches:30,minutes:2600,goals:20,assists:8,leaguePosition:2,table:new Array(16)},'DC');
 assert.ok(sub<7.3&&star>sub,`${sub} ${star}`);
});

test('2.0.1 · los gigantes dominan sus ligas sin eliminar las sorpresas',async()=>{
 const {worldClub}=await import('../src/world20.mjs');
 const {simLevel,marketClub}=await import('../src/market.mjs');
 const madrid=marketClub('es-1')?.name==='Real Madrid'?marketClub('es-1'):null;
 const s=seasons(start('ligas201','DC','CL'),12);
 const winners=Object.values(s.world.champions).map(c=>worldClub(c.ES1)?.name).filter(Boolean);
 const giants=['Real Madrid','Barcelona','Atlético de Madrid'];
 assert.ok(winners.filter(w=>giants.includes(w)).length>=Math.ceil(winners.length*.4),`campeones de España: ${winners}`);
 if(madrid)assert.ok(simLevel(madrid)>madrid.level);
});
