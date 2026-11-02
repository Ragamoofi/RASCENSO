/* QA del rediseño: no altera el producto, guardados ni desplega el sitio.
 * Ejecutar tras instalar Playwright: node tests/browser/ux-compact-review.cjs
 * El servidor local debe estar escuchando en el puerto 8765. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const TARGET='http://127.0.0.1:8765/index.html';
const OUT='/tmp/rascenso-ux-review';
const VIEWPORTS=[[1920,1080],[1600,900],[1366,768],[1280,720],[768,1024],[390,844],[360,800]];
fs.mkdirSync(OUT,{recursive:true});
const load=async p=>import(pathToFileURL(path.resolve(p)).href);
function advanceToSummer(engine,state){
 let s=engine.advanceSeason(state);
 for(let guard=0;guard<32&&s.phase!=='summer';guard++){
  if(s.phase==='event')s=engine.autoResolveEvent(s);
  else if(s.phase==='transfer')s=engine.chooseTransfer(s,s.market?.canStay?null:s.offers?.[0]?.id);
  else if(s.phase==='season')s=engine.advanceSeason(s);
  else throw Error('Fase inesperada en QA: '+s.phase);
 }
 assert.equal(s.phase,'summer','La muestra QA debe alcanzar Verano');
 return s;
}
(async()=>{
 const engine=await load('src/engine.mjs');
 let state=engine.newCareer({name:'Prueba UX',country:'CL',position:'DC',seed:'ux-compact-review',age:17});
 while(state.phase==='draft')state=engine.acceptDraft(state,0);
 state=engine.signAcademy(state,engine.academyOffers(state)[0].id);
 while(state.phase==='event')state=engine.autoResolveEvent(state);
 assert.equal(state.phase,'season');
 const summer=advanceToSummer(engine,state);
 const scenarios=[
  {name:'identidad',phase:'creator',selector:'.cr-main'},
  {name:'futbolista',phase:'creator',selector:'.cr-main',wizard:2},
  {name:'carrera',phase:'career',selector:'.playing-layout',save:state},
  {name:'verano',phase:'summer',selector:'.summer-wrap',save:summer}
 ];
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const summary=[];const failures=[];
 try{
  for(const [width,height] of VIEWPORTS){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
   for(const task of scenarios){
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',err=>errors.push(String(err)));
    await page.addInitScript(({phase,save,wizard})=>{
     localStorage.removeItem('rascenso-save-v2');
     localStorage.removeItem('rascenso-save-v2-backup');
     localStorage.removeItem('rascenso-creator-v31');
     if(save)localStorage.setItem('rascenso-save-v2',JSON.stringify(save));
     if(phase==='creator'&&wizard!=null)
      localStorage.setItem('rascenso-creator-v31',JSON.stringify({draft:{name:'Prueba UX'},wizard}));
    },{phase:task.phase,save:task.save||null,wizard:task.wizard??null});
    try{
     await page.goto(TARGET,{waitUntil:'domcontentloaded',timeout:45000});
     await page.locator(task.selector).first().waitFor({timeout:45000});
     await page.waitForTimeout(550);
     const measure=await page.evaluate(selector=>{
      const doc=document.documentElement;
      const action=document.querySelector(selector);
      const buttons=[...document.querySelectorAll('button')].filter(el=>el.offsetWidth>0&&el.offsetHeight>0);
      const mainButton=buttons.find(el=>/continuar|jugar|avanzar|simular|resumir verano/i.test(el.textContent||''));
      const box=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height)};};
      const content=(document.querySelector('main.view')||action)?.getBoundingClientRect();
      return {width:innerWidth,height:innerHeight,documentHeight:doc.scrollHeight,documentWidth:doc.scrollWidth,horizontalOverflow:doc.scrollWidth>innerWidth+2,mainTop:content?Math.round(content.top):null,action:box(mainButton),actionInitiallyVisible:!!mainButton&&mainButton.getBoundingClientRect().bottom<=innerHeight&&mainButton.getBoundingClientRect().top>=0,section:box(action),visibleChoices:buttons.length};
     },task.selector);
     const key=task.name+'-'+width+'x'+height;
     await page.screenshot({path:path.join(OUT,key+'-top.png'),fullPage:false});
     if([1366,390].includes(width)){
      await page.screenshot({path:path.join(OUT,key+'-full.png'),fullPage:true});
     }
     summary.push({screen:task.name,viewport:width+'x'+height,...measure,errors});
     if(measure.horizontalOverflow)failures.push(key+': scroll horizontal '+measure.documentWidth+' > '+width);
     if(errors.length)failures.push(key+': errores JS: '+errors.slice(0,2).join('; '));
     process.stdout.write(key+' doc='+measure.documentHeight+' action='+measure.action?.top+' overflow='+measure.horizontalOverflow+'\n');
    }catch(error){
     failures.push(task.name+'-'+width+': '+String(error));
     summary.push({screen:task.name,viewport:width+'x'+height,error:String(error),errors});
    }finally{await page.close();}
   }
   await context.close();
  }
 }finally{await browser.close();fs.writeFileSync(path.join(OUT,'metricas.json'),JSON.stringify({summary,failures},null,2));}
 assert.equal(failures.length,0,failures.slice(0,12).join('\n'));
 console.log('QA UX compacto OK: '+summary.length+' combinaciones de vista/resolución.');
})().catch(e=>{console.error(e);process.exitCode=1;});
