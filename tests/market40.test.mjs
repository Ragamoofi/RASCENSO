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
