import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTransferOffers,marketClub} from '../src/market.mjs';
const base={seed:'mercado',age:19,country:'CL',clubId:'cl-1',ovr:62,reputation:20,position:'DC',history:[{matches:20,goals:5,assists:2}],attributes:{},relationships:{}};
test('el catálogo extranjero no domina las ofertas de carreras jóvenes',()=>{
 assert.ok(marketClub(base.clubId));let home=0,total=0;
 for(let i=0;i<150;i++){const offers=buildTransferOffers({...base,seed:'mercado-'+i});for(const o of offers){total++;if(o.countryCode==='CL')home++;assert.notEqual(o.id,base.clubId);}}
 assert.ok(total>200);assert.ok(home/total>.40,`${home}/${total}`);
});
test('el mercado temprano sigue siendo determinista y admite interés internacional',()=>{
 const s={...base,seed:'international-40'};assert.deepEqual(buildTransferOffers(s),buildTransferOffers(s));
 let foreign=0;for(let i=0;i<50;i++)foreign+=buildTransferOffers({...s,seed:'international-'+i},{focus:'international'}).filter(x=>x.countryCode!=='CL').length;
 assert.ok(foreign>0);
});
test('el criterio local funciona en distintos países y ligas',()=>{
 for(const [country,clubId] of [['AR','ar-1'],['FR','fr-1'],['JP','jp-1']]){let home=0,total=0;
  for(let i=0;i<80;i++)for(const o of buildTransferOffers({...base,country,clubId,seed:`${country}-${i}`})){total++;if(o.countryCode===country)home++;}
  assert.ok(total>100&&home/total>.35,`${country}: ${home}/${total}`);
 }
});
test('las ofertas consideran competencia real del mundo simulado sin inventar una vacante',async()=>{
 const {positionCompetition,positionCompetitionWeight}=await import('../src/market.mjs');const s={...base,world:{players:[{id:'rival',name:'Competidor',clubId:'ar-1',pos:'DC',ovr:76,status:'active'}]}};
 assert.equal(positionCompetition(s,'ar-1').name,'Competidor');assert.ok(positionCompetitionWeight(s,'ar-1')<1);
 assert.equal(positionCompetition(s,'fr-1'),null);assert.equal(positionCompetitionWeight(s,'fr-1'),1);
 assert.equal(positionCompetition({...s,position:'POR'},'ar-1'),null);
});
test('una oferta refleja la competencia conocida por el puesto y ajusta el rol',()=>{
 const s={...base,country:'AR',clubId:'ar-2',ovr:80,world:{players:[{id:'nine',name:'Delantero rival',clubId:'ar-1',pos:'DC',ovr:88,status:'active'}]}};
 let offer=null;for(let i=0;i<400&&!offer;i++)offer=buildTransferOffers({...s,seed:`competition-${i}`},{focus:'local'}).find(x=>x.id==='ar-1');
 assert.ok(offer,'debe ser posible recibir la oferta');assert.equal(offer.role,'Rotación');assert.match(offer.project,/Competencia fuerte/);
});
