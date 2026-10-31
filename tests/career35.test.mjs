import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent,advanceSeason,careerYear} from '../src/engine.mjs';
import {applyWorldEffects} from '../src/story20.mjs';
import {buildTransferOffers,marketClub} from '../src/market.mjs';
const start=()=>{let s=newCareer({name:'Prueba',country:'CL',seed:'salary-season'});while(s.phase==='draft')s=acceptDraft(s);return autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));};
test('una rebaja temporal afecta solo la temporada acordada y conserva el sueldo contractual',()=>{
 const s=start(),salary=s.contract.salary;const cut=applyWorldEffects(s,{salaryCut:.25});
 assert.equal(cut.contract.salary,salary);assert.equal(cut.contract.temporaryCut.year,careerYear(s));
 const next=advanceSeason(cut);assert.equal(next.lastSeason.salaryEarned,Math.round(salary*.75));assert.equal(next.contract.salary,salary);
 const following=advanceSeason({...next,phase:'season'});assert.equal(following.lastSeason.salaryEarned,salary);
 assert.equal(s.contract.temporaryCut,undefined);
});
test('intereses vencidos y el club actual nunca generan ofertas destacadas falsas',()=>{
 const s={...start(),age:24,ovr:89,reputation:70,history:[{matches:34,goals:25,assists:10}],lastSeason:{matches:34,goals:25,assists:10}};
 const current={...s,threads:[{kind:'big_club_interest',until:careerYear(s)+1,data:{clubId:s.clubId}}]};
 assert.ok(buildTransferOffers(current).every(o=>o.id!==s.clubId));
 const club=marketClub('es-1');assert.ok(club);const expired={...s,threads:[{kind:'big_club_interest',until:careerYear(s)-1,data:{clubId:club.id}}]};
 assert.ok(buildTransferOffers(expired).every(o=>!o.highlight));
});

test('el duelo público compara goles y asistencias con el mismo criterio',async()=>{
 const {compareChallenge}=await import('../src/career20.mjs');
 assert.deepEqual(compareChallenge({goals:4,assists:3},{goals:3,assists:4}),{us:7,them:7,outcome:'empatado'});
 assert.equal(compareChallenge({goals:5,assists:3},{goals:3,assists:4}).outcome,'ganado');
 assert.equal(compareChallenge({goals:2,assists:1},{goals:3,assists:4}).outcome,'perdido');
 assert.equal(compareChallenge({goals:20,assists:1},null),null);
});

test('la ficha muestra el descuento vigente y recupera el salario al año siguiente',async()=>{
 const {contractSnapshot}=await import('../src/career15.mjs');const s=start(),cut=applyWorldEffects(s,{salaryCut:.1});
 assert.equal(contractSnapshot(cut).annual,Math.round(s.contract.salary*.9));assert.equal(contractSnapshot(cut).cutRate,.1);
 assert.equal(contractSnapshot({...cut,age:cut.age+1}).annual,s.contract.salary);
});
test('un penal fuera se comunica como fuera, no como atajada del arquero',async()=>{
 const {GOAL_SCENES}=await import('../src/scenes-goal.mjs');const scene=GOAL_SCENES.penal_atajado;
 const m={ai:{d:.5,shooterSkill:.7},stats:{reflex:.7},pointer:{x:480,y:300},t:0,rand:()=>.5,finish(success,detail){this.result={success,detail};}};
 scene.init(m);m.target=[5,1];m.t=m.kickT;scene.update(m,.01);scene.update(m,1);
 assert.deepEqual(m.result,{success:true,detail:'fuera'});
});
