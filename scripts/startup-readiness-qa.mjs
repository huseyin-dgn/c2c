/* global document, window, getComputedStyle, scrollTo, scrollY, innerHeight */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const base=process.env.TEST_BASE_URL||'http://localhost:3100';
const output=process.env.TEST_ARTIFACT_DIR||path.join(os.tmpdir(),'c2c-startup-readiness');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const report={checks:[],errors:[],hardwareReentry:[]};
const focus=(page,id)=>page.locator(id).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));
const ready=(page,selector)=>page.waitForFunction(selector=>{const c=document.querySelector(selector);return c?.dataset.sceneReady==='true'&&getComputedStyle(c).visibility==='visible'},selector,{timeout:45000});
try{
  // A genuinely pending motherboard must never expose the other 3D parts.
  for(const width of [393,320]){
    const page=await browser.newPage({viewport:{width,height:900},hasTouch:true});
    page.on('pageerror',error=>report.errors.push(error.message));
    let release,requested;
    const gate=new Promise(resolve=>{release=resolve}),requestSeen=new Promise(resolve=>{requested=resolve});
    await page.route('**/models/motherboard/mobile.glb.gz',async route=>{requested();await gate;await route.continue();});
    try{
      await page.goto(base,{waitUntil:'networkidle'});
      assert.equal(await page.locator('.story canvas').count(),0);
      assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/images/experiences/'))),false);
      await focus(page,'#donanim');await requestSeen;
      await page.waitForSelector('.hardware-viewport canvas',{state:'attached'});
      await page.waitForTimeout(150);
      assert.equal(await page.locator('.hardware-viewport canvas').evaluate(c=>getComputedStyle(c).visibility),'hidden');
      assert.equal(await page.locator('.hardware-viewport canvas[data-hardware-frame]').count(),0);
      assert.equal(await page.locator('.hardware-viewport [role=status]').isVisible(),true);
      release();await ready(page,'.hardware-viewport canvas');await page.waitForTimeout(1500);
      const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/models/')).map(r=>new URL(r.name).pathname));
      assert.equal(resources.some(name=>/processor\/(geometry|studio-env|metal-color|silicon-color|substrate-color)/.test(name)),false);
      await page.locator('.hardware-viewport').screenshot({path:path.join(output,'hardware-'+width+'.png')});
      await page.locator('[data-hardware-button=gpu]').tap();
      await page.locator('.hardware-controls button').first().tap();
      await page.waitForFunction(()=>Number(document.querySelector('.hardware-viewport canvas').dataset.explosion)>.99);
      await page.locator('.hardware-controls button').nth(2).tap();await page.waitForTimeout(1200);
      await page.locator('.hardware-viewport canvas').evaluate(c=>{window.__hardwareCanvas=c;});
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
      const before=await page.locator('.hardware-viewport canvas').getAttribute('data-hardware-frame');await page.waitForTimeout(200);
      assert.equal(await page.locator('.hardware-viewport canvas').getAttribute('data-hardware-frame'),before);
      const start=await page.evaluate(()=>performance.now());await focus(page,'#donanim');
      await page.waitForFunction(frame=>document.querySelector('.hardware-viewport canvas').dataset.hardwareFrame!==frame,before);
      const elapsed=await page.evaluate(start=>performance.now()-start,start);
      assert.equal(await page.locator('.hardware-viewport canvas').evaluate(c=>c===window.__hardwareCanvas),true);
      report.hardwareReentry.push({width,ms:elapsed});
      await page.locator('.hardware-controls button').nth(1).tap();
      await focus(page,'#problemden-cozume');await page.waitForFunction(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('factory-safety.webp')));
      const images=await page.locator('.safety-scene image').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));assert.ok(images.every(Boolean));
      await page.locator('.pipeline-navigation button').nth(3).tap();
      assert.equal(await page.locator('.safety-scene').getAttribute('data-safety-alert'),'true');
      await page.locator('.pipeline-navigation button').nth(0).tap();
      assert.equal(await page.locator('.safety-scene').getAttribute('data-safety-alert'),'false');
      report.checks.push(width+'px: pending textures hidden, complete model, no unused Hero assets, controls, offscreen stop, same Canvas on return, deferred safety images and alert');
    }finally{release();await page.close();}
  }
  // Scrolling before hydration must not be shifted by the inserted pin spacer.
  const early=await browser.newPage({viewport:{width:393,height:900}});
  await early.route('**/_next/static/chunks/*.js',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.continue();});
  await early.goto(base,{waitUntil:'domcontentloaded'});
  await early.evaluate(()=>scrollTo(0,120));await ready(early,'.story canvas');
  assert.ok(Math.abs(await early.evaluate(()=>scrollY)-120)<2);
  assert.ok(await early.locator('.story canvas').evaluate(c=>Number(c.dataset.assemblyProgress)<.1));
  report.checks.push('early scroll before hydration stays at 120px instead of skipping the Hero');await early.close();
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(base,{waitUntil:'networkidle'});await ready(page,'.story canvas');
  const poses=[];
  for(const progress of [0,.5,1,.5,0]){
    await page.locator('.story').evaluate((e,p)=>scrollTo(0,(e.offsetHeight-innerHeight)*p),progress);await page.waitForTimeout(1000);
    poses.push(await page.locator('.story canvas').evaluate(c=>({camera:c.dataset.camera,layers:c.dataset.layers,drawCalls:Number(c.dataset.drawCalls),textures:Number(c.dataset.textures)})));
  }
  assert.deepEqual(poses[0],poses[4]);assert.ok(poses[0].drawCalls<40);
  await page.waitForTimeout(1000);const frame=await page.locator('.story canvas').getAttribute('data-frames');await page.waitForTimeout(350);assert.equal(await page.locator('.story canvas').getAttribute('data-frames'),frame);
  await page.getByRole('link',{name:'Projenizi Anlatın',exact:true}).first().click();await page.waitForURL('**/iletisim');await page.goBack({waitUntil:'networkidle'});await ready(page,'.story canvas');
  await page.setViewportSize({width:393,height:900});await page.waitForTimeout(700);await page.evaluate(()=>scrollTo(0,12));await ready(page,'.story canvas');
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.story .core-fallback').waitFor();assert.equal(await page.locator('.story canvas').count(),0);
  await page.emulateMedia({reducedMotion:'no-preference'});await ready(page,'.story canvas');
  report.checks.push('desktop: full sequence and reverse, preserved pose, demand-render idle, route return, resize and reduced-motion return');
  report.gpu=await page.locator('.story canvas').evaluate(c=>{const gl=c.getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unavailable',textures:c.dataset.textures,triangles:c.dataset.triangles};});
  await page.close();assert.deepEqual(report.errors,[]);
}finally{await browser.close();await fs.writeFile(path.join(output,'readiness.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));

