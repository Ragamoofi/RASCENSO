/* Creador de futbolista + Legado/ADN en un navegador real.
 *   python3 -m http.server 8765  ·  node tests/browser/creator-e2e.cjs [url] */
const pw=require('playwright');
const url=process.argv[2]||'http://localhost:8765/index.html';
(async()=>{
 const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errors=[];p.on('pageerror',e=>errors.push(String(e)));p.on('dialog',d=>d.accept());
 await p.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/,r=>r.abort());
 const check=(c,m)=>{if(!c){errors.push('FALLO: '+m);}};
 await p.goto(url);await p.evaluate(()=>localStorage.clear());await p.reload();
 // 1 · Identidad: nombre, posición en la cancha, clase, dorsal sugerido
 await p.fill('input[name=name]','Prueba Creador');
 await p.click('.pitch-dot:has(b:text-is("MCO"))');
 check(await p.locator('.cr-selected b').innerText()==='Mediapunta','la cancha cambia la posición');
 await p.click('.cr-card:has-text("Enganche clásico")');
 await p.click('[data-action=cr-number][data-n="10"]');
 check((await p.inputValue('input[name=number]'))==='10','dorsal sugerido');
 check((await p.locator('.cr-who strong').innerText())==='Prueba Creador','el panel lateral refleja el nombre');
 // 2 · Raíces
 await p.click('[data-action=creator-next]');await p.fill('input[name=city]','La Cisterna');await p.fill('textarea[name=story]','Pateaba contra la pared.');
 check((await p.locator('#story-count').innerText())==='24/180','contador de historia');
 await p.click('.cr-card:has-text("Cancha de tierra")');
 check(await p.locator('.cr-card.on:has-text("Cancha de tierra") .cr-chips').count()===1,'la tarjeta muestra sus efectos');
 // saltar adelante con las pestañas (antes solo se podía retroceder)
 await p.click('.creation-step:has-text("Sueños")');check(await p.locator('.creation-step.active:has-text("Sueños")').count()===1,'se puede saltar hacia adelante');
 await p.click('.cr-card:has-text("Ser ídolo de un club")');
 check(await p.locator('.cr-dream:has-text("8 temporadas")').count()===1,'la meta del sueño se explica');
 // 3 · Persistencia del borrador
 await p.reload();await p.waitForSelector('.cr3');
 check(await p.locator('.creation-step.active:has-text("Sueños")').count()===1,'se recupera el paso tras recargar');
 await p.click('.creation-step:has-text("Identidad")');
 check((await p.inputValue('input[name=name]'))==='Prueba Creador','se recupera el nombre tras recargar');
 // 4 · Perfil sugerido y resumen
 await p.click('[data-action=cr-preset][data-id=cerebro]');
 check(await p.locator('.creation-step.active:has-text("Resumen")').count()===1,'el perfil lleva al resumen');
 check(await p.locator('.cr-sum').count()>=12,'resumen con todas las decisiones');
 check(await p.locator('.cr-proj').count()===1,'panel de bonos en el resumen');
 await p.click('.cr-sum:has-text("Carácter") .cr-edit');check(await p.locator('.creation-step.active:has-text("Mentalidad")').count()===1,'editar desde el resumen');
 await p.click('.creation-step:has-text("Resumen")');
 // 5 · Legado: 8 influencias
 await p.click('[data-action=create]');await p.waitForSelector('.lg-card');
 check(await p.locator('.lg-card').count()===3,'tres cartas por ronda');
 check(await p.locator('.lg-tag').count()===3,'cada carta muestra su familia de juego');
 await p.click('[data-action=reroll]');check(await p.locator('[data-action=reroll]:has-text("(2)")').count()===1,'quedan 2 cambios');
 for(let i=0;i<8;i++){await p.locator('[data-action=draft-accept]').nth(i%3).click();await p.waitForTimeout(60);}
 // 6 · ADN heredado y firma
 await p.waitForSelector('.dna-card');
 check(await p.locator('.dna-card h2').innerText()!=='','el ADN se revela');
 await p.locator('[data-action=academy]').first().click();await p.waitForTimeout(400);
 const save=await p.evaluate(()=>JSON.parse(localStorage.getItem('rascenso-save-v2')));
 check(save.dna&&save.story==='Pateaba contra la pared.'&&save.city==='La Cisterna','el ADN, la historia y la ciudad se guardan');
 check(save.dream==='europa'||save.dream==='titulos','el perfil sugerido aplicó su sueño');
 check(!(await p.evaluate(()=>localStorage.getItem('rascenso-creator-v31'))),'el borrador se limpia al empezar');
 // 7 · La carrera usa lo elegido
 await p.click('[data-tab=vestuario]');
 check(await p.locator('.v2-dna').count()===1&&await p.locator('.v2-dream').count()===1,'Vestuario muestra el ADN y el sueño');
 check(await p.locator('.dna-badge').count()===1,'la tarjeta del jugador muestra su ADN');
 const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>1920);
 check(!overflow,'sin desborde horizontal');
 await b.close();
 console.log(JSON.stringify({ok:!errors.length,dna:save.dna?.primary,errors}));
 if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1);});
