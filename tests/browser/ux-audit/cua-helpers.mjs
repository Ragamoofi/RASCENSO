// Run only inside cua_repl; all browser operations use its documented Tab API.
import * as fs from 'node:fs/promises';
export const viewports=['1920x1080','1600x900','1366x768','1280x720','768x1024','390x844','360x800'];
export async function session(tab,output,folder='/home/oai/share/ux-captures'){
 let rows=JSON.parse(await fs.readFile(folder+'/metrics.json','utf8'));
 const prepare=async(version,screen)=>{
  await tab.playwright.locator('#version').selectOption(version);
  await tab.playwright.locator('#screen').selectOption(screen);
  await tab.playwright.locator('#load').click();
  await tab.getAXState({emit:false});
 };
 const ready=async(screen)=>{
  for(let i=0;i<100;i++){
   await tab.getAXState({emit:false});
   const value=await tab.playwright.locator('#metrics').textContent();
   if(value&&JSON.parse(value).ready===screen)return;
  }
  throw Error('Audit screen did not become ready: '+screen);
 };
 const capture=async(version,screen,viewport)=>{
  await tab.playwright.locator('#viewport').selectOption(viewport);
  await tab.playwright.locator('#measure').click();
  await tab.playwright.locator('#top').click();
  await tab.getAXState({emit:false});
  await tab.playwright.locator('#measure').click();
  const initial=JSON.parse(await tab.playwright.locator('#metrics').textContent());
  if(initial.ready!==screen)throw Error('Wrong audit screen '+initial.ready);
  const tiles=[];let row=initial;
  for(let i=0;i<30;i++){
   const file=version+'-'+screen+'-'+viewport+'-'+i+'.jpg';
   await fs.writeFile(folder+'/'+file,await tab.screenshot({fullPage:false}));
   tiles.push({file,scrollTop:row.scrollTop});
   if(row.scrollTop+row.clientHeight>=row.scrollHeight-2)break;
   await tab.playwright.locator('#next').click();
   await tab.getAXState({emit:false});
   await tab.playwright.locator('#measure').click();
   row=JSON.parse(await tab.playwright.locator('#metrics').textContent());
  }
  initial.tiles=tiles;
  rows=rows.filter(r=>!(r.version===version&&r.screen===screen&&r.viewport===viewport));rows.push(initial);
  await fs.writeFile(folder+'/metrics.json',JSON.stringify(rows,null,2));
  output.write({screen,viewport,doc:initial.documentHeight,action:initial.action?.top,visible:initial.actionVisible,overflow:initial.horizontalOverflow,tiles:tiles.length});
  return initial;
 };
 const batch=async(version,screen,widths=viewports)=>{
  await prepare(version,screen);await ready(screen);
  for(const viewport of widths)await capture(version,screen,viewport);
 };
 return {prepare,ready,capture,batch};
}
