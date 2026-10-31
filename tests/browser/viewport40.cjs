/* Opciones y creación en tres tamaños: navegación real y comprobación de desbordes. */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
 try{for(const [width,height] of [[1920,1080],[1366,768],[390,844]]){
  const p=await b.newPage({viewport:{width,height}});p.on('pageerror',e=>errs.push(String(e)));
  await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());await p.goto('http://localhost:8765/index.html');
  await p.evaluate(()=>localStorage.clear());await p.reload();await p.locator('input[name=name]').fill('Prueba visual');
  await p.locator('.gear-trigger').click();await p.locator('[role=dialog]').waitFor();
  await p.locator('[data-action=ui-cycle-ambience]').click();await p.locator('[data-action=tools-close]').click();
  if(await p.locator('input[name=name]').inputValue()!=='Prueba visual')throw Error('Se perdió el nombre al abrir opciones');
  await p.reload();if(await p.locator('.app-shell').getAttribute('data-ambience')!=='stadium')throw Error('Preferencia no persistió');
  const info=await p.evaluate(()=>({w:document.documentElement.scrollWidth,v:innerWidth}));
  if(info.w>info.v+1)throw Error(`${width}: desborde horizontal ${info.w}`);
  await p.screenshot({path:`/tmp/rascenso-capturas/creator-${width}.png`,fullPage:true});
  await p.locator('.gear-trigger').click();await p.screenshot({path:`/tmp/rascenso-capturas/options-${width}.png`,fullPage:true});
  await p.keyboard.press('Escape');if(await p.locator('[role=dialog]').count())throw Error('Escape no cerró opciones');
  console.log(`${width}x${height}: creador, opciones y persistencia correctos`);await p.close();
 }}finally{await b.close();}if(errs.length)throw Error(errs.join('\n'));
})().catch(e=>{console.error(e);process.exit(1);});
