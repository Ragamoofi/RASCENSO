import test from 'node:test';
import assert from 'node:assert/strict';
import {nationalSelectionEligibility} from '../src/competitions13.mjs';
const state={country:'CL',clubId:'cl-1',age:25,ovr:90,reputation:80,history:[{matches:30,nationalCaps:3},{matches:30,nationalCaps:3}],attributes:{},seed:'national40'};
const league={matches:30,minutes:2400,goals:20,assists:5,role:'Titular',playerMatches:Array(30).fill({})};
test('la convocatoria utiliza la división actual tras un descenso o ascenso',()=>{
 assert.equal(nationalSelectionEligibility(state,{...league,division:2},'world-cup').eligible,false);
 assert.equal(nationalSelectionEligibility({...state,clubId:'cl-21'},{...league,division:1},'world-cup').eligible,true);
});
test('la titularidad, el rendimiento y los minutos pesan en la evaluación',()=>{
 const low=nationalSelectionEligibility({...state,history:[{matches:30,rating:6,nationalCaps:2}]},{...league,role:'Reserva'},'normal');
 const high=nationalSelectionEligibility({...state,history:[{matches:30,rating:7.5,nationalCaps:12}]},league,'normal');
 assert.ok(high.score>low.score);
 assert.equal(nationalSelectionEligibility({...state,ovr:70},{...league,minutes:100},'normal').eligible,false);
 assert.equal(nationalSelectionEligibility({...state,age:18,ovr:90},{...league,minutes:100},'world-cup').eligible,false);
});
