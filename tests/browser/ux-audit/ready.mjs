const kind=new URL(location.href).searchParams.get('screen');
if(kind){
 const until=(test)=>new Promise(resolve=>{const tick=()=>{if(test())resolve();else requestAnimationFrame(tick)};tick()});
 await until(()=>document.querySelector('.site-head')&&document.querySelector('#app')?.dataset.worldReady==='1'&&document.querySelector('#app')?.dataset.worldContextReady==='1');
 const steps=['identidad','raices','futbolista','mentalidad','suenos','resumen'];
 if(steps.includes(kind))document.querySelector(`[data-action="step"][data-index="${steps.indexOf(kind)}"]`)?.click();
 if(['historial','mundo','vestuario'].includes(kind))document.querySelector(`[data-action="nav"][data-tab="${kind}"]`)?.click();
 if(kind==='ajustes')document.querySelector('[data-action="tools"]')?.click();
 if(kind==='club'){
  await until(()=>document.querySelector('.player-club .club495-name-link'));
  document.querySelector('.player-club .club495-name-link').click();
  await until(()=>document.querySelector('.club497-controls'));
 }
 if(steps.includes(kind))await until(()=>document.querySelector('.cr-main')?.dataset.step===String(steps.indexOf(kind)));
 if(kind==='verano')await until(()=>document.querySelector('.summer-wrap'));
 for(let i=0;i<12;i++){
  const next=document.querySelector('.spotlight4110-next');if(!next)break;next.click();await new Promise(r=>requestAnimationFrame(r));
 }
 if(kind.startsWith('jugada')){
  const rows=Object.values(await fetch('../qa-plays.json').then(r=>r.json()));
  const {state,play}=rows[Number(kind.slice(6))];
  const {openPlay}=await import(new URL(location.pathname.includes('/current/')?'./src/plays-ui.mjs?v=515':'./src/plays-ui.mjs?v=511',location.href).href);
  openPlay({state,play,clubName:'Tu club',onDone:()=>{},onCancel:()=>{}});
 }
 await document.fonts.ready;
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 window.scrollTo(0,0);document.querySelector('main.view')?.scrollTo(0,0);
 document.documentElement.dataset.auditReady=kind;
}
