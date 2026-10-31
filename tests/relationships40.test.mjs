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
test('la última temporada influye en el rol solo si fue en el mismo club',async()=>{
 const {squadRole}=await import('../src/career20.mjs');const s=career();const rival={...s.squad.rival,ovr:70};const base={...s,ovr:70,coachTrust:50,morale:70,squad:{...s.squad,clubId:s.clubId,rival}};
 const good={...base,lastSeason:{clubId:s.clubId,matches:20,rating:7.5}},bad={...base,lastSeason:{clubId:s.clubId,matches:20,rating:5.9}};
 assert.equal(squadRole(good,70,null),'Titular');assert.equal(squadRole(bad,70,null),'Rotación');
 assert.equal(squadRole({...good,lastSeason:{...good.lastSeason,clubId:'es-1'}},70,null),squadRole(base,70,null));
});
