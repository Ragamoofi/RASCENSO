import test from 'node:test';
import assert from 'node:assert/strict';
import {socialEffects} from '../src/career20.mjs';
import {applyWorldEffects,worldSceneCandidates} from '../src/story20.mjs';
import {newCareer,acceptDraft,academyOffers,signAcademy,autoResolveEvent} from '../src/engine.mjs';
function career(){let s=newCareer({name:'Prueba',country:'CL',seed:'bond40'});while(s.phase==='draft')s=acceptDraft(s);return autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));}
test('la amistad con un competidor aporta moral mientras pertenezca al club',()=>{
 const s=career(),friends=applyWorldEffects(s,{rivalBond:true});assert.equal(socialEffects(friends).morale,socialEffects(s).morale+1);
 const distant=applyWorldEffects(friends,{rivalDistance:true});assert.equal(socialEffects(distant).morale,socialEffects(s).morale);
 assert.equal(socialEffects({...friends,clubId:'es-1'}).morale,socialEffects(s).morale);
});
test('la escena de amistad aparece con historia y no se repite',()=>{
 const s=career(),friends=applyWorldEffects(s,{rivalBond:true}),ready={...friends,lastSeason:{matches:20},storyLog:[]};
 assert.ok(worldSceneCandidates(ready).some(c=>c.id==='w_friend_competition'));
 assert.ok(!worldSceneCandidates({...ready,storyLog:[{id:'w_friend_competition'}]}).some(c=>c.id==='w_friend_competition'));
});
