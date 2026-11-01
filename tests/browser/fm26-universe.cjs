const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const zlib=require('node:zlib');
function zipFiles(files){
 const arr=[],cent=[];let offset=0;
 for(const [path,plain] of Object.entries(files)){
  const name=Buffer.from('RASCENSO_DATOS/'+path,'utf8');
  const raw=Buffer.from(JSON.stringify(plain),'utf8'),body=zlib.deflateRawSync(raw);
  const h=Buffer.alloc(30),dir=Buffer.alloc(46);
  h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt16LE(8,8);
  h.writeUInt32LE(body.length,18);h.writeUInt32LE(raw.length,22);h.writeUInt16LE(name.length,26);
  dir.writeUInt32LE(0x02014b50,0);dir.writeUInt16LE(20,4);dir.writeUInt16LE(20,6);dir.writeUInt16LE(8,10);
  dir.writeUInt32LE(body.length,20);dir.writeUInt32LE(raw.length,24);dir.writeUInt16LE(name.length,28);dir.writeUInt32LE(offset,42);
  arr.push(h,name,body);cent.push(dir,name);offset+=h.length+name.length+body.length;
 }
 const c=Buffer.concat(cent),e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50,0);e.writeUInt16LE(Object.keys(files).length,8);
 e.writeUInt16LE(Object.keys(files).length,10);e.writeUInt32LE(c.length,12);e.writeUInt32LE(offset,16);
 return Buffer.concat([...arr,c,e]);
}
const player=(prefix,i)=>({id:'fm26:'+(prefix*10000+i),nombre:'Real Player '+prefix+' '+i,edad:21+i%8,
 posiciones:[i%5===0?'GK':i%5===1?'STC':'MC'],equipo_slot:0,ca_fm:102+i,pa_fm:130+i,stats:{pase:12,remate:12,velocidad:13}});
const index={'1734':{archivo:'runtime/por_pais/nacion_170_parte_001.json',nombre:'R. Madrid',pais_id_fm:'170',n_primer_equipo:13},
 '1708':{archivo:'runtime/por_pais/nacion_170_parte_001.json',nombre:'Barcelona',pais_id_fm:'170',n_primer_equipo:13}};
const world={schema:'rascenso-fm26-compact-v2',pais_id_fm:'170',clubes:[
 {club_uid:'1734',nombre:'R. Madrid',pais_id_fm:'170',genero:'NO_VERIFICADO',jugadores:Array.from({length:13},(_,i)=>player(1734,i))},
 {club_uid:'1708',nombre:'Barcelona',pais_id_fm:'170',genero:'NO_VERIFICADO',jugadores:Array.from({length:13},(_,i)=>player(1708,i))}
]};
const archive=zipFiles({'runtime/indice_clubes.json':index,'runtime/por_pais/nacion_170_parte_001.json':world,
 'runtime/libres/libres_001.json':{schema:'free',jugadores:[{id:'fm26:99990001',nombre:'Libre Mundial',edad:29,posiciones:['DC'],ca_fm:90,pa_fm:111}]}});
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const p=await browser.newPage({viewport:{width:1920,height:1080}});
  await p.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  const result=await p.evaluate(async array=>{
   const db=await import('./src/fm26-universe.mjs');
   const fm=await import('./src/fm26-real.mjs');
   const file=new File([new Uint8Array(array)],'jugadores.zip',{type:'application/zip'});
   const info=await db.installWorldDatabase(file);
   const a=await db.activateWorldClub('es-1'),b=await db.activateWorldClub('es-2');
   const match=await db.searchWorldPlayers('Libre Mundial');
   const r=await db.searchWorldPlayers('Real Player 1734');
   const cup=fm.getFM26Squad('es-1',{}).length;
   return {info,a,b,cup,free:match.results[0]?.name,search:r.total,map:(await db.getWorldMappingInfo()).mapping['es-1']?.fmUID};
  },[...archive]);
  assert.equal(result.info.total,27);
  assert.equal(result.info.clubs,2);
  assert.equal(result.info.freePlayers,1);
  assert.equal(result.cup,13);
  assert.equal(result.a.players,13);
  assert.equal(result.b.players,13);
  assert.equal(result.free,'Libre Mundial');
  assert.equal(result.search,13);
  assert.equal(result.map,'1734');
  await p.reload({waitUntil:'domcontentloaded'});
  const persistent=await p.evaluate(async()=>{
   const db=await import('./src/fm26-universe.mjs');
   return {info:await db.getWorldDatabaseInfo(),result:await db.searchWorldPlayers('Real Player 1708')};
  });
  assert.equal(persistent.info.total,27);
  assert.equal(persistent.result.total,13);
  console.log('WORLD 100% private ZIP installed + mapped + free agents + reload: OK');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
