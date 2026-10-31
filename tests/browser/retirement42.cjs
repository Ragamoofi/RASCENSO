/* RASCENSO 4.2: final de carrera visual y navegación en Chromium. */
const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch();
 try{
 for(const [width,height] of [[1920,1080],[390,844]]){
  const p=await b.newPage({viewport:{width,height}}),errors=[];
  p.on('pageerror',e=>errors.push(String(e)));
  await p.goto('http://localhost:8765/index.html');
  await p.evaluate(()=>localStorage.clear());await p.reload();
  await p.locator('input[name=name]').fill('Leyenda de prueba');
  for(let i=0;i<6;i++){const done=await p.locator('[data-action=create]').count();await p.locator(done?'[data-action=create]':'[data-action=creator-next]').click();}
  for(let i=0;i<8;i++)await p.locator('[data-action=draft-accept]').first().click();
  await p.locator('[data-action=academy-continue]').click();
  await p.locator('[data-action=academy]').first().click();
  const detail=await p.evaluate(async()=>{
   const {simulateToRetirement,autoResolveEvent}=await import('/src/engine.mjs');
   let s=JSON.parse(localStorage.getItem('rascenso-save-v2'));
   if(s.phase==='event')s=autoResolveEvent(s);
   s=simulateToRetirement(s);
   localStorage.setItem('rascenso-save-v2',JSON.stringify(s));
   return {phase:s.phase,years:s.history.length,matches:s.history.reduce((a,y)=>a+(y.matches||0),0)};
  });
  if(detail.phase!=='retired')throw Error('La carrera no llegó al retiro: '+JSON.stringify(detail));
  await p.reload();await p.locator('.farewell-hero').waitFor({timeout:10000});
  if(await p.locator('.playing-layout').count())throw Error('El retiro sigue usando el viejo panel triple');
  if(await p.locator('.legacy-act').count()!==3)throw Error('Faltan los tres capítulos históricos de la carrera');
  if(!await p.locator('.farewell-signatures').count())throw Error('Falta identidad deportiva de la despedida');
  const stats=await p.locator('.farewell-stat').count();
  if(stats!==6)throw Error('Estadísticas incompletas: '+stats);
  if(width>=1600){
   const sizes=await p.evaluate(()=>{
     const rect=selector=>document.querySelector(selector)?.getBoundingClientRect();
     const hero=rect('.farewell-hero'),acts=rect('.farewell-acts'),stats=rect('.farewell-numbers');
     return {hero:hero?.height,acts:acts?.height,stats:stats?.height,firstTop:hero?.top};
   });
   if(sizes.hero>235||sizes.acts>190||sizes.stats>125)throw Error('Legado no se compactó para 1920×1080: '+JSON.stringify(sizes));
  }

  if(await p.locator('.farewell-club').count()<1)throw Error('No se muestran clubes');
  if(!await p.getByText('La sala de trofeos').count())throw Error('Falta palmarés');
  if(!await p.locator('[data-action=share-png]').count())throw Error('Falta exportar recuerdo');
  const [download]=await Promise.all([p.waitForEvent('download',{timeout:45000}),p.locator('[data-action=share-png]').click()]);
  if(!download.suggestedFilename().endsWith('.png'))throw Error('El recuerdo no se descargó como imagen PNG');
  const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  if(overflow)throw Error('Desbordamiento horizontal '+width);
  if(errors.length)throw Error(errors.join(' | '));
  if(process.env.SHOTS)await p.screenshot({path:process.env.SHOTS+'/retirement-'+width+'.png',fullPage:true});
  console.log(width+'x'+height+': final de carrera verificado, '+JSON.stringify(detail));
  await p.close();
 }
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
