/* Auditoría transversal de RASCENSO: pantallas de todo el recorrido, sin tocar partidas reales. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const URL='http://127.0.0.1:8765/index.html';
const OUT='/tmp/rascenso-ux-review';
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const e=await import(pathToFileURL(path.resolve('src/engine.mjs')).href);
 const original=e.newCareer({name:'Carrera de auditoría',country:'CL',position:'DC',age:17,seed:'ux-panorama-final'});
 let dna=original;
 while(dna.phase==='draft')dna=e.acceptDraft(dna,0);
 const signed=e.signAcademy(dna,e.academyOffers(dna)[0].id);
 let season=e.autoResolveEvent(signed);
 assert.equal(season.phase,'season');
 const recap=e.advanceSeason(season);
 let summer=recap;
 for(let i=0;i<30&&summer.phase!=='summer';i++){
  if(summer.phase==='event')summer=e.autoResolveEvent(summer);
  else if(summer.phase==='transfer')summer=e.chooseTransfer(summer,summer.market?.canStay?null:summer.offers?.[0]?.id);
  else if(summer.phase==='season')summer=e.advanceSeason(summer);
  else throw Error('Fase no esperada: '+summer.phase);
 }
 assert.equal(summer.phase,'summer');
 const retired=e.simulateToRetirement(season);
 assert.equal(retired.phase,'retired');
 const market={...recap,phase:'transfer',market:{...(recap.market||{}),reason:'normal',canStay:true,searches:0},offers:e.transferOffers(recap)};
 const tasks=[
  {screen:'legado',save:original,selector:'.lg-card'},
  {screen:'adn',save:dna,selector:'.dna-review-actions'},
  {screen:'contratos',save:{...dna,dnaReviewed:true},selector:'.academy-card'},
  {screen:'narrativa',save:signed,selector:'.story-body'},
  {screen:'balance',save:recap,selector:'.recap-metrics'},
  {screen:'mercado',save:market,selector:'.market-actions'},
  {screen:'vestuario',save:season,tab:'vestuario',selector:'.v2-vestuario'},
  {screen:'historial',save:retired,tab:'historial',selector:'.history-table'},
  {screen:'mundo',save:season,tab:'mundo',selector:'.world-search-dock'},
  {screen:'retiro',save:retired,selector:'.farewell-hero'},
  {screen:'club',save:season,dialog:'club',selector:'.club497-frame'},
  {screen:'ajustes',save:season,dialog:'tools',selector:'.tool-panel'}
 ];
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const rows=[],problems=[];
 try{
 for(const [width,height] of [[1366,768],[390,844],[1920,1080]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  for(const task of tasks){
   const pg=await context.newPage();const errors=[];
   pg.on('pageerror',x=>errors.push(String(x)));
   pg.on('dialog',x=>x.accept());
   try{
    await pg.addInitScript(data=>{
     localStorage.removeItem('rascenso-creator-v31');
     localStorage.removeItem('rascenso-save-v2-backup');
     if(data)localStorage.setItem('rascenso-save-v2',JSON.stringify(data));
     else localStorage.removeItem('rascenso-save-v2');
    },task.save);
    await pg.goto(URL,{waitUntil:'domcontentloaded',timeout:45000});
    if(task.tab){
     const nav=pg.locator('.main-nav [data-action="nav"][data-tab="'+task.tab+'"]').first();
     await nav.waitFor({timeout:25000});
     await nav.click();
    }
    if(task.dialog==='club'){
     const link=pg.locator('.player-club .club495-name-link').first();
     await link.waitFor({timeout:30000});
     await link.click();
    }else if(task.dialog==='tools'){
     await pg.locator('[data-action="tools"]').first().click();
    }
    await pg.locator(task.selector).first().waitFor({timeout:30000});
    await pg.waitForTimeout(180);
    const metric=await pg.evaluate(selector=>{
      const modal=document.querySelector('dialog[open],.tool-panel');
      const doc=document.documentElement,el=document.querySelector(selector);
      const bound=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height),width:Math.round(r.width)}};
      const interact=[...document.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&b.height>0});
      return {
       documentHeight:doc.scrollHeight,documentWidth:doc.scrollWidth,
       overflows:doc.scrollWidth>innerWidth+2,
       viewport:innerWidth+'x'+innerHeight,primary:bound(el),modal:bound(modal),
       visibleControls:interact.length,firstActions:interact.slice(0,10).map(x=>({text:(x.textContent||x.getAttribute('aria-label')||'').trim().slice(0,50),top:Math.round(x.getBoundingClientRect().top)})),
       blank:!!document.querySelector('.boot'),mainHeight:document.querySelector('main.view')?.scrollHeight||null
      };
    },task.selector);
    if(metric.overflows)problems.push(task.screen+' '+width+': overflow horizontal');
    if(errors.length)problems.push(task.screen+' '+width+': JS '+errors.join(' | '));
    const key=task.screen+'-'+width+'x'+height;
    await pg.screenshot({path:path.join(OUT,key+'-panorama.png'),fullPage:false});
    if(width===390&&['legado','contratos','mercado','mundo','club','retiro'].includes(task.screen)){
      await pg.screenshot({path:path.join(OUT,key+'-panorama-full.png'),fullPage:true});
    }
    rows.push({screen:task.screen,...metric,errors});
    console.log('PANORAMA '+key+' doc='+metric.documentHeight+' controls='+metric.visibleControls+' overflow='+metric.overflows);
   }catch(err){rows.push({screen:task.screen,viewport:width+'x'+height,error:String(err)});problems.push(task.screen+' '+width+': '+String(err));}
   finally{await pg.close();}
  }
  await context.close();
 }
 }finally{await browser.close();fs.writeFileSync(path.join(OUT,'metricas-panorama.json'),JSON.stringify({rows,problems},null,2));}
 if(problems.length)throw Error('Auditoría transversal: '+problems.join('\n'));
 console.log('PANORAMA OK: '+rows.length+' pantallas en Chromium, 0 errores');
})().catch(e=>{console.error(e);process.exitCode=1;});
