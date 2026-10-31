/* 4.5: comprobar la vitrina compacta de 20+ copas y la ficha en móvil y desktop. */
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch();
 try{
 for(const [width,height] of [[1920,1080],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.goto('http://localhost:8765/index.html');
  await page.evaluate(()=>localStorage.clear());await page.reload();
  await page.fill('input[name=name]','Vitrina de prueba');
  for(let i=0;i<6;i++){const done=await page.locator('[data-action=create]').count();await page.locator(done?'[data-action=create]':'[data-action=creator-next]').click();}
  for(let i=0;i<8;i++)await page.locator('[data-action=draft-accept]').first().click();
  await page.locator('[data-action=academy-continue]').click();
  await page.locator('[data-action=academy]').first().click();
  await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem('rascenso-save-v2'));
   const titles=['Copa Libertadores','Copa Chile','Liga de Primera','Recopa Sudamericana','UEFA Champions League',
     'Premier League','Copa Sudamericana','Copa Mundial de la FIFA','Mundial de Clubes',
     ...Array.from({length:14},(_,i)=>'Copa extra '+i)];
   s.trophyRecords=titles.map((title,i)=>({title,year:2045-i,clubId:s.clubId,kind:i===0?'continental':i===1?'national-cup':'league'}));
   s.trophies=titles;
   localStorage.setItem('rascenso-save-v2',JSON.stringify(s));
  });
  await page.reload();await page.locator('.trophy-showcase').waitFor();
  const count=await page.locator('.trophy-unit').count();
  if(count!==23)throw Error('La vitrina esconde títulos: '+count);
  await page.locator('.trophy-unit').first().locator('img').evaluate(img=>new Promise((resolve,reject)=>{
    if(img.complete)return img.naturalWidth>0?resolve():reject(new Error('Trofeo no cargado'));
    img.addEventListener('load',()=>resolve(),{once:true});
    img.addEventListener('error',()=>reject(new Error('PNG FM no cargó')),{once:true});
  }));
  const art=await page.locator('.trophy-unit').first().locator('img').evaluate(img=>({src:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight}));
  if(!art.src.includes('/fm/102415.png')||art.width<30)throw Error('No se cargó el trofeo del ZIP original para Libertadores: '+JSON.stringify(art));

  const rail=await page.locator('.trophy-showcase').evaluate(el=>({height:el.getBoundingClientRect().height,scroll:el.querySelector('.trophy-grid').scrollWidth,view:el.querySelector('.trophy-grid').clientWidth}));
  if(rail.height>138)throw Error('La vitrina excede el tamaño compacto: '+rail.height);
  // Medidas reales: ni borde de tarjeta ni icono recortado, nombre bajo el PNG.
  const cards=await page.locator('.trophy-unit').evaluateAll(nodes=>nodes.slice(0,9).map(el=>{
    const img=el.querySelector('.trophy-unit-art img');
    const name=el.querySelector('.trophy-unit-name');
    const card=el.getBoundingClientRect(),picture=img.getBoundingClientRect(),label=name?.getBoundingClientRect();
    const cs=getComputedStyle(el);
    return {border:parseFloat(cs.borderTopWidth),background:cs.backgroundColor,
      imageTop:picture.top, imageBottom:picture.bottom,imageLeft:picture.left,imageRight:picture.right,
      cardTop:card.top,cardBottom:card.bottom,cardLeft:card.left,cardRight:card.right,
      labelTop:label?.top,labelBottom:label?.bottom,name:name?.textContent?.trim(),imageHeight:picture.height};
  }));
  for(const c of cards){
    if(c.border!==0||c.background!=='rgba(0, 0, 0, 0)')throw Error('Trofeo conserva tarjeta o borde: '+JSON.stringify(c));
    if(!c.name||c.imageHeight<35)throw Error('Trofeo sin nombre o icono demasiado pequeño: '+JSON.stringify(c));
    if(c.imageTop<c.cardTop-1||c.imageBottom>c.cardBottom+1||c.imageLeft<c.cardLeft-1||c.imageRight>c.cardRight+1)throw Error('PNG cortado por su casilla: '+JSON.stringify(c));
    if(c.labelTop<c.imageBottom-1||c.labelBottom>c.cardBottom+1)throw Error('Nombre no está debajo del trofeo o está cortado: '+JSON.stringify(c));
  }
  if(process.env.SHOTS)await page.screenshot({path:process.env.SHOTS+'/trophy-rail-'+width+'.png'});

  if(rail.scroll<=rail.view)throw Error('No hay desplazamiento horizontal para las copas');
  if(!await page.getByRole('button',{name:/Copa Libertadores/}).count())throw Error('Nombre no accesible en tarjeta');
  await page.locator('.trophy-unit').first().click();
  const dialog=page.locator('dialog.trophy-spotlight');
  await dialog.waitFor();
  if(!await dialog.getByText('Copa Libertadores').count())throw Error('Falta el nombre de la copa');
  if(!await dialog.getByText('2045').count())throw Error('No figura el año');
  if(!await dialog.locator('.trophy-detail-facts strong').last().innerText())throw Error('Falta el club');
  if(errors.length)throw Error(errors.join(' | '));
  if(process.env.SHOTS)await page.screenshot({path:process.env.SHOTS+'/trophies-'+width+'.png'});
  await page.keyboard.press('Escape');
  // dialog.close() dispara el evento close asíncrono: esperar eliminación real.
  await dialog.waitFor({state:'detached',timeout:5000});
  console.log(width+'x'+height+': vitrina compacta con '+count+' títulos, ficha y cierre verificados');
  await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
