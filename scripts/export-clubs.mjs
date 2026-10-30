import { COUNTRIES } from '../src/countries.mjs';
import { writeFileSync } from 'node:fs';
writeFileSync('clubs-export.json', JSON.stringify(COUNTRIES.flatMap(country => country.clubs.map(club => ({country:country.code,club})))));
console.log('Catálogo exportado:', COUNTRIES.reduce((n,c) => n + c.clubs.length, 0));
