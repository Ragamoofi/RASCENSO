/* Prueba e2e del nuevo mundo incluido; genera un paquete de muestra SOLO DURANTE CI.
   No depende de FM ni sube material del usuario al repositorio. */
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../assets/world-data');
const write=(file,obj)=>{const dest=path.join(root,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,zlib.gzipSync(Buffer.from(JSON.stringify(obj)),{level:9}))};
function person(club,id,i){return {id:'fm26:'+id,nombre:'Futbolista '+club+' '+i,edad:22+i%7,posiciones:[i%3===0?'GK':i%3===1?'STC':'MC'],ca_fm:90+i,pa_fm:120+i,equipo_slot:0,stats:{aceleracion:10,velocidad:13,pase:14,remate:12},nacion_fm:'170'}}
const files={
 'por_pais/nacion_170_parte_001.json':{clubes:[
  {club_uid:'1734',nombre:'R. Madrid',pais_id_fm:'170',jugadores:Array.from({length:13},(_,i)=>person('Madrid',1734000+i,i))},
  {club_uid:'1708',nombre:'Barcelona',pais_id_fm:'170',jugadores:Array.from({length:13},(_,i)=>person('Barcelona',1708000+i,i))}]},
 'libres/libres_001.json':{jugadores:[{id:'fm26:998877',nombre:'Delantero Libre Único',edad:27,posiciones:['STC'],ca_fm:110,pa_fm:130,equipo_slot:0,nacion_fm:'170'}]}
};
const clubs={
 '1734':{archivo:'por_pais/nacion_170_parte_001.json',nombre:'R. Madrid',pais_id_fm:'170',n_jugadores:13,n_primer_equipo:13},
 '1708':{archivo:'por_pais/nacion_170_parte_001.json',nombre:'Barcelona',pais_id_fm:'170',n_jugadores:13,n_primer_equipo:13}
};
(async()=>{
 if(fs.existsSync(root))throw Error('CI no debe sobrescribir un catálogo mundial real');
 fs.mkdirSync(root,{recursive:true});
 let browser;
 try{
  const rows=[];
  for(const [file,data] of Object.entries(files)){
   write(file+'.gz',data);
   for(const c of data.clubes||[])for(const p of c.jugadores)rows.push([p.id,p.nombre,p.edad,p.posiciones[0],65,String(c.club_uid),'170',file]);
   for(const p of data.jugadores||[])rows.push([p.id,p.nombre,p.edad,p.posiciones[0],72,'','170',file]);
  }
  write('directory.json.gz',rows);
  write('clubs.json.gz',clubs);
  fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify({schema:'rascenso-bundled-world-v1',total:27,players:26,freePlayers:1,clubs:2,shards:2,directory:'directory.json.gz',clubIndex:'clubs.json.gz',version:'test'}));
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  const result=await page.evaluate(async()=>{
   const w=await import('./src/fm26-universe.mjs'),f=await import('./src/fm26-real.mjs');
   const info=await w.getWorldDatabaseInfo();
   const madrid=await w.activateWorldClub('es-1'),barca=await w.activateWorldClub('es-2');
   const found=await w.searchWorldPlayers('Delantero Libre Único');
   const player=await w.getWorldPlayer('fm26:998877');
   const clubs=await w.searchWorldClubs('Barcelona');
   return {info,madrid,barca,free:found.results[0]?.name,detail:player?.nombre,
    count:clubs.total,players:f.getFM26Squad('es-1',{}).length};
  });
  assert.equal(result.info.total,27);
  assert.equal(result.info.bundled,true);
  assert.equal(result.info.mapped,2);
  assert.equal(result.madrid.players,13);
  assert.equal(result.barca.players,13);
  assert.equal(result.players,13);
  assert.equal(result.free,'Delantero Libre Único');
  assert.equal(result.detail,'Delantero Libre Único');
  assert.equal(result.count,1);
  await page.reload({waitUntil:'domcontentloaded'});
  const after=await page.evaluate(async()=>{const w=await import('./src/fm26-universe.mjs');return await w.getWorldDatabaseInfo()});
  assert.equal(after.total,27);
  assert.equal(after.bundled,true);
  console.log('WORLD 4.9 bundled: 27/27 autoloaded, clubs mapped, free agents, reload — OK');
 }finally{if(browser)await browser.close();fs.rmSync(root,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exitCode=1});
