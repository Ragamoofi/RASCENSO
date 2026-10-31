import test from 'node:test';
import assert from 'node:assert/strict';
import {GOAL_SCENES} from '../src/scenes-goal.mjs';
test('el rematador puede elegir el lado libre antes de disparar sin seguir al arquero',()=>{
 const m={rand:()=>.1,ai:{shooterSkill:.9},k:{x:1},t:0};
 GOAL_SCENES.reflejos.next(m);const target=m.shot.target[0];assert.ok(target<0);m.k.x=-2;assert.equal(m.shot.target[0],target);
});
