/* Ejecuta las 20 jugadas con un bot en Chromium: todas deben terminar con un resultado y sin errores.
 *   python3 -m http.server 8765   (en la raíz)   ·   node tests/browser/plays-e2e.cjs */
const pw=require('playwright');
const url=process.argv[2]||'http://localhost:8765/tests/browser/plays-harness.html';
(async()=>{
 const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:960,height:540}});
 const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(url);await p.waitForFunction(()=>window.ready);
 const types=await p.evaluate(async()=>Object.keys((await import('/src/plays30.mjs')).PLAYS));
 const out=[];let bad=0;
 for(const type of types){for(const [level,difficulty] of [[55,.8],[85,.3]]){
  const r=await p.evaluate(([t,l,d])=>window.runScene(t,{level:l,difficulty:d,seed:'e2e'+l}),[type,level,difficulty]);
  const ok=r.result&&!r.errors.length;if(!ok)bad++;
  out.push(`${ok?'ok ':'ERR'} ${type.padEnd(14)} nivel ${level} → ${r.result?(r.result.success?'ÉXITO':'fallo')+' ('+r.result.detail+')':'SIN RESULTADO'} en ${r.seconds}s ${r.errors.join(' | ').slice(0,200)}`);
  if(process.env.SHOTS)await p.screenshot({path:`${process.env.SHOTS}/${type}-${level}.png`});
 }}
 await b.close();console.log(out.join('\n'));if(errors.length)console.log('page errors:',errors);
 if(bad||errors.length)process.exit(1);
})();
