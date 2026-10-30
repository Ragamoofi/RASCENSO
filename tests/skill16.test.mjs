import test from 'node:test';
import assert from 'node:assert/strict';
import {timingTarget,timingQuality,upcomingMoment,solveMoment} from '../src/moments15.mjs';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,seasonMoment,playCareerMoment,advanceSeason} from '../src/engine.mjs';
import {playLeague} from '../src/league.mjs';
function start(seed='skill16',position='DC'){
 let s=newCareer({name:'Futbolista del desafío',country:'CL',position,seed});
 while(s.phase==='draft')s=acceptDraft(s,0);
 s=signAcademy(s,academyOffers(s)[0].id);
 return autoResolveEvent(s);
}
test('la ventana óptima es estable y siempre alcanza una zona visible del medidor',()=>{
 for(const position of ['DC','MC','DFC','POR','EI']){
  const moment=seasonMoment(start('window16'+position,position));
  assert.ok(moment);
  const t=timingTarget(moment);
  assert.ok(t>=23&&t<=77);
  assert.equal(t,timingTarget(moment));
  assert.equal(timingQuality(moment,t).grade,'Excelente');
  assert.ok(timingQuality(moment,t).bonus>timingQuality(moment,0).bonus);
 }
});
test('mejor ejecución concede mayor probabilidad que un disparo claramente desviado',()=>{
 const s=start('control16','DC'),m=seasonMoment(s),t=timingTarget(m);
 const good=playCareerMoment(s,m.aim,t);
 const bad=playCareerMoment(s,m.aim,t<50?100:0);
 assert.ok(good.clutchMoment.chance>bad.clutchMoment.chance);
 assert.equal(good.clutchMoment.timing,t);
 assert.equal(good.clutchMoment.timingGrade,'Excelente');
 assert.equal(good.clutchMoment.roll,bad.clutchMoment.roll);
 assert.strictEqual(playCareerMoment(good,1,t),good);
});
test('las partidas antiguas sin medidor siguen siendo reproducibles y válidas',()=>{
 const s=start('compat16','MC'),m=seasonMoment(s);
 const old=playCareerMoment(s,1),legacy=solveMoment(s,m,1,null);
 const {fixturePreview,...withoutPreview}=old.clutchMoment;
 assert.deepEqual(withoutPreview,legacy.clutchMoment);
 assert.ok(fixturePreview&&/^\d+-\d+$/.test(fixturePreview.score));
 const next=advanceSeason(old);
 assert.equal(next.lastSeason.clutchMoment.timing,null);
 assert.equal(next.lastSeason.clutchMoment.type,'pase');
});
test('el nuevo desenlace afecta un partido de verdad y queda guardado en la temporada',()=>{
 let found=null;
 for(let i=0;i<60&&!found;i++){
  const s=start('skill-goal-'+i,'DC'),m=seasonMoment(s);
  const result=playCareerMoment(s,m.aim,timingTarget(m));
  if(result.clutchMoment.success) found=[s,result];
 }
 assert.ok(found);
 const [before,after]=found;
 const league1=playLeague(before),league2=playLeague(after);
 const f=after.clutchMoment;
 const key=m=>m.round===f.round&&m.home===f.home&&m.away===f.away;
 const m1=league1.playerMatches.find(key),m2=league2.playerMatches.find(key);
 assert.equal(m2.goals,m1.goals+1);
 assert.equal(m2.score.split('-').map(Number).reduce((a,b)=>a+b,0),m1.score.split('-').map(Number).reduce((a,b)=>a+b,0)+1);
 assert.equal(advanceSeason(after).lastSeason.clutchMoment.timingGrade,'Excelente');
});
