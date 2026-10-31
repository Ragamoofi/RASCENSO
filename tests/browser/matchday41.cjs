/* RASCENSO 4.1: creador → Centro de Partido, cambios de ritmo y adaptación. */
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();
 try{
  for(const [width,height] of [[1920,1080],[390,844]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('dialog',d=>d.accept());
   await page.goto('http://localhost:8765/index.html');
   await page.evaluate(()=>localStorage.clear());await page.reload();
   await page.fill('input[name=name]','Prueba Partido');
   for(let i=0;i<6;i++){const done=await page.locator('[data-action=create]').count();await page.locator(done?'[data-action=create]':'[data-action=creator-next]').click();}
   for(let i=0;i<8;i++)await page.locator('[data-action=draft-accept]').first().click();
   await page.locator('[data-action=academy-continue]').click();
   await page.locator('[data-action=academy]').first().click();
   await page.locator('[data-action=event]').nth(1).click();
   await page.locator('[data-action=event-finish]').click();
   await page.locator('.matchday-center').waitFor();
   const btn=page.locator('[data-action=match-rhythm][data-rhythm=inmersivo]');await btn.click();
   if(!await btn.evaluate(x=>x.classList.contains('selected')))throw Error('No se activó el modo inmersivo');
   if(await page.locator('.matchday-center').count()!==1)throw Error('Centro de partido ausente');
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('rascenso-save-v2')));
   if(stored.matchRhythm!=='inmersivo')throw Error('No se guardó el ritmo');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   if(overflow)throw Error('Desbordamiento horizontal '+width);
   await page.locator('.matchday-calendar').evaluate(x=>x.open=true);
   if(process.env.SHOTS)await page.screenshot({path:process.env.SHOTS+'/matchday-'+width+'.png',fullPage:true});
   if(errors.length)throw Error(errors.join(' | '));
   console.log(width+'x'+height+': Centro de Partido, guardado y ritmo inmersivo correctos');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
