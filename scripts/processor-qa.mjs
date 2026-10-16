import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const baseline=process.argv.includes('--before');
const base=process.env.BASE_URL||'http://localhost:3100';
const dir=`artifacts/processor/${baseline?'before':'after'}`;
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const measurements=[];
const sameLayers=(a,b)=>a.split(',').every((v,i)=>Math.abs(Number(v)-Number(b.split(',')[i]))<.0001);
const sequenceDuration=1.15;
try{
for(const [width,height] of [[375,812],[768,1024],[1440,900],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  if(!baseline&&width<1024){
    await page.waitForFunction(()=>document.querySelector('.story')?.dataset.renderer==='poster');
    assert.equal(await page.locator('.story canvas').count(),0,'mobile first paint uses the real-scene poster');
    assert.equal(await page.locator('.story .processor-poster img').evaluate(i=>i.complete&&i.naturalWidth>0),true);
    assert.equal(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>/motherboard\/.*glb|processor\/geometry/.test(r.name))),false,'mobile model is not fetched before intent');
    await page.screenshot({path:`${dir}/${width}-poster.png`});
    await page.evaluate(()=>scrollTo(0,12));
  }
  await page.locator('.story canvas[data-camera]').waitFor({timeout:60000});
  if(baseline)await page.locator('.motion-toggle').click();
  const stages=[];
  for(const p of [0,.25/sequenceDuration,.5/sequenceDuration,.75/sequenceDuration,1,.75/sequenceDuration,.5/sequenceDuration,.25/sequenceDuration,0]){
    await page.evaluate(p=>{const r=document.querySelector('.story');window.scrollTo(0,r.getBoundingClientRect().top+scrollY+(r.offsetHeight-innerHeight)*p);},p);
    await page.waitForTimeout(1100);
    const data=await page.locator('.story canvas').evaluate(c=>({...c.dataset}));
    stages.push({progress:p,...data});
    if(stages.length<=5)await page.screenshot({path:`${dir}/${width}-${p*100}.png`});
  }
  assert.equal(stages[0].camera,stages.at(-1).camera,'reverse camera');
  assert.equal(stages[0].separation,stages.at(-1).separation,'reverse separation');
  if(!baseline){
    assert.ok(sameLayers(stages[0].layers,stages[4].layers),'reassembly local coordinates');
    assert.ok(sameLayers(stages[0].layers,stages.at(-1).layers),'reverse local coordinates');
    assert.equal(stages[2].separation,'1.000');
    assert.equal(stages[2].model,'motherboard-processor');
    assert.ok(Number(stages[2].drawCalls)<40,'limited draw calls');
    // Allow font/layout refresh and the existing GSAP scrub to settle. Require a
    // full second without a WebGL frame; fail if a continuous loop remains.
    await page.locator('.story canvas').evaluate(c=>new Promise((resolve,reject)=>{
      let last=c.dataset.frames,stable=0;const start=performance.now();
      const timer=setInterval(()=>{const now=c.dataset.frames;stable=now===last?stable+1:0;last=now;if(stable>=5){clearInterval(timer);resolve();}else if(performance.now()-start>8000){clearInterval(timer);reject(new Error('WebGL keeps rendering while idle'));}},200);
    }));
    await page.evaluate(p=>{const r=document.querySelector('.story');scrollTo(0,r.getBoundingClientRect().top+scrollY+(r.offsetHeight-innerHeight)*p);},.93/sequenceDuration);await page.waitForTimeout(1100);
    const closing=await page.locator('.story canvas').evaluate(c=>({layers:c.dataset.layers.split(',').map(Number),lift:Number(c.dataset.packageLift)}));
    assert.ok(closing.layers[0]>.1&&closing.layers.slice(2).every(v=>Math.abs(v)<.0001)&&closing.lift<.0001,'package seats before the lid closes');
    await page.screenshot({path:`${dir}/${width}-reassembly-before-lid.png`});
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow');
  assert.deepEqual(errors,[]);
  measurements.push({width,height,stages,errors});await page.close();
}
if(!baseline){
  for(const mode of ['reduced','denied','lost']){
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    if(mode==='denied')await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args);};});
    await page.goto(base,{waitUntil:'networkidle'});
    if(mode==='lost'){
      await page.locator('.story canvas[data-model]').waitFor();
      await page.locator('.story canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    }
    await page.locator('.story .core-fallback').waitFor();
    assert.equal(await page.locator('.story canvas').count(),0);
    await page.screenshot({path:`${dir}/${mode}.png`});await page.close();
  }
}
await fs.writeFile(`${dir}/browser.json`,JSON.stringify(measurements,null,2));
console.log(`${baseline?'Before':'After'}: four viewports, five stages and reverse verified${baseline?'':'; idle, reduced motion, WebGL denied and context loss verified'}.`);
}finally{await browser.close();}
