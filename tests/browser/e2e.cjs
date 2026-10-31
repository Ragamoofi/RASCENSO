/* Prueba de extremo a extremo opcional (requiere Playwright y un servidor estático):
 *   python3 -m http.server 8765   (en la raíz del proyecto)
 *   node tests/browser/e2e.cjs [url] [chromium|firefox|webkit]
 * Recorre creación, draft, primer contrato, escenas, temporadas, mercado y todas las pestañas. */
const pw=require('playwright');
const url=process.argv[2]||'http://localhost:8765/index.html';
const engine=process.argv[3]||'chromium';
(async()=>{
 const browser=await pw[engine].launch();
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
 await page.goto(url);await page.evaluate(()=>localStorage.clear());await page.reload();
 await page.fill('input[name=name]','Prueba Navegador');
 for(let i=0;i<6;i++){const create=await page.locator('[data-action=create]').count();await page.click(create?'[data-action=create]':'[data-action=creator-next]');await page.waitForTimeout(120);}
 for(let i=0;i<8;i++){await page.locator('[data-action=draft-accept]').first().click();await page.waitForTimeout(80);}
 await page.locator('[data-action=academy-continue]').click();
 await page.locator('[data-action=academy]').first().click();
 const seen=new Set();let save0;
 for(let step=0;step<70;step++){
  await page.waitForTimeout(60);
  const has=sel=>page.locator(sel).count();
  if(await has('[data-action=recap-continue]')){seen.add('recap');await page.click('[data-action=recap-continue]');continue;}
  if(await has('[data-action=event]')){seen.add('event');await page.locator('[data-action=event]').nth(1).click();continue;}
  if(await has('[data-action=event-finish]')){await page.click('[data-action=event-finish]');continue;}
  if(await has('[data-action=negotiate]')){seen.add('market');await page.locator('[data-action=negotiate]').first().click();await page.waitForTimeout(80);}
  if(await has('[data-action=stay]')){await page.click('[data-action=stay]');continue;}
  if(await has('[data-action=transfer]')){await page.locator('[data-action=transfer]').first().click();continue;}
  if(await has('[data-action=season-next]')){
   seen.add('season');
   if(!seen.has('tabs-'+(save0=1))&&seen.has('recap')){seen.add('tabs-1');for(const t of ['vestuario','historial','mundo','carrera']){await page.click(`[data-tab=${t}]`);await page.waitForTimeout(80);seen.add(t);}}
   if(step===20&&await has('[data-action=agent-open]')){await page.click('[data-action=agent-open]');await page.locator('[data-action=agent-focus]').first().click();continue;}
   await page.click('[data-action=season-next]');continue;}
  break;
 }
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('rascenso-save-v2')));
 const scroll=await page.evaluate(()=>document.documentElement.scrollWidth);
 await browser.close();
 console.log(JSON.stringify({engine,seasons:save.history.length,phase:save.phase,version:save.version,news:save.world?.news?.length,screens:[...seen],horizontalOverflow:scroll>1920,errors}));
 if(errors.length||save.history.length<3||scroll>1920)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1);});
