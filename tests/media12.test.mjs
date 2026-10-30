import test from 'node:test';import assert from 'node:assert/strict';
import {DRAFT_REFERENTS} from '../src/draft09.mjs';
import {legendPhoto} from '../src/legend-art.mjs';
import {outletFor,pressHeadline} from '../src/media12.mjs';
import {competitionLogo,OFFICIAL_COMPETITIONS,trophyImage,WORLD_TROPHIES} from '../src/competition12.mjs';
import {newCareer} from '../src/engine.mjs';
import {sceneFor} from '../src/story.mjs';
test('78 referentes con ruta única de PNG sin repetir jugador',()=>{
 assert.equal(DRAFT_REFERENTS.length,78);const files=DRAFT_REFERENTS.map(x=>legendPhoto(x.name));
 assert.equal(new Set(files).size,files.length);for(const file of files)assert.match(file,/^\.\/assets\/portraits\/[a-z0-9-]+\.png$/);
});
test('medios existentes por región y cobertura claramente ficticia',()=>{
 const options=[outletFor({seed:'test',clubId:'cl-1',country:'CL'},'prensa'),outletFor({seed:'test',clubId:'es-1',country:'ES'},'prensa')];
 assert.ok(options[0].name!==options[1].name);
 assert.match(options[0].notice,/ficticia/i);
 assert.ok(pressHeadline({seed:'test',lastSeason:{year:2026,goals:18,assists:4},clubName:'Universidad de Chile'},options[0]).length>15);
});
test('logos de 13 ligas y trofeos de 6 competiciones con rutas PNG',()=>{
 assert.equal(Object.keys(OFFICIAL_COMPETITIONS).length,13);
 assert.equal(WORLD_TROPHIES.length,6);
 for(const id of Object.keys(OFFICIAL_COMPETITIONS))assert.equal(competitionLogo(id),`./assets/competitions/${id}.png`);
 for(const trophy of WORLD_TROPHIES)assert.match(trophyImage({title:trophy.name}),/\.png$/);
});
test('prensa integra medio regional al speaker sin atribuir notas reales',()=>{
 const s=newCareer({seed:'press-12',name:'Pepito',country:'CL',position:'DC'});
 const news=sceneFor({...s,pendingEvent:'press'});
 assert.match(news.speaker.role,/SIMULADA/);
 assert.ok(news.speaker.name.length>3);
});
