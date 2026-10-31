import test from 'node:test';
import assert from 'node:assert/strict';
import {trophyEntries,trophyIdentity,trophyRail,trophyDetail,trophyRetirementGrid} from '../src/trophy45.mjs';

const club=id=>({name:id==='cl-1'?'Colo-Colo':id==='en-1'?'Arsenal':'Otro club',countryCode:id?.slice(0,2)?.toUpperCase()||'CL'});
const rec=(title,year,clubId='cl-1',kind='league',extra={})=>({title,year,clubId,kind,...extra});
test('4.5 · PNG real distintivo para grandes torneos y diseño propio para otros',()=>{
 const cases=[
  ['Copa Libertadores','real-libertadores'],['Copa Sudamericana','real-sudamericana'],
  ['Recopa Sudamericana','real-recopa'],['Copa América','real-copaamerica'],
  ['UEFA Champions League','real-champions'],['Copa Mundial de la FIFA','real-worldcup'],
  ['Copa Chile','real-copachile'],['Copa del Rey','real-copadelrey']
 ];
 for(const [title,key] of cases)assert.equal(trophyIdentity(rec(title,2029)).key,key,title);
 assert.equal(new Set(cases.map(([name])=>trophyIdentity(rec(name)).src)).size,cases.length);
 assert.equal(trophyIdentity(rec('Premier League',2028,'en-1','league',{leagueId:'EN1'})).key,'real-premier');
 assert.equal(trophyIdentity(rec('Brasileirão Série A',2028,'br-1','league',{leagueId:'BR1'})).key,'real-brasileirao');
 assert.equal(trophyIdentity(rec('Eredivisie',2028,'nl-1','league',{leagueId:'NL1'})).key,'real-eredivisie');
 assert.equal(trophyIdentity(rec('Liga de Primera',2028,'cl-1','league',{leagueId:'CL1'})).key,'league-cl1');
 assert.equal(trophyIdentity(rec('Copa Argentina',2028,'ar-1','national-cup',{competitionId:'CUP-AR'})).key,'cup-ar');
 assert.equal(trophyIdentity(rec('Mundial de Clubes',2028,'ar-1','club-world-cup')).key,'club-world');
 assert.equal(trophyIdentity(rec('UEFA Europa League',2028,'en-1','continental')).key,'continental-europa');
});
test('4.5 · títulos ordenados y nombres visibles sin recorte de la colección',()=>{
 const trophies=Array.from({length:23},(_,i)=>rec('Copa '+i,2026+i));
 const state={trophyRecords:trophies};
 assert.equal(trophyEntries(state)[0].year,2048);
 const html=trophyRail(state,club);
 assert.equal((html.match(/class="trophy-unit"/g)||[]).length,23);
 assert.match(html,/VITRINA DE TÍTULOS/);
 assert.match(html,/Copa 22/);
 assert.match(html,/2048/);
 assert.match(html,/data-action="trophy-detail"/);
 assert.match(html,/Colo-Colo/);
});
test('4.5 · ficha táctil muestra nombre, año, club y atribución',()=>{
 const html=trophyDetail(rec('Copa Chile',2035),club);
 assert.match(html,/Copa Chile/);
 assert.match(html,/2035/);
 assert.match(html,/Colo-Colo/);
 assert.match(html,/MEDIA_CREDITS.html/);
 assert.match(html,/data-action="trophy-close"/);
});
test('4.5 · nombre malicioso no inyecta HTML y los títulos históricos no se pierden',()=>{
 const user='<img src=x onerror=alert(1)>';
 const state={trophyRecords:[rec(user,2028)]};
 const rail=trophyRail(state,club),detail=trophyDetail(state.trophyRecords[0],club);
 assert.doesNotMatch(rail,/<img src=x onerror=alert/);
 assert.match(rail,/&lt;img/);
 assert.doesNotMatch(detail,/<img src=x onerror=alert/);
 assert.deepEqual(trophyEntries({history:[{year:2027,clubId:'cl-1',titles:['Liga de Primera']}]}).map(x=>x.title),['Liga de Primera']);
});
test('4.5 · sala final conserva agrupación con años, clubs e imagen',()=>{
 const groups=[{...rec('Copa Libertadores',2032),count:2,years:[2032,2029],entries:[rec('Copa Libertadores',2032),rec('Copa Libertadores',2029,'en-1')]}];
 const html=trophyRetirementGrid(groups,club);
 assert.match(html,/Trofeo de Copa Libertadores/);
 assert.match(html,/Copa Libertadores/);
 assert.match(html,/2 títulos/);
 assert.match(html,/Colo-Colo/);
 assert.match(html,/Arsenal/);
});
