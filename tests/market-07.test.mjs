import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,openAgentMarket,askAgentForMore,chooseTransfer,advanceSeason,finishEvent,retireFromMarket,migrateCareer,careerYear} from '../src/engine.mjs';
import {clubPrestige,annualSalary,playerDemand,buildTransferOffers,evaluateClubFuture,marketClub} from '../src/market.mjs';
const start=(seed='seven')=>{let s=newCareer({name:'Delantero',country:'CL',seed});while(s.phase==='draft')s=acceptDraft(s);return autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));};
const high=(seed='ficha89')=>({...start(seed),age:24,ovr:89,reputation:65,history:[{matches:34,goals:23,assists:13,leaguePosition:2}],lastSeason:{matches:34,goals:23,assists:13,leaguePosition:2}});
test('A los 89 de OVR + 23 goles no se ofrecen clubes de nivel institucional bajo',()=>{
 const s=high();const offers=buildTransferOffers(s);
 assert.ok(playerDemand(s)>=86);assert.equal(offers.length,3);
 assert.ok(offers.every(o=>o.prestige>=79),JSON.stringify(offers));
 assert.ok(offers.every(o=>o.salary>=200000));
});
test('Prestigio internacional se calcula separado del nivel semilla antiguo',()=>{
 assert.ok(clubPrestige(marketClub('es-1'))>=90);
 assert.ok(clubPrestige(marketClub('cl-1'))<clubPrestige(marketClub('es-1')));
});
test('Salario por club y liga expresado en EUR anual y diferencia económica',()=>{
 assert.ok(annualSalary(marketClub('es-1'),89)>annualSalary(marketClub('cl-1'),89)*10);
 assert.ok(annualSalary(marketClub('en-1'),89)>1000000);
 const s=start('salary07');assert.equal(s.contract.currency,'EUR');assert(s.contract.salary>=9000);
 const advanced=advanceSeason(s);assert.equal(advanced.careerEarnings,s.contract.salary);
 assert.equal(advanced.lastSeason.salaryEarned,s.contract.salary);
});
test('Representante abre mercado voluntario y puede pedir otras propuestas dos veces',()=>{
 const s=high('agent07');const a=openAgentMarket(s);
 assert.equal(a.phase,'transfer');assert.equal(a.market.reason,'agent');
 assert.ok(a.offers.length>0);assert.ok(a.agent.searches>=1);
 const b=askAgentForMore(a,'international');assert.equal(b.market.searches,1);
 const c=askAgentForMore(b,'money');assert.equal(c.market.searches,2);
 assert.deepEqual(askAgentForMore(c),c);
 assert.equal(chooseTransfer(c).phase,'season');
});
test('No renovación / club obliga a salir: no se puede permanecer',()=>{
 let s=high('forcing');s={...s,phase:'transfer',market:{canStay:false,reason:'released',searches:0},offers:buildTransferOffers(s,{forced:true})};
 assert.strictEqual(chooseTransfer(s),s);
 const incoming=chooseTransfer(s,s.offers[0].id);
 assert.equal(incoming.clubId,s.offers[0].id);assert.equal(incoming.contract.currency,'EUR');
});
test('La cesión guarda el contrato de origen y permite regreso al club',()=>{
 let s=high('loan07');const other=marketClub('ar-1');
 s={...s,phase:'transfer',market:{canStay:false,reason:'loan-request',searches:0},offers:[{...other,kind:'loan',years:1,salary:annualSalary(other,89,'Cesión')}]} ;
 const loan=chooseTransfer(s,other.id);
 assert.equal(loan.contract.kind,'loan');assert.equal(loan.contract.parentClubId,s.clubId);
 assert.equal(loan.contract.ends,careerYear(s)+1);
});
test('Partidas antiguas se conservan y contratos antiguos se recalibran sin alterar historia',()=>{
 const old={...high('legacy07'),version:5,contract:{clubId:'cl-1',ends:2040,salary:2000},clubId:'cl-1'};
 const migrated=migrateCareer(old);
 assert.equal(migrated.version,6);assert.equal(migrated.contract.currency,'EUR');
 assert.ok(migrated.contract.salary>10000);assert.equal(migrated.history.length,old.history.length);
});

test('Al recuperar una carrera anterior de 89 OVR se reemplazan ofertas antiguas sin tocar historial',()=>{
 const old={...high('saved89'),version:5,phase:'transfer',offers:[{id:'bo-1',name:'Bolívar',level:73,salary:2500}]};
 const fresh=migrateCareer(old);
 assert.equal(fresh.phase,'transfer');assert.ok(fresh.offers.length);
 assert.ok(fresh.offers.every(o=>o.prestige>=79));
 assert.equal(fresh.history.length,old.history.length);assert.equal(fresh.ovr,89);
});
