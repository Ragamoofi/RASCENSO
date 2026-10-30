import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,acceptDraft,signAcademy,academyOffers,autoResolveEvent,advanceSeason,getClub} from '../src/engine.mjs';
import {STORY_11} from '../src/story11.mjs';
import {STORY_IDS,chooseScene,sceneFor,storyDetail,resultOfScene} from '../src/story.mjs';
import {seasonReview} from '../src/career10.mjs';
const ready=(seed='narr11')=>{let s=newCareer({name:'Referente',country:'CL',position:'DC',seed});while(s.phase==='draft')s=acceptDraft(s,0);return autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));};
const fakeLast=(s,patch={})=>({...s,lastSeason:{year:2028,club:'Universidad de Chile',leagueName:'Liga de Primera',matches:27,goals:15,assists:8,leaguePosition:3,injuryWeeks:0,ovrBefore:76,ovrAfter:80,table:[],playerMatches:[],titles:[],...patch},history:[{year:2027},{year:2028}]});
test('Banco 1.1 presenta más de 20 conflictos únicos y tres respuestas válidas por conflicto',()=>{
 const entries=Object.entries(STORY_11);assert.ok(entries.length>=22);assert.equal(new Set(entries.map(([id])=>id)).size,entries.length);
 for(const [id,def] of entries){assert.ok(STORY_IDS.includes(id));const s=fakeLast(ready(id));const scene=sceneFor({...s,pendingEvent:id});assert.ok(scene.title?.length>10,id);assert.equal(scene.options.length,3,id);assert.ok(scene.options.every(o=>o.title&&o.detail&&o.dialogue&&o.effect&&o.impact),id);}
});
test('Personajes y opciones respetan posiciones, lesiones, edad y aspiraciones',()=>{
 const s=fakeLast(ready('elig11'));
 assert.equal(STORY_11.goalkeeper_role.eligible({...s,position:'POR'}),true);
 assert.equal(STORY_11.goalkeeper_role.eligible({...s,position:'DC'}),false);
 assert.equal(STORY_11.injury_return.eligible(s),false);
 assert.equal(STORY_11.injury_return.eligible({...s,lastSeason:{...s.lastSeason,injuryWeeks:9}}),true);
 assert.equal(STORY_11.ageing.eligible({...s,age:34}),true);
 assert.equal(STORY_11.ageing.eligible({...s,age:23}),false);
 assert.equal(STORY_11.selection_dream.eligible({...s,dream:'seleccion'}),true);
});
test('La selección evita los últimos 12 acontecimientos y no repite id tras una sola escena',()=>{
 let s=fakeLast(ready('memory11'));const ids=STORY_IDS.filter(id=>!['arrival','family','fan_home','fan_departure'].includes(id)).slice(0,12);
 s={...s,storyLog:ids.map((id,i)=>({id,tag:STORY_11[id]?.tag||'VESTUARIO',year:2027,choice:'A',club:'Equipo'}))};
 for(let i=0;i<40;i++){const id=chooseScene(s,()=>i/40);assert.ok(!ids.includes(id),id);assert.ok(STORY_IDS.includes(id));}
});
test('Una situación conserva texto estable y produce efectos comprobables en el historial',()=>{
 const s=fakeLast(ready('storyeffect'));
 const input={...s,pendingEvent:'goal_bonus',phase:'event',sceneBeat:0};
 const scene=sceneFor(input);assert.equal(scene.title,sceneFor(input).title);assert.equal(storyDetail(input,'goal_bonus'),storyDetail(input,'goal_bonus'));
 const next=resultOfScene(input,scene,1);assert.ok(next.storyLog.at(-1).id==='goal_bonus');assert.ok(next.reputation>input.reputation);assert.equal(next.storyLog.at(-1).choice,scene.options[1].title);
});
test('Balance de temporada muestra comentarios alternativos coherentes con el rendimiento',()=>{
 const base=fakeLast(ready('recaps11'),{titles:[],leaguePosition:7,goals:3,assists:3});
 const voice=new Set(Array.from({length:20},(_,i)=>seasonReview({...base,seed:`recap-${i}`},getClub).voice.quote));
 assert.ok(voice.size>=3,`variedad observada ${voice.size}`);
 const champions=seasonReview(fakeLast(base,{titles:['Liga de Primera'],leaguePosition:1}),getClub);
 assert.match(champions.voice.quote,/título|copa|ganamos|campe|levant/i);
 assert.equal(champions.medal,true);
});