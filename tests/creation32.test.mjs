import test from 'node:test';
import assert from 'node:assert/strict';
import {COUNTRIES} from '../src/countries.mjs';
import {newCareer,acceptDraft,draftChoices,chooseDraftFocus,academyOffers,migrateCareer,signAcademy,POSITIONS} from '../src/engine.mjs';
import {classAdjustedAttributes} from '../src/archetypes17.mjs';
import {creatorView,draftView} from '../src/creator30.mjs';
const finish=s=>{while(s.phase==='draft')s=acceptDraft(s);return s;};
test('3.2 · todos los países priorizan dos ofertas nacionales, únicas y estables',()=>{
 for(const c of COUNTRIES)for(let i=0;i<15;i++){
  const s=newCareer({name:'Prueba',country:c.code,seed:`local-${i}`,age:18});const o=academyOffers(s);
  assert.equal(o.length,3,c.code);assert.equal(new Set(o.map(c=>c.id)).size,3);
  assert.ok(o.filter(x=>x.countryCode===c.code).length>=2,c.code);
  assert.deepEqual(o,academyOffers(JSON.parse(JSON.stringify(s))));
 }
});
test('3.2 · emigrar depende de edad y perfil; no es una oferta obligatoria',()=>{
 const count=(age,riskProfile)=>Array.from({length:300},(_,i)=>academyOffers(newCareer({name:'P',country:'CL',seed:`rates-${i}`,age,riskProfile})).some(c=>c.countryCode!=='CL')).filter(Boolean).length;
 const minor=count(16,'calculador'),adult=count(19,'calculador'),home=count(19,'hogareno'),away=count(19,'aventurero');
 assert.ok(minor<adult);assert.ok(home<adult);assert.ok(away>adult);assert.ok(adult>20&&adult<150);
 console.log({minor,adult,home,away,total:300});
});
test('3.2.1 · cada ronda ofrece 3 facetas aleatorias sin filtros y conserva las ocho',()=>{
 for(const [position] of POSITIONS){let s=newCareer({name:'P',position,seed:'focus-'+position});
  const found=new Set();
  while(s.phase==='draft'){
   const choices=draftChoices(s);assert.equal(choices.length,3);
   assert.equal(new Set(choices.map(c=>c.key)).size,Math.min(3,8-s.draftIndex),'cada ronda prioriza facetas distintas mientras quedan disponibles');
   assert.deepEqual(draftChoices(chooseDraftFocus(s,'shot')),choices,'no se permite filtrar a voluntad');
   assert.deepEqual(draftChoices({...s,draftFocus:'skills'}),choices,'los guardados antiguos no fuerzan facetas');
   assert.deepEqual(draftChoices(migrateCareer(JSON.parse(JSON.stringify(s)))),choices);
   s=acceptDraft(s,1);found.add(s.draftSources.at(-1).attribute);
  }
  assert.equal(s.phase,'academy');assert.equal(s.dnaReviewed,false);
  assert.equal(found.size,8);assert.equal(s.draftRerolls,0);
  for(const k of ['skills','weak'])assert.ok(s.attributes[k]<=5&&s.attrCeil[k]<=5);
  const restored=migrateCareer(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.dnaReviewed,false);
  assert.deepEqual(academyOffers(s),academyOffers(restored));
  assert.equal(signAcademy(restored,academyOffers(s)[0].id).clubId,academyOffers(s)[0].id);
 }
});
test('3.2 · filigranas del especialista en penales respetan cinco estrellas',()=>{
 assert.equal(classAdjustedAttributes({position:'POR',roleClass:'penalero'},{skills:4,defense:60}).skills,5);
});
test('3.2 · informe y resumen muestran penalizaciones y comparador del legado',()=>{
 const d={...newCareer({name:'P',origin:'amateur',roleClass:'completo',weakness:'fisico',age:17}),age:'17'};
 for(let i=0;i<6;i++)assert.match(creatorView(d,i).content,/INFORME DEL FORMADOR/);
 assert.match(creatorView(d,5).aside,/<td>-1<\/td>/);
 assert.match(draftView(d,draftChoices(d)),/ADN SI ELIGES ESTA CARTA/);
 assert.doesNotMatch(draftView(d,draftChoices(d)),/data-action="draft-focus"/);
});
