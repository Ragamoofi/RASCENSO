/* Interacciones reales con canvas: inicio, WASD diagonal y carga de penal. */
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:960,height:540}});let errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto('http://localhost:8765/tests/browser/plays-harness.html');await page.waitForFunction(()=>window.ready);
  await page.evaluate(()=>window.startInteractive('mano_a_mano'));
  await page.keyboard.press('Enter');await page.waitForFunction(()=>window.activeMatch.phase==='play');
  const before=await page.evaluate(()=>({x:activeMatch.me.x,y:activeMatch.me.y}));
  await page.keyboard.down('w');await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('w');await page.keyboard.up('d');
  const after=await page.evaluate(()=>({x:activeMatch.me.x,y:activeMatch.me.y}));
  if(!(after.x>before.x&&after.y<before.y))throw Error(`Movimiento diagonal incorrecto: ${JSON.stringify({before,after})}`);
  await page.evaluate(()=>window.startInteractive('penal'));
  await page.keyboard.press('Enter');await page.waitForFunction(()=>window.activeMatch.phase==='play');
  await page.mouse.move(650,260);await page.mouse.down();await page.waitForTimeout(700);await page.mouse.up();
  await page.waitForFunction(()=>window.activeMatch.result,{timeout:5000});
  const result=await page.evaluate(()=>({result:activeMatch.result,dive:activeMatch.k.diving,p:activeMatch.k.p}));
  if(!result.dive||!result.result||result.p<=0)throw Error(`No hubo disparo o reacción: ${JSON.stringify(result)}`);
  if(errors.length)throw Error(errors.join('\n'));
  console.log('Controles reales: inicio, diagonal y penal correctos',JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
