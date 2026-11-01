const assert=require('node:assert/strict');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  const result=await page.evaluate(async()=>{
   const world=await import('./src/fm26-universe.mjs');
   const fm=await import('./src/fm26-real.mjs');
   const nations=await import('./src/fm26-nations.mjs');
   const info=await world.getWorldDatabaseInfo();
   const madrid=await world.activateWorldClub('es-1');
   const barcelona=await world.activateWorldClub('es-2');
   const mbappe=await world.searchWorldPlayers('Kylian Mbappé',{limit:3});
   const courtois=await world.searchWorldPlayers('Thibaut Courtois',{limit:3});
   const yamal=await world.searchWorldPlayers('Lamine Yamal',{limit:3});
   const k=mbappe.results[0],c=courtois.results[0],y=yamal.results[0];
   const profile=k?await world.getWorldPlayer(k.id):null;
   return {
    info, madrid, barcelona,
    activeMadrid:fm.getFM26Squad('es-1',{}).length,
    activeBarcelona:fm.getFM26Squad('es-2',{}).length,
    mbappe: k&&{name:k.name,flag:nations.fmNationToCode(k.fmNationId),club:k.fmClubUID},
    courtois:c&&{flag:nations.fmNationToCode(c.fmNationId)},
    yamal:y&&{flag:nations.fmNationToCode(y.fmNationId)},
    profile:profile&&{id:profile.id,nation:profile.nacion_fm},
   };
  });
  assert.equal(result.info?.bundled,true,'La base debe cargarse sola, sin seleccionar ZIP');
  assert.equal(result.info.total,180739,'El catálogo preinstalado debe tener todos los futbolistas');
  assert.equal(result.info.freePlayers,30944);
  assert.equal(result.madrid.active,true,JSON.stringify(result.madrid));
  assert.equal(result.barcelona.active,true,JSON.stringify(result.barcelona));
  assert.ok(result.activeMadrid>=11,'Real Madrid sin plantel real');
  assert.ok(result.activeBarcelona>=11,'Barcelona sin plantel real');
  assert.equal(result.mbappe?.flag,'FR','Mbappé debe aparecer francés');
  assert.equal(result.courtois?.flag,'BE','Courtois debe aparecer belga');
  assert.equal(result.yamal?.flag,'ES','Lamine Yamal debe aparecer español');
  assert.equal(result.mbappe?.club,'1734');
  assert.equal(String(result.profile?.nation),'143');
  await page.reload({waitUntil:'domcontentloaded'});
  const again=await page.evaluate(async()=>{
   const world=await import('./src/fm26-universe.mjs');
   return (await world.getWorldDatabaseInfo())?.total;
  });
  assert.equal(again,180739,'Los 180.739 jugadores deben seguir disponibles tras recargar');
  console.log('RASCENSO 4.9.2: base integrada, planteles y nacionalidades FR/BE/ES correctos.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
