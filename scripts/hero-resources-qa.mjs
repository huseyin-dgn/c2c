import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
  window.__gpuDeletes={buffers:0,textures:0,programs:0};
  window.__documentId=Math.random();
  for(const [name,key] of [['deleteBuffer','buffers'],['deleteTexture','textures'],['deleteProgram','programs']]){
    const original=WebGL2RenderingContext.prototype[name];
    WebGL2RenderingContext.prototype[name]=function(...args){window.__gpuDeletes[key]++;return original.apply(this,args);};
  }
});
const report={errors,cycles:[],passed:false};
try{
  await page.goto(process.env.TEST_BASE_URL||'http://localhost:3100',{waitUntil:'networkidle'});
  report.documentId=await page.evaluate(()=>window.__documentId);report.memory=[];
  for(let i=0;i<3;i++){
    await page.locator('.story canvas[data-model="motherboard-processor"]').waitFor();
    await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);
    report.memory.push(await page.locator('.story canvas').evaluate(c=>({programs:Number(c.dataset.programs),geometries:Number(c.dataset.geometries),textures:Number(c.dataset.textures)})));
    await page.getByRole('link',{name:'Projenizi Anlatın',exact:true}).first().click();
    await page.waitForURL('**/iletisim');await page.waitForTimeout(600);
    assert.equal(await page.locator('.pin-spacer').count(),0,'all Hero triggers/pins removed on navigation');
    let counts=await page.evaluate(()=>window.__gpuDeletes);
    report.observed=counts;
    const previous=report.cycles.at(-1)||{buffers:0,textures:0,programs:0};
    await page.waitForFunction(previous=>Object.keys(previous).every(key=>window.__gpuDeletes[key]>previous[key]),previous,{timeout:7000});
    counts=await page.evaluate(()=>window.__gpuDeletes);
    assert.equal(await page.evaluate(()=>window.__documentId),report.documentId,'client-side navigation keeps the same instrumentation');
    for(const key of ['buffers','textures','programs'])assert.ok(counts[key]>previous[key],`${key} actually deleted on unmount`);
    report.cycles.push(counts);await page.goBack({waitUntil:'networkidle'});
  }
  for(const sample of report.memory)for(const key of ['programs','geometries','textures'])assert.ok(sample[key]<=report.memory[0][key]+2,`${key} remain bounded across route cycles`);
  await page.locator('.story canvas[data-model]').waitFor();
  await page.setViewportSize({width:375,height:812});await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>Boolean(document.querySelector('.story canvas[data-model]'))||[...document.querySelectorAll('.story .processor-poster')].some(p=>getComputedStyle(p).visibility==='visible'&&getComputedStyle(p).display!=='none')),true,'resize keeps a live scene or its poster visible');
  await page.evaluate(()=>scrollTo(0,12));await page.locator('.story canvas[data-model]').waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.story .core-fallback').waitFor();
  assert.equal(await page.locator('.story canvas').count(),0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.story canvas[data-model]').waitFor();
  assert.equal(await page.locator('.story > .pin-spacer').count(),1);
  assert.deepEqual(errors,[]);report.passed=true;
}catch(error){report.error=error.stack;process.exitCode=1;}
finally{await fs.writeFile('artifacts/processor/resources.json',JSON.stringify(report,null,2));console.log(report);await browser.close();}
