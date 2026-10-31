import test from 'node:test';
import assert from 'node:assert/strict';
import {feintImpact,FIELD_SCENES} from '../src/scenes-field.mjs';
import {aiStats,playerStats} from '../src/plays30.mjs';
test('un amague cercano y hábil supera más resistencia que uno lejano',()=>{
 assert.ok(feintImpact(1,.8,.5)>feintImpact(2.8,.8,.5));assert.ok(feintImpact(1,.8,.5)>feintImpact(1,.4,.5));assert.ok(feintImpact(1,.8,.2)>feintImpact(1,.8,.8));
});
test('el amague cambia de lado según el teclado y puede engañar al rival',()=>{
 const play={difficulty:.5,pressure:40,fatigue:0};const stats=playerStats({attributes:{pace:80,shot:75,pass:70,dribble:85,defense:50,physical:70,skills:4,weak:3}},play);
 const m={play,stats,ai:aiStats(play),rand:()=>.5,t:1,pointer:{wx:40,wy:5,inside:false},keys:new Set(['KeyS']),say(){}};const scene=FIELD_SCENES.diagonal;scene.init(m);m.fb.x=m.me.x+1.2;m.fb.y=m.me.y;const y=m.me.y;scene.key(m,'Space',true);assert.ok(m.me.y>y);assert.ok(m.fb.stun>0);
});
