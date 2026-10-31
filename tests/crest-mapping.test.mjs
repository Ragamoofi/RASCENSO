import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COUNTRIES } from '../src/countries.mjs';
import { badge } from '../src/assets.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const aliases=read('../scripts/crest_aliases.json');
const audit=read('../assets/crest-audit.json');
const files=Object.assign({},...[1,2,3,4].map(i=>read(`../assets/logos-${i}.json`)));
test('escudos: todos los 874 clubes fueron auditados; 818 tienen fuentes conocidas',()=>{
 assert.equal(COUNTRIES.reduce((n,c)=>n+c.clubs.length,0),874);
 assert.equal(audit.total,874);assert.ok(audit.mapped>=818);
 assert.equal(audit.total,audit.mapped+audit.unmatched);
 assert.equal(audit.invalidAliases.length,0);
 assert.equal(audit.missing.length,audit.unmatched);
});
test('cada excepción de nombre pertenece al país y a un SVG de ese catálogo',()=>{
 const clubs=new Map(COUNTRIES.flatMap(c=>c.clubs.map(club=>[club.id,c.code])));
 for(const [id,source] of Object.entries(aliases)){
  assert.equal(clubs.get(id),source.country,id);
  assert.ok(files[source.country]?.includes(source.file),`${id}: ${source.file}`);
 }
});
test('Liverpool, West Ham y Botafogo utilizan el nombre real del SVG',()=>{
 assert.equal(aliases['en-2'].file,'Liverpool_FC.svg');
 assert.equal(aliases['en-extra-9'].file,'West_Ham.svg');
 assert.equal(aliases['br-extra-5'].file,'Botafogo_FR.svg');
 assert.ok(!aliases['cl-extra-7'],'una filial sin logo verificado no hereda el escudo del primer equipo');
});
test('Colo-Colo usa el PNG preparado por el generador y no una dirección remota rota',()=>{
 assert.match(badge('cl-1'),/assets\/crests\/cl-1\.png/);
 assert.doesNotMatch(badge('cl-1'),/footylogos/);
});
