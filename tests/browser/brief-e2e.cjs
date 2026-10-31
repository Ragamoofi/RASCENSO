/* Comprueba que TODAS las jugadas esperan al jugador en la pantalla de instrucciones:
 * sin tiempo límite, sin avanzar la simulación y con cuenta 3-2-1 solo tras pulsar «Empezar».
 *   python3 -m http.server 8765  ·  node tests/browser/brief-e2e.cjs */
const pw=require('playwright');
const url=process.argv[2]||'http://localhost:8765/tests/browser/plays-harness.html';
(async()=>{
 const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:960,height:540}});
 const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(url);await p.waitForFunction(()=>window.ready);
 const types=await p.evaluate(async()=>Object.keys((await import('/src/plays30.mjs')).PLAYS));
 let bad=0;
 for(const type of types){for(const mode of ['click','enter']){
  const r=await p.evaluate(async([type,mode])=>{
   const {createMatch}=await import('/src/match2d.mjs');const {SCENES}=await import('/src/plays-ui.mjs');const P=await import('/src/plays30.mjs');
   const canvas=document.getElementById('c');
   const play={id:'t',type,kind:P.PLAYS[type].kind,credit:P.PLAYS[type].credit,minute:88,before:{gf:1,ga:1},pressure:80,fatigue:.3,difficulty:.5,seed:'b'+type,rival:'R',rivalId:'x',tag:'Prueba',isHome:true,memory:[]};
   const m=createMatch(canvas,{play,stats:P.playerStats({attributes:{pace:70,shot:70,pass:70,dribble:70,defense:70,physical:70,skills:3,weak:3},morale:70},play),ai:P.aiStats(play),scene:SCENES[type],hud:{title:'T',brief:'b',controls:'c'},onEnd:()=>{}});
   const out={};
   await new Promise(r=>setTimeout(r,2800));           // más que la antigua presentación de 2,4 s
   out.waits=m.phase==='brief'&&m.t===0&&!m.result;      // sigue esperando, sin reloj ni resultado
   // clic fuera del botón no empieza
   const rect=canvas.getBoundingClientRect();
   canvas.dispatchEvent(new PointerEvent('pointerdown',{clientX:rect.left+30,clientY:rect.top+30,pointerId:1,bubbles:true}));
   out.ignoresOutside=m.phase==='brief';
   if(mode==='click'){const x=rect.left+(m.btn.x+m.btn.w/2)/960*rect.width,y=rect.top+(m.btn.y+m.btn.h/2)/540*rect.height;canvas.dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,pointerId:1,bubbles:true}));}
   else window.dispatchEvent(new KeyboardEvent('keydown',{code:'Enter'}));
   out.countdown=m.phase==='intro'&&m.t===0;
   await new Promise(r=>setTimeout(r,2700));
   out.playing=m.phase==='play'||m.phase==='outro';
   m.destroy();return out;
  },[type,mode]);
  const ok=r.waits&&r.ignoresOutside&&r.countdown&&r.playing;if(!ok)bad++;
  console.log(`${ok?'ok ':'ERR'} ${type.padEnd(14)} ${mode.padEnd(5)} ${JSON.stringify(r)}`);
 }}
 await b.close();if(errors.length)console.log('page errors:',errors);
 if(bad||errors.length)process.exit(1);
})();
