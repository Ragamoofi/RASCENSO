/* Comprobaciones de interacción y densidad para etapas y pestañas secundarias.
   No modifica datos del repositorio ni requiere guardados personales. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const URL='http://127.0.0.1:8765/index.html';
const OUT='/tmp/rascenso-ux-review';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const engine=await import(pathToFileURL(path.resolve('src/engine.mjs')).href);
 let s=engine.newCareer({name:'Verificación UX',country:'CL',position:'MC',seed:'ux-second-pass',age:17});
 while(s.phase==='draft')s=engine.acceptDraft(s,0);
 s=engine.signAcademy(s,engine.academyOffers(s)[0].id);
 while(s.phase==='event')s=engine.autoResolveEvent(s);
 const career=s;
 s=engine.advanceSeason(s);
 for(let i=0;i<30&&s.phase!=='summer';i++){
  if(s.phase==='event')s=engine.autoResolveEvent(s);
  else if(s.phase==='transfer')s=engine.chooseTransfer(s,s.market?.canStay?null:s.offers?.[0]?.id);
  else if(s.phase==='season')s=engine.advanceSeason(s);
  else throw Error('Estado inesperado: '+s.phase);
 }
 assert.equal(s.phase,'summer');
 const summer=s;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let rows=[];
 try{
  for(const [width,height] of [[1366,768],[390,844],[360,800]]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
   const measure=async(page,screen)=>{
    await page.waitForTimeout(100);
    const data=await page.evaluate(()=>{
      const doc=document.documentElement, main=document.querySelector('main.view');
      const action=document.querySelector('.creation-actions .action:last-child,.season-command .action,.summer-actions .summer-btn');
      const a=action?.getBoundingClientRect();
      return {height:doc.scrollHeight,width:doc.scrollWidth,overflows:doc.scrollWidth>innerWidth+2,
       actionTop:a?Math.round(a.top):null,actionBottom:a?Math.round(a.bottom):null,
       visible:!!a&&a.top>=0&&a.bottom<=innerHeight,
       main:main?.scrollHeight||0,head:Math.round(document.querySelector('.site-head')?.getBoundingClientRect().height||0)};
    });
    rows.push({screen,viewport:width+'x'+height,...data});
    assert.equal(data.overflows,false,screen+' '+width+' overflow horizontal');
    assert.ok(documentHeightOk(data.height),screen+' height sospechosa '+data.height);
    await page.screenshot({path:OUT+'/'+screen+'-'+width+'x'+height+'-secondary.png',fullPage:false});
    return data;
   };
   const documentHeightOk=n=>n>0&&n<20000;
   {
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('.cr-main').waitFor();
    for(const [i,name] of ['identidad','raices','futbolista','mentalidad','suenos','resumen'].entries()){
     await page.locator('[data-action="step"][data-index="'+i+'"]').click();
     await page.locator('.creation-step.active[data-index="'+i+'"]').waitFor();
     await measure(page,name);
    }
    assert.deepEqual(errors,[],'Excepciones en creador '+width);
    await page.close();
   }
   {
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.addInitScript(state=>{localStorage.setItem('rascenso-save-v2',JSON.stringify(state));localStorage.removeItem('rascenso-save-v2-backup');},career);
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('.playing-layout').waitFor();
    for(const tab of ['carrera','vestuario','historial','mundo']){
     await page.locator('[data-action="nav"][data-tab="'+tab+'"]').click();
     await page.locator('[data-action="nav"][data-tab="'+tab+'"].selected').waitFor();
     await measure(page,tab);
    }
    assert.deepEqual(errors,[],'Excepciones en carrera '+width);
    await page.close();
   }
   {
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(String(e)));
    await page.addInitScript(state=>{localStorage.setItem('rascenso-save-v2',JSON.stringify(state));localStorage.removeItem('rascenso-save-v2-backup');},summer);
    await page.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('.summer-mode:not([disabled])').first().waitFor();
    const target=page.locator('.summer-mode:not([disabled])').last();
    await target.click({timeout:10000});
    await page.waitForTimeout(250);
    await measure(page,'verano-accion');
    assert.deepEqual(errors,[],'Excepciones en verano '+width);
    await page.close();
   }
   await context.close();
  }
 }finally{await browser.close();fs.writeFileSync(OUT+'/metricas-secundarias.json',JSON.stringify(rows,null,2));}
 console.log('UX SECONDARY OK: '+rows.length+' pruebas de vistas e interacción.');
})().catch(e=>{console.error(e);process.exitCode=1;});
