import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seasonMilestones4110,contextVariation4110,traitSignals4110,seasonTraitSignals4110} from '../src/spotlight4110.mjs';
import {playerStats,buildSeasonPlays} from '../src/plays30.mjs';
import {newCareer,acceptDraft,signAcademy,academyOffers,autoResolveEvent,advanceSeason,simulateToRetirement} from '../src/engine.mjs';
import {choiceFx} from '../src/identity30.mjs';
import {identitySeasonEffects} from '../src/career08.mjs';
import {chooseScene,STORY_IDS} from '../src/story.mjs';
const base=(year=2026)=>({year,club:'Deportes Iquique',clubId:'cl-17',matches:18,goals:1,assists:1,nationalCaps:1,titles:['Liga de Primera']});

test('los cinco hitos se disparan con estadísticas reales, sin duplicarse',()=>{
 const state={history:[],milestones4110:[],startYear:2026};
 const first=seasonMilestones4110(state,base());
 assert.deepEqual(first.map(m=>m.id),['debut','first_goal','first_assist','first_cap','first_title']);
 assert.equal(first[0].year,2026);
 assert.equal(seasonMilestones4110({...state,history:[base()],milestones4110:first},base(2027)).length,0);
});
test('una temporada sin minutos ni títulos no genera celebraciones falsas',()=>{
 const s={history:[],milestones4110:[]};
 assert.deepEqual(seasonMilestones4110(s,{...base(),matches:0,goals:0,assists:0,nationalCaps:0,titles:[]}),[]);
});
test('un primer gol tardío se celebra aunque el debut ya ocurrió',()=>{
 const older={...base(2026),goals:0,nationalCaps:0,assists:0,titles:[]};
 const a=seasonMilestones4110({history:[older],milestones4110:[]},{...base(2027),goals:3,nationalCaps:0,assists:0,titles:[]});
 assert.deepEqual(a.map(x=>x.id),['first_goal']);
});
test('variantes se basan en clásico, debut, marcador y jornada final; son deterministas',()=>{
 const s={history:[]};
 const p={id:'2026:1:penal',seed:'s2026',type:'penal',before:{gf:0,ga:1},minute:88};
 const debut=contextVariation4110(s,p);
 assert.equal(debut.kind,'debut');assert.deepEqual(debut,contextVariation4110(s,p));
 assert.equal(contextVariation4110(s,{...p,classic:true}).kind,'classic');
 assert.equal(contextVariation4110(s,{...p,isFinal:true}).kind,'cup_final');
 assert.equal(contextVariation4110(s,{...p,lastRound:true}).kind,'last_round');
 assert.equal(contextVariation4110({history:[{}]},p).kind,'last_minute');
 assert.equal(contextVariation4110({history:[{}]}, {...p,minute:65}).kind,'comeback');
});
test('cada aparición de un tipo rota su variante en lugar de copiar la anterior',()=>{
 const p={type:'penal',seed:'x',minute:65,before:{gf:0,ga:0}};
 const types=[];
 for(let i=0;i<4;i++)types.push(contextVariation4110({history:[{plays:Array.from({length:i},()=>({type:'penal'}))}]},p).flavour);
 assert.equal(new Set(types).size,4);
});
test('Sangre fría informa la serenidad REAL, no un bono inventado',()=>{
 const s={personality:'sereno',developmentPath:'mental',attributes:{shot:67,skills:3},morale:70,reputation:5};
 const p={type:'penal',pressure:88,fatigue:.3};
 const signals=traitSignals4110(s,p,playerStats);
 assert.ok(signals.some(x=>x.title==='Sangre fría'&&/serenidad/.test(x.text)),JSON.stringify(signals));
 assert.ok(signals.every(x=>/aporta \+/.test(x.text)));
});
test('sin rasgos explícitos no aparecen alertas fabricadas',()=>{
 const p={type:'penal',pressure:75};
 assert.deepEqual(traitSignals4110({attributes:{shot:50},morale:70},p,playerStats),[]);
});
test('Recuperación muestra el multiplicador real sin prometer evitar lesión',()=>{
 const x=seasonTraitSignals4110({developmentPath:'recuperacion'},base(),choiceFx,identitySeasonEffects);
 assert.ok(x.some(r=>r.id==='recovery'&&r.text.includes('20 %')&&r.text.includes('no garantiza')));
});
test('motor anual guarda los hitos y la memoria narrativa sin borrar partidas',()=>{
 let s=newCareer({name:'Hito',country:'CL',position:'DC',seed:'spotlight-first'});
 assert.deepEqual(s.milestones4110,[]);assert.deepEqual(s.sceneSeen4110,{});
 while(s.phase==='draft')s=acceptDraft(s,0);
 s=signAcademy(s,academyOffers(s)[0].id);
 while(s.phase==='event')s=autoResolveEvent(s);
 assert.equal(s.phase,'season');
 const result=advanceSeason(s);
 assert.ok(result.history.length===1);
 assert.ok(result.milestones4110.some(m=>m.id==='debut'),JSON.stringify(result.milestones4110));
});
test('las escenas clásicas priorizan una no vista cuando quedan opciones',()=>{
 const s=newCareer({name:'Escenas',country:'CL',position:'DC',seed:'avoid-repeat'});
 const p={...s,clubId:'cl-1',phase:'season',storyLog:[{id:'coach',year:2026}],sceneSeen4110:{coach:{year:2026,count:1}}};
 const result=chooseScene(p,()=>.4);
 assert.ok(STORY_IDS.includes(result));assert.notEqual(result,'coach');
});
test('HTML carga módulos de versión 511 y UI incluye tarjeta de hitos',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const ui=readFileSync(new URL('../src/spotlight-ui4110.mjs',import.meta.url),'utf8');
 assert.match(html,/spotlight-ui4110\.mjs\?v=511/);assert.match(html,/spotlight4110\.css\?v=511/);
 assert.match(html,/"\.\/src\/engine\.mjs":"\.\/src\/engine\.mjs\?v=\d+"/);
 assert.match(ui,/recapPending|focus-card\.story\.recap/);
 assert.match(ui,/spotlight4110-dialog/);assert.match(ui,/spotlight4110-history/);
});

// Regression: metric sign already converts fractions into percentage points.
test('un rasgo de +4 % informa 4 puntos porcentuales, sin multiplicar dos veces',()=>{
 const stats=s=>({composure:s.environment ? .04 : 0});
 const rows=traitSignals4110({environment:'sin_contactos'},{type:'cabezazo'},stats);
 assert.match(rows[0].text,/\+4 puntos porcentuales/);
 assert.doesNotMatch(rows[0].text,/400/);
});
