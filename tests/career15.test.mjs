import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason,seasonMoment,playCareerMoment,migrateCareer,simulateToRetirement, getClub} from '../src/engine.mjs';
import {marketValueEUR,careerAchievements,careerHeadline,fixtureContext,contractSnapshot} from '../src/career15.mjs';
import {playLeague} from '../src/league.mjs';
function start(seed='clutch15',position='DC'){
 let s=newCareer({name:'Jugador de prueba',seed,position,country:'CL'});
 while(s.phase==='draft')s=acceptDraft(s,0);
 s=signAcademy(s,academyOffers(s)[0].id);
 return autoResolveEvent(s);
}
test('valor de mercado responde a media, edad, rendimiento y club',()=>{
 const s=start('value15'),club=getClub(s.clubId);
 const base=marketValueEUR(s,club);
 assert.ok(base>0);
 assert.ok(marketValueEUR({...s,ovr:s.ovr+9},club)>base);
 assert.ok(marketValueEUR({...s,age:43},club)<base);
 const contract=contractSnapshot(s);
 assert.equal(contract.monthly,Math.round(contract.annual/12));
 assert.ok(contract.remaining>=0);
});
test('cada puesto tiene una jugada en partido de la simulación y se resuelve una sola vez',()=>{
 for(const [pos,kind] of [['DC','penal'],['MC','pase'],['POR','atajada'],['DFC','corte'],['EI','libre']]){
  const s=start('actions-'+pos,pos);
  const moment=seasonMoment(s);
  assert.ok(moment,`Sin jugada para ${pos}`);assert.equal(moment.type,kind);
  const base=playLeague(s);
  assert.ok(base.playerMatches.some(m=>m.home===moment.home&&m.away===moment.away&&m.round===moment.round&&m.played));
  const decided=playCareerMoment(s,1);
  assert.equal(decided.clutchMoment.zone,1);
  assert.strictEqual(playCareerMoment(decided,2),decided);
  const season=advanceSeason(decided);
  assert.equal(season.clutchMoment,null);
  assert.equal(season.lastSeason.clutchMoment.zone,1);
  assert.equal(season.lastSeason.clutchMoment.type,kind);
 }
});
test('un éxito ofensivo modifica el marcador real y una asistencia se refleja en estadísticas',()=>{
 let ok=null,prev;
 for(let n=0;n<60;n++){
  const s=start('pass-'+n,'MC'),m=seasonMoment(s);if(!m)continue;
  for(let zone=0;zone<3;zone++){const next=playCareerMoment(s,zone);if(next.clutchMoment.success){ok=next;prev=s;break;}}
  if(ok)break;
 }
 assert.ok(ok,'Debe existir una jugada ganable');
 const a=playLeague(prev),b=playLeague(ok);
 const m=ok.clutchMoment;
 const find=r=>r.playerMatches.find(x=>x.home===m.home&&x.away===m.away&&x.round===m.round);
 assert.equal(find(b).assists,find(a).assists+1);
 const score=([x,y])=>[x,y].map(Number);
 const aa=score(find(a).score.split('-')),bb=score(find(b).score.split('-'));
 assert.equal(bb[0]+bb[1],aa[0]+aa[1]+1);
});
test('no hay retiro impuesto a los 40 y el final ocurre por continuidad contractual',()=>{
 const s=start('age15');const veteran={...s,age:40,ovr:64,contract:{clubId:s.clubId,ends:2056,salary:150000,currency:'EUR'}};
 const played=advanceSeason(veteran);
 assert.equal(played.phase,'event');assert.equal(played.age,41);assert.equal(played.lastSeason.age,40);
 const retired=simulateToRetirement(start('longrun15'));
 assert.equal(retired.phase,'retired');assert.ok(retired.age>40);
 assert.ok(careerHeadline(retired).length>5);
 const record=careerAchievements(retired);assert.equal(record.matches,retired.history.reduce((n,x)=>n+x.matches,0));
 assert.equal(record.seasons,retired.history.length);
 assert.ok(record.clubs.length>=1);
 assert.deepEqual(migrateCareer({...retired,version:7}).history,retired.history);
});
test('un clásico real se reconoce por los clubes, no por una etiqueta aleatoria',()=>{
 const s={clubId:'cl-1'};
 const club=id=>({name:{'cl-1':'Colo-Colo','cl-2':'Universidad de Chile','cl-3':'Cobresal'}[id]});
 assert.equal(fixtureContext(s,{home:'cl-1',away:'cl-2',round:12,score:'2-1'},club).classic,true);
 assert.equal(fixtureContext(s,{home:'cl-1',away:'cl-3',round:12,score:'2-1'},club).classic,false);
});
