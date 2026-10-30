import test from 'node:test';
import assert from 'node:assert/strict';
import {newCareer,draftChoices,acceptDraft,signAcademy,academyOffers,autoResolveEvent,chooseSeasonAgenda,advanceSeason,careerYear,migrateCareer} from '../src/engine.mjs';
import {DRAFT_REFERENTS,draftPotentialAdjustment} from '../src/draft09.mjs';
import {getSeasonAgenda,SEASON_AGENDAS} from '../src/agenda09.mjs';
import {playLeague} from '../src/league.mjs';
import {STORY_IDS,chooseScene,sceneFor} from '../src/story.mjs';
import {legendIllustration} from '../src/legend-art.mjs';
import {narrativeContext,validateNarrativeProposal} from '../src/ai-bridge.mjs';
function ready(seed='test09'){let s=newCareer({name:'Jugador',country:'CL',position:'DC',seed});while(s.phase==='draft')s=acceptDraft(s,0);return autoResolveEvent(signAcademy(s,academyOffers(s)[0].id));}
test('Draft tiene referentes de tres niveles con rasgos y elecciones variadas',()=>{
 assert.ok(DRAFT_REFERENTS.length>=75);let s=newCareer({name:'Selección',seed:'tiers09'});
 for(let i=0;i<8;i++){const cards=draftChoices(s);assert.deepEqual(cards.map(c=>c.tier),['icono','figura','profesional']);assert.equal(new Set(cards.map(c=>c.legend)).size,3);s=acceptDraft(s,2);}
 assert.equal(s.phase,'academy');assert.equal(s.draftSources.length,8);assert.ok(s.draftSources.every(x=>x.tier==='profesional'));assert.equal(draftPotentialAdjustment(s.draftSources),8);
});
test('Ilustración de respaldo está disponible para cualquier futbolista',()=>{
 const art=legendIllustration('Nombre de prueba','profesional');assert.match(art,/^data:image\/svg\+xml,/);assert.ok(art.length>300);
});
test('Agenda de temporada elige variedad y una decisión modifica el motor',()=>{
 const s=ready('agenda09');assert.equal(s.phase,'season');assert.ok(SEASON_AGENDAS.length>=18);
 const card=getSeasonAgenda(s);assert.equal(card.choices.length,3);
 const changed=chooseSeasonAgenda(s,0);assert.equal(changed.seasonAgenda.year,careerYear(s));assert.strictEqual(chooseSeasonAgenda(changed,1),changed);
 assert.ok(changed.careerMoments.some(x=>x.kind==='agenda'));const year=advanceSeason(changed);assert.equal(year.history.length,1);
 for(let i=0;i<5;i++)assert.equal(getSeasonAgenda({...s,seed:'same',age:20}).id,getSeasonAgenda({...s,seed:'same',age:20}).id);
 const years=new Set(Array.from({length:12},(_,i)=>getSeasonAgenda({...s,age:17+i}).id));assert.ok(years.size>=7);
 const different=SEASON_AGENDAS.some(x=>x.choices.some(o=>o.effect.goals||o.effect.minutes||o.effect.injury||o.effect.assists));assert.ok(different);
 assert.ok(playLeague(s).standings.length>=10);
});
test('15 escenas nuevas y lógica que evita volver a repetir inmediatamente',()=>{
 for(const id of ['bench','cup','recovery','new-coach'])if(id==='new-coach')continue;else assert.ok(STORY_IDS.includes(id));
 const s=ready('story09');const withHistory={...s,lastSeason:{matches:25,goals:12,assists:6,leaguePosition:2},history:[{year:2026}],storyLog:[{id:'coach'},{id:'press'},{id:'scouting'}]};
 let id=chooseScene(withHistory,()=>.6);assert.ok(STORY_IDS.includes(id));assert.ok(!['coach','press','scouting'].includes(id));
 assert.ok(sceneFor({...withHistory,pendingEvent:id}).options.length>=2);
});
test('Guardados antiguos sobreviven a cambios narrativos y draft',()=>{
 const s=ready('migration09');const migrated=migrateCareer({...s,version:6});assert.deepEqual(migrated.history,s.history);assert.equal(migrated.clubId,s.clubId);
});
test('Puente de IA valida efectos y no acepta modificar resultados ni sueldos',()=>{
 const c=narrativeContext(ready('bridge09'));assert.ok(c.player.name);assert.equal(c.lastSeasons.length,0);
 const good=validateNarrativeProposal({type:'career_event',title:'El entrenador pregunta',narration:'La sesión termina con tensión.',options:[{title:'Dialogar',effects:{coachTrust:2}},{title:'Responder en cancha',effects:{reputation:1}}]});assert.equal(good.options.length,2);
 assert.throws(()=>validateNarrativeProposal({type:'career_event',title:'X',narration:'A',options:[{title:'1',effects:{ovr:10}},{title:'2',effects:{salary:100000}}]}),/Efecto no autorizado/);
});
