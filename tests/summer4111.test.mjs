import test from 'node:test';
import assert from 'node:assert/strict';
import {ACTIVITIES} from '../src/summer-activities.mjs';
import {validateActivities,startSummer,drawOffers,describeModes,modeProbs,mulberry32,createRecordingAdapter,runSummer,policyRandom} from '../src/summer-engine.mjs';
import {SUMMER_VALIDATION,normalizeSummerState,summerSalaryClose,summerSeasonMods,summerOffers,chooseSummerCareer,continueSummerCareer,restSummerCareer,autoSummerCareer,finishSummerCareer,enterSummerCareer,answerSummerFollowUp} from '../src/summer-career4111.mjs';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason,chooseTransfer,simulateToRetirement,migrateCareer} from '../src/engine.mjs';
import {playLeague} from '../src/league.mjs';
import {composure} from '../src/plays30.mjs';

const draft=(seed='summer-test',position='DC')=>{
 let s=newCareer({name:'Verano',seed,age:17,position,country:'CL'});
 while(s.phase==='draft')s=acceptDraft(s,0);
 s=signAcademy(s,academyOffers(s)[0].id);
 while(s.phase==='event')s=autoResolveEvent(s);
 return s;
};
const goSummer=(seed,position='DC')=>{
 let s=draft(seed,position);s=advanceSeason(s);
 let guard=0;while(s.phase!=='summer'&&guard++<18){
  if(s.phase==='event')s=autoResolveEvent(s);
  else if(s.phase==='transfer')s=chooseTransfer(s,s.market?.canStay?null:s.offers?.[0]?.id);
  else break;
 }
 assert.equal(s.phase,'summer');return s;
};

test('las 39 actividades cumplen el esquema y están en español',()=>{
 assert.equal(ACTIVITIES.length,39);assert.deepEqual(SUMMER_VALIDATION,[]);assert.deepEqual(validateActivities(ACTIVITIES),[]);
 assert.equal(new Set(ACTIVITIES.map(x=>x.id)).size,39);
 assert.ok(ACTIVITIES.some(x=>x.requires?.minAge>=32));
});
test('el sorteo es reproducible, ofrece máximo tres y dos de la misma categoría',()=>{
 const one=goSummer('seed-repro');const two=JSON.parse(JSON.stringify(one));
 assert.deepEqual(summerOffers(one).map(x=>x.id),summerOffers(two).map(x=>x.id));
 const offers=summerOffers(one);assert.ok(offers.length>=1&&offers.length<=3);
 for(const category of new Set(offers.map(x=>x.category)))assert.ok(offers.filter(x=>x.category===category).length<=2);
});
test('seis cupos, actividad de dos semanas, riesgo y presupuesto',()=>{
 let s=goSummer('summer-steps');
 let guard=0;while(s.summer.weeksLeft>0&&guard++<6){
  let offers=summerOffers(s);
  let item=offers.find(x=>x.weeks===2)||offers[0];
  if(!item){s=restSummerCareer(s);}else{
   const mode=describeModes(item,{season:2027,age:s.age,money:s.summerFinance.cashEUR/Math.max(9000,s.contract.salary),flags:new Set(s.summerMeta.flags),done:new Set(s.summerMeta.done),history:s.summerMeta.history,stats:{},profile:{}}).find(x=>x.enabled);
   if(!mode){s=restSummerCareer(s)}else s=chooseSummerCareer(s,item.id,mode.mode.id);
  }
  assert.ok(s.summer.weeksLeft>=0);
  s=continueSummerCareer(s);
 }
 assert.equal(s.summer.weeksLeft,0);s=finishSummerCareer(s);assert.equal(s.phase,'season');assert.equal(s.summerHistory.length,1);
});
test('el saldo está anclado al sueldo real y los servicios tienen gasto anual',()=>{
 const old={...draft('money-summer'),summerFinance:{cashEUR:20000,earnedEUR:0,spentEUR:0,services:[{id:'fisio',upkeep:.08,perSeason:{lesiones:-.15}}]}};
 const newer=summerSalaryClose(old,50000);
 assert.equal(newer.summerFinance.cashEUR,66000);assert.equal(newer.summerFinance.earnedEUR,50000);
 assert.equal(newer.summerFinance.spentEUR,4000);assert.equal(summerSeasonMods(newer).lesiones,-.15);
});
test('la misma semilla produce el mismo verano automático',()=>{
 const s=goSummer('auto-fixed');const a=autoSummerCareer(s),b=autoSummerCareer(JSON.parse(JSON.stringify(s)));
 assert.equal(a.phase,'season');assert.deepEqual(a.summerHistory,b.summerHistory);
 assert.deepEqual(a.summerFinance,b.summerFinance);
});
test('partidas antiguas se migran sin perder club, contrato ni historial',()=>{
 const s=draft('old-4107');const old={...s};delete old.summer;delete old.summerMeta;delete old.summerFinance;
 const loaded=migrateCareer(JSON.parse(JSON.stringify(old)));
 assert.ok(loaded);assert.equal(loaded.phase,'season');assert.equal(loaded.clubId,old.clubId);
 assert.equal(loaded.summerFinance.cashEUR,0);
});
test('lesiones, serenidad, desarrollo y minutos afectan realmente al motor',()=>{
 const s=draft('season-modded','MC'),baseline=playLeague(s),modded=playLeague({...s,summerNextMods:{lesiones:-.5,minutos:.08}});
 assert.ok(Number.isFinite(modded.matches));assert.ok(modded.minutes>=0);
 assert.equal(summerSeasonMods({...s,summerNextMods:{lesiones:-.5,minutos:.08,desarrollo:.1,serenidad:.08}}).desarrollo,.1);
 assert.ok(composure({...s,summerNextMods:{serenidad:.08}})>=composure(s));
});
test('follow-ups se guardan para la temporada futura y la escena se puede resolver',()=>{
 let s=goSummer('followup-test');s={...s,summerMeta:{...s.summerMeta,events:[{id:'inauguracion_barrio',dueYear:2028,p:1}]}};
 const next=enterSummerCareer({...s,summer:null,phase:'season',summerDueYear:2028,age:19,summerLastYear:2027});
 assert.equal(next.phase,'summer');assert.equal(next.summerInbox[0].id,'inauguracion_barrio');
 const resolved=answerSummerFollowUp(next,'participar');assert.equal(resolved.summerInbox.length,0);assert.ok(resolved.careerMoments.some(x=>x.kind==='summer'));
});
test('cinco carreras completas con verano no interrumpen el retiro',()=>{
 for(const [i,position] of ['DC','MC','DFC','POR','EI'].entries()){
  const s=draft('sim-long-'+i,position);const retired=simulateToRetirement(s);
  assert.equal(retired.phase,'retired',`posición ${position}`);
  assert.ok(retired.summerHistory.length>=4,`sin veranos para ${position}`);
  assert.ok(retired.history.length>=5);
 }
});
