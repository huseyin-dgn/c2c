/* global document, window */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
const output=path.resolve(process.env.TEST_ARTIFACT_DIR||'artifacts/industrial-premium/safety');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,checks:[],errors:[],viewports:[],passed:false};
const attach=page=>{page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});};
const safety=page=>page.locator('.safety-scene').evaluate(e=>({...e.dataset}));
const check=async(page,index)=>{
  assert.equal(await page.locator('#problemden-cozume').getAttribute('data-pipeline-stage'),String(index));
  const state=await safety(page);
  assert.equal(state.safetyDetected,String(index>0));assert.equal(state.safetyInside,String(index>=2));
  assert.equal(state.safetyAlert,String(index>=3));assert.equal(state.safetyRecorded,String(index===4));
  assert.equal(await page.locator('.pipeline-navigation button').nth(index).getAttribute('aria-pressed'),'true');
  const visible=await page.locator('.problem-copy').innerText();assert.ok(!visible.includes('�'));assert.ok(!visible.includes('?'));
};
try {
  const desktop=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
  const page=await desktop.newPage();attach(page);await page.goto(base,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>Number(document.querySelector('#problemden-cozume')?.dataset.pipelineEnd)>0);
  const seek=async(index)=>{
    const p=(index+.5)/5;
    await page.locator('#problemden-cozume').evaluate((e,p)=>window.scrollTo({top:Number(e.dataset.pipelineStart)+(Number(e.dataset.pipelineEnd)-Number(e.dataset.pipelineStart))*p,behavior:'instant'}),p);
    await page.waitForFunction(index=>Number(document.querySelector('#problemden-cozume')?.dataset.pipelineStage)===index,index);
    await page.waitForTimeout(120);await check(page,index);
  };
  for(const index of [0,1,2,3,4,3,2,1,0]) {
    await seek(index);
    if(index===1||index===3||index===4)await page.screenshot({path:path.join(output,`desktop-stage-${index+1}.png`)});
  }
  const bounds=await page.locator('.pipeline-navigation').boundingBox();assert.ok(bounds.y+bounds.height<=902,'all five controls fit the pinned desktop viewport');
  await page.locator('.pipeline-navigation button').nth(4).focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('#problemden-cozume')?.dataset.pipelineStage==='4');await check(page,4);
  report.checks.push('desktop: five stages, reverse scroll, region crossing, rule/notification timing and keyboard controls');
  report.viewports.push({width:1440,navigationBottom:bounds.y+bounds.height});await desktop.close();
  for(const width of [393,320]) {
    const context=await browser.newContext({viewport:{width,height:850},hasTouch:true,reducedMotion:'no-preference'});
    const page=await context.newPage();attach(page);await page.goto(base,{waitUntil:'networkidle'});
    for(const index of [0,1,2,3,4,1]) {await page.locator('.pipeline-navigation button').nth(index).tap();await check(page,index);}
    for(const index of [1,4]) {
      await page.locator('.pipeline-navigation button').nth(index).tap();
      await page.locator('#problemden-cozume').screenshot({path:path.join(output,`mobile-${width}-stage-${index+1}.png`)});
    }
    const layout=await page.locator('#problemden-cozume').evaluate(root=>({width:window.innerWidth,overflow:[...root.querySelectorAll('.problem-layout,.safety-scene,.problem-copy,.pipeline-navigation')].some(e=>e.getBoundingClientRect().right>window.innerWidth+.5||e.getBoundingClientRect().left<-.5),minTarget:Math.min(...[...root.querySelectorAll('button')].map(e=>e.getBoundingClientRect().height))}));
    assert.equal(layout.overflow,false);assert.ok(layout.minTarget>=44);report.viewports.push(layout);
    report.checks.push(`${width}px: all five stages, touch targets, camera/worker imagery and no horizontal overflow`);await context.close();
  }
  const reduced=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),rp=await reduced.newPage();attach(rp);
  await rp.goto(base,{waitUntil:'networkidle'});
  for(const index of [4,0,2,3]){await rp.locator('.pipeline-navigation button').nth(index).click();await check(rp,index);}
  const state=await safety(rp);await rp.waitForTimeout(300);assert.deepEqual(await safety(rp),state);
  assert.equal(await rp.locator('#problemden-cozume').getAttribute('data-pipeline-start'),null);
  await rp.locator('#problemden-cozume').screenshot({path:path.join(output,'reduced-motion.png')});
  report.checks.push('reduced-motion: manual stages, no pinning or automatic scene clock');await reduced.close();
  for(const name of ['factory-safety.webp','safety-worker.webp']){const response=await fetch(`${base}/images/experiences/${name}`);assert.equal(response.status,200);}
  assert.deepEqual(report.errors,[]);report.passed=true;
} finally {await browser.close();await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
