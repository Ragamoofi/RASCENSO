/** Auditoría reproducible de RASCENSO — carreras COMPLETAS con motor real.
 * Mismas semillas por categoría para comparar decisiones; no escribe partidas.
 * Uso opcional (desde el repositorio): node scripts/audit-balance4106.mjs --seeds 20 --out docs/balance4106-results.json
 */
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {newCareer,acceptDraft,academyOffers,signAcademy,simulateToRetirement} from '../src/engine.mjs';
import {CHOICES} from '../src/identity30.mjs';
const positions=['DC','MC','DFC','POR','EI','MCD','LI'];
const categories=['developmentPath','environment','personality','style','dream','origin','publicImage','strength','riskProfile'];
const defaults={origin:'barrio',environment:'sin_contactos',developmentPath:'tecnica',personality:'disciplinado',style:'equilibrado',dream:'seleccion',publicImage:'reservado'};
const numberArg=(name,def)=>{const i=process.argv.indexOf(name);return i>=0?Math.max(1,Math.min(500,Number(process.argv[i+1])||def)):def};
const seeds=numberArg('--seeds',16);
const outAt=process.argv.indexOf('--out');const output=outAt>=0?process.argv[outAt+1]:'';
const onlyAt=process.argv.indexOf('--category');const active=onlyAt>=0?[process.argv[onlyAt+1]]:categories;
const results=[],errors=[];let count=0;
const round=n=>Math.round(n*100)/100;
function career(options,seed,position){
 let s=newCareer({name:'Simulación de equilibrio',seed,country:'CL',position,age:17,...defaults,...options});
 for(let i=0;i<8;i++)s=acceptDraft(s,0);
 const offer=academyOffers(s)[0];if(!offer)throw Error('Sin oferta inicial');
 s=signAcademy(s,offer.id);
 s=simulateToRetirement(s);
 const hist=s.history||[];
 const sum=k=>hist.reduce((n,x)=>n+Number(x[k]||0),0);
 return {seasons:hist.length,peak:Math.max(...hist.map(x=>Number(x.ovrAfter||0)),s.ovr||0),minutes:sum('minutes'),goals:sum('goals'),assists:sum('assists'),injuryWeeks:sum('injuryWeeks'),titles:(s.trophies||[]).length,ovr:s.ovr||0,retired:s.phase==='retired'?1:0};
}
for(const category of active){
 const names=Object.keys(CHOICES[category]||{});if(!names.length)throw Error('Categoría inexistente: '+category);
 for(const name of names){
  const rows=[];
  for(let i=0;i<seeds;i++){
   const pos=positions[i%positions.length];
   // CRN: misma semilla/posición para todos los perfiles de una categoría.
   const seed=`balance-4106:${category}:${i}:${pos}`;
   try{rows.push(career({[category]:name},seed,pos))}catch(e){errors.push({category,name,i,error:String(e)})}
   count++;
   if(count%80===0)process.stdout.write(`\nSIM ${count} carreras procesadas (${category})`);
  }
  const mean=k=>rows.length?round(rows.reduce((n,x)=>n+x[k],0)/rows.length):0;
  results.push({category,option:name,runs:rows.length,mean:Object.fromEntries(['seasons','peak','minutes','goals','assists','injuryWeeks','titles','ovr','retired'].map(k=>[k,mean(k)]))});
 }
}
const report={version:'4.10.6',mode:'motor real — carreras completas; semillas comunes por categoría',seedsPerOption:seeds,positions,runs:results.reduce((n,x)=>n+x.runs,0),errors:errors.slice(0,10),results};
if(output){mkdirSync(dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2))}
process.stdout.write(`\nTOTAL ${report.runs} carreras completas | errores ${errors.length}\n`);
for(const cat of active){const rs=results.filter(x=>x.category===cat);if(!rs.length)continue; const sorted=rs.sort((a,b)=>b.mean.peak-a.mean.peak);process.stdout.write(cat+'  '+sorted.map(r=>r.option+' '+r.mean.peak).join(' | ')+'\n')}
