/* global document, window */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const output=process.env.TEST_ARTIFACT_DIR||path.join(os.tmpdir(),'c2c-industrial-vision');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={checks:[],errors:[],screenshots:[],performance:[]};
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
const attach=page=>{page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});};
const focus=page=>page.locator('#kamera-deneyimi').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+window.scrollY-120,behavior:'instant'}));
const shot=async(page,name,selector='.vision-layout')=>{const file=path.join(output,`${name}.png`);await page.locator(selector).screenshot({path:file});report.screenshots.push(file);};
const fullShot=async(page,name)=>{
  const viewport=page.viewportSize(),height=Math.ceil(await page.locator('#kamera-deneyimi').evaluate(e=>e.getBoundingClientRect().height))+120;
  await page.setViewportSize({...viewport,height});await focus(page);
  await page.waitForSelector('.vision-station canvas[data-vision-time]');await page.waitForTimeout(250);
  await shot(page,name,'#kamera-deneyimi');
  await page.setViewportSize(viewport);await focus(page);await page.waitForSelector('.vision-station canvas[data-vision-time]');
};
const state=page=>page.locator('#kamera-deneyimi').evaluate(e=>({...e.dataset}));
const waitTime=(page,t)=>page.waitForFunction(t=>Number(document.querySelector('#kamera-deneyimi')?.dataset.visionTime)>=t,t,{timeout:35000});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1050},reducedMotion:'no-preference'});
  const page=await context.newPage();attach(page);await page.goto(base+'/#kamera-deneyimi',{waitUntil:'networkidle',timeout:90000});await focus(page);
  await page.waitForSelector('.vision-station canvas[data-vision-frame]',{timeout:60000});
  await page.locator('.vision-start').click();await waitTime(page,5.8);await page.locator('.vision-start').click();
  const paused=await state(page),canvasTime=await page.locator('.vision-station canvas').getAttribute('data-vision-time');
  assert.ok(Math.abs(Number(paused.visionTime)-Number(canvasTime))<.001,'pause publishes the exact rendered clock');
  await page.waitForTimeout(350);assert.deepEqual(await state(page),paused);assert.equal(await page.locator('.vision-station canvas').getAttribute('data-vision-time'),canvasTime);
  assert.equal(paused.visionInspection,'P-0002');assert.equal(await page.locator('.vision-capture').getAttribute('data-defect'),'scratch');
  assert.equal(await page.locator('[data-vision-annotation]').count(),1);await shot(page,'desktop-inspection');await fullShot(page,'desktop-section');report.checks.push('desktop capture, defect marker, product ID and coherent pause');
  await page.locator('.vision-start').click();await waitTime(page,9.98);await page.locator('.vision-start').click();
  assert.equal((await state(page)).visionActuator,'P-0002');assert.equal(await page.locator('.vision-station canvas').getAttribute('data-vision-actuator'),'P-0002');
  await shot(page,'desktop-reject');report.checks.push('pusher targets P-0002 while the camera can inspect the next product');
  await page.locator('.vision-start').click();
  const first=await page.locator('.vision-station canvas').evaluate(e=>({frame:Number(e.dataset.visionFrame),wall:performance.now()}));
  await waitTime(page,12.4);
  const second=await page.locator('.vision-station canvas').evaluate(e=>({frame:Number(e.dataset.visionFrame),wall:performance.now(),calls:Number(e.dataset.visionDrawCalls),triangles:Number(e.dataset.visionTriangles)}));
  report.performance.push({viewport:1440,observedRenderFps:Math.round((second.frame-first.frame)*1000/(second.wall-first.wall)),drawCalls:second.calls,triangles:second.triangles});
  assert.ok(second.calls<250&&second.triangles<100000,'bounded scene geometry and draw budget');
  const completed=await state(page);assert.equal(completed.visionPassed,'1');assert.equal(completed.visionRejected,'1');assert.ok(Number(completed.visionInspected)>=4);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('#kamera-deneyimi')?.dataset.visionRunning==='false');
  const hidden=await state(page);await page.waitForTimeout(400);assert.equal((await state(page)).visionTime,hidden.visionTime);await focus(page);
  await page.waitForFunction(()=>document.querySelector('#kamera-deneyimi')?.dataset.visionRunning==='true');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>document.querySelector('#kamera-deneyimi')?.dataset.visionRunning==='false');
  const tabHidden=await state(page);await page.waitForTimeout(350);assert.equal((await state(page)).visionTime,tabHidden.visionTime);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>document.querySelector('#kamera-deneyimi')?.dataset.visionRunning==='true');
  await page.locator('.vision-start').click();await page.waitForTimeout(250);
  const idle1=await page.locator('.vision-station canvas').getAttribute('data-vision-frame');await page.waitForTimeout(300);assert.equal(await page.locator('.vision-station canvas').getAttribute('data-vision-frame'),idle1);
  report.checks.push('terminal counters, offscreen suspension, document-hidden event, resume and idle demand-render');
  await page.locator('.vision-reset').click();const reset=await state(page);assert.equal(reset.visionTime,'0.000');assert.equal(reset.visionInspected,'0');assert.equal(reset.visionRejected,'0');assert.equal(reset.visionPassed,'0');assert.equal(reset.visionInspection,'none');
  for(const scenario of ['missing','alignment']){
    const button=page.locator('.vision-scenarios button').nth(scenario==='missing'?1:2);await button.focus();await page.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'true');
    await page.locator('.vision-start').click();await waitTime(page,5.8);await page.locator('.vision-start').click();
    assert.equal(await page.locator('.vision-capture').getAttribute('data-defect'),scenario);
    assert.equal(await page.locator('[data-mounting-hole]').count(),scenario==='missing'?3:4);
    await shot(page,`desktop-${scenario}`);
  }
  const beforeView=await state(page);await page.locator('.vision-view-switch button').nth(1).click();
  await page.waitForFunction(()=>document.querySelector('.vision-station canvas')?.dataset.visionView==='detail');
  assert.equal((await state(page)).visionTime,beforeView.visionTime);await shot(page,'desktop-camera-detail','.vision-station-wrap');
  await page.locator('.vision-view-switch button').first().click();
  report.checks.push('all scenarios differ in geometry/analysis; keyboard selection, reset and camera detail view work');await context.close();
  for(const width of [393,320]){
    const context=await browser.newContext({viewport:{width,height:850},hasTouch:true,reducedMotion:'no-preference'}),page=await context.newPage();attach(page);
    await page.goto(base+'/#kamera-deneyimi',{waitUntil:'networkidle',timeout:90000});await focus(page);await page.waitForSelector('.vision-station canvas[data-vision-time]');
    await page.locator('.vision-start').tap();await waitTime(page,5.8);await page.locator('.vision-start').tap();await shot(page,`mobile-${width}`);await fullShot(page,`mobile-${width}-section`);
    const layout=await page.locator('#kamera-deneyimi').evaluate(root=>({viewport:window.innerWidth,overflows:[...root.querySelectorAll('.vision-layout,.vision-toolbar,.vision-analysis,.vision-records')].some(e=>e.getBoundingClientRect().right>window.innerWidth+.5||e.getBoundingClientRect().left<-.5),minTarget:Math.min(...[...root.querySelectorAll('button')].map(e=>e.getBoundingClientRect().height))}));
    assert.equal(layout.overflows,false);assert.ok(layout.minTarget>=44);await page.locator('.vision-reset').tap();assert.equal((await state(page)).visionInspected,'0');
    const beforeDetail=await state(page);await page.locator('.vision-view-switch button').nth(1).tap();
    await page.waitForFunction(()=>document.querySelector('.vision-station canvas')?.dataset.visionView==='detail');
    assert.equal((await state(page)).visionTime,beforeDetail.visionTime);await shot(page,`mobile-${width}-detail`,'.vision-station-wrap');
    await page.locator('.vision-view-switch button').first().tap();
    report.checks.push(`${width}px: scene, readable camera panel, touch controls, 44px targets, no section overflow`);await context.close();
  }
  const reduced=await browser.newContext({viewport:{width:393,height:850},hasTouch:true,reducedMotion:'reduce'}),rp=await reduced.newPage();attach(rp);
  await rp.goto(base+'/#kamera-deneyimi',{waitUntil:'networkidle',timeout:90000});await focus(rp);await rp.waitForSelector('.vision-station canvas[data-vision-time]');
  for(let i=0;i<7;i++)await rp.locator('.vision-start').tap();const stepped=await state(rp);assert.ok(Number(stepped.visionInspected)>0);
  await rp.waitForTimeout(400);assert.equal((await state(rp)).visionTime,stepped.visionTime);await shot(rp,'reduced-motion');
  for(let i=0;i<40;i++){if(await rp.locator('.vision-workflow').getAttribute('data-vision-flow')==='5')break;await rp.locator('.vision-start').tap();}
  assert.equal(await rp.locator('.vision-workflow').getAttribute('data-vision-flow'),'5');
  const latest=await rp.locator('.vision-events li strong').first().textContent();
  assert.ok((await rp.locator('.vision-flow-status').textContent()).includes(latest));
  report.checks.push('reduced-motion manual events advance without an automatic simulation clock; terminal workflow record matches the exiting product');await reduced.close();
  assert.deepEqual(report.errors,[]);report.checks.push('no browser runtime or WebGL errors');
}finally{await browser.close();await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({output,...report},null,2));
