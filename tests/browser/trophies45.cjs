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
  const rail=await page.locator('.trophy-showcase').evaluate(el=>({height:el.getBoundingClientRect().height,scroll:el.querySelector('.trophy-grid').scrollWidth,view:el.querySelector('.trophy-grid').clientWidth}));
  if(rail.height>99)throw Error('Se agrandó la vitrina: '+rail.height);
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
  if(await dialog.count())throw Error('La ficha no se cierra con Escape');
  console.log(width+'x'+height+': vitrina compacta con '+count+' títulos, ficha y cierre verificados');
  await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
