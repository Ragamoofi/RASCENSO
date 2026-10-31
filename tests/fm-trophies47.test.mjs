import test from 'node:test';
import assert from 'node:assert/strict';
import {fmTrophyId,fmTrophySrc,FM_COMPETITION_IDS,FM_UNIQUE_NAMES} from '../src/fm-trophy-catalog.mjs';
import {trophyIdentity,trophyImgTag} from '../src/trophy45.mjs';
test('4.7 · 48 equivalencias directas de ligas, copas y selecciones',()=>{
 assert.equal(Object.keys(FM_COMPETITION_IDS).length,36);
 const pairs=[
  [{title:'Liga de Primera',leagueId:'CL1',kind:'league'},'5250792'],
  [{title:'Copa Libertadores',competitionId:'CONT-CONMEBOL-1',kind:'continental'},'102415'],
  [{title:'UEFA Champions League',competitionId:'CONT-UEFA-1',kind:'continental'},'1301394'],
  [{title:'FIFA World Cup',competitionId:'WORLD-CUP',kind:'world-cup'},'1301385'],
  [{title:'Copa Africana de Naciones',competitionId:'NAT-CAF',kind:'international'},'1301390'],
  [{title:'Copa Argentina',competitionId:'CUP-AR',kind:'national-cup'},'14043892'],
  [{title:'Copa de Europa',competitionId:'CONT-UEFA-2',kind:'continental'},'1301396'],
 ];
 for(const [record,id] of pairs){assert.equal(fmTrophyId(record),id);assert.equal(fmTrophySrc(record),'./assets/trophies/fm/'+id+'.png');}
});
test('4.7 · títulos únicos se buscan por nombre normalizado sin crear coincidencias falsas',()=>{
 assert.equal(fmTrophyId({title:'UEFA Europa League'}),'1301396');
 assert.equal(fmTrophyId({title:'Copa América'}),'1301389');
 assert.equal(fmTrophyId({title:'Primera División de Chile'}),'5250792');
 assert.equal(fmTrophyId({title:'Trofeo totalmente inventado'}),null);
 assert.ok(Object.keys(FM_UNIQUE_NAMES).length>=850);
});
test('4.7 · fallback para Copa Chile y competiciones sin foto en el ZIP',()=>{
 const unknown=trophyIdentity({title:'Copa Chile',competitionId:'CUP-CL',kind:'national-cup'});
 assert.equal(unknown.src,'./assets/trophies/real-copachile.png');
 assert.equal(unknown.source,'rascenso-original');
 const known=trophyIdentity({title:'Copa Libertadores',kind:'continental'});
 assert.equal(known.src,'./assets/trophies/fm/102415.png');
 assert.equal(known.fallback,'./assets/trophies/real-libertadores.png');
 assert.equal(known.source,'fm-pack');
 assert.match(trophyImgTag({title:'Copa Libertadores'}),/assets\/trophies\/fm\/102415.png/);
});
