import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const before=process.argv.includes('--before'),base=process.env.BASE_URL||'http://localhost:3100';
const root='artifacts/hero-finale',dir=`${root}/${before?'before':'after'}`;
await fs.mkdir(dir,{recursive:true});
const duration=1.15,closed=1/duration,retreat=1.02/duration;
const checkpoints=[0,.3,.6,.8,.9,1];
const points=[...new Set([...checkpoints,.1,.2,.4,.5,.7,.75,.82,.84,.86,closed,retreat,.88,.89,.92,.94,.96,.98])].sort((a,b)=>a-b);
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={before,base,browser:browser.version(),viewports:[],passed:false};
try{
  for(const [width,height] of [[375,812],[768,1024],[1440,900],[1920,1080]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/?measure=1`,{waitUntil:'networkidle'});
    if(width<1024)await page.evaluate(()=>scrollTo(0,12));
    await page.locator('.story canvas[data-projection]').waitFor({timeout:60000});
    const seek=async p=>{
      await page.evaluate(p=>{
        const r=document.querySelector('.story'),start=r.getBoundingClientRect().top+scrollY;
        scrollTo({top:start+(r.offsetHeight-innerHeight)*p,behavior:'instant'});
      },p);
      await page.waitForFunction(p=>Math.abs(Number(document.querySelector('.story').dataset.progress)-p)<.001,p);
      await page.waitForTimeout(250);
      return page.locator('.story canvas').evaluate(c=>({progress:Number(document.querySelector('.story').dataset.progress),...JSON.parse(c.dataset.projection),layers:c.dataset.layers.split(',').map(Number),lift:Number(c.dataset.packageLift),assemblyProgress:Number(c.dataset.assemblyProgress),pullback:Number(c.dataset.pullback),drawCalls:Number(c.dataset.drawCalls),triangles:Number(c.dataset.triangles)}));
    };
    const samples=[],reverse=[];
    for(const p of points){
      const sample=await seek(p);samples.push({requested:p,...sample});
      if(checkpoints.includes(p))await page.screenshot({path:`${dir}/${width}-${Math.round(p*100)}.png`});
    }
    for(const p of [...points].reverse()){
      const sample=await seek(p);reverse.push({requested:p,...sample});
      const forward=samples.find(s=>s.requested===p);
      assert.ok(Math.abs(sample.footprint.width-forward.footprint.width)<.4,'reverse size');
      assert.ok(Math.abs(sample.distance-forward.distance)<.004,'reverse distance');
      assert.ok(Math.abs(sample.footprint.centerX-forward.footprint.centerX)<.4,'reverse centre');
    }
    if(!before){
      const close=samples.filter(s=>s.requested>=.3&&s.requested<=retreat),distances=close.map(s=>s.distance);
      assert.ok(Math.max(...distances)-Math.min(...distances)<.004,'no retreat before completed lid closure and hold');
      const finish=samples.filter(s=>s.requested>retreat);
      let previous=close.at(-1).distance,previousWidth=close.at(-1).footprint.width;
      for(const s of finish){
        assert.ok(s.layers.every(v=>Math.abs(v)<.0001)&&s.lift===0,'all layers seated before any retreat');
        assert.ok(s.distance>=previous-.004,'single monotonic pullback');
        assert.ok(s.footprint.width<=previousWidth+.4,'no second approach in final shot');
        previous=s.distance;previousWidth=s.footprint.width;
      }
      const first=samples[0],last=samples.at(-1);
      for(const key of ['width','height','centerX','centerY'])assert.ok(Math.abs(first.footprint[key]-last.footprint[key])<.4,'opening/final framing matches');
      assert.ok(Math.abs(first.distance-last.distance)<.004,'restored starting camera distance');
      assert.equal(new Set(samples.map(s=>s.fov)).size,1);assert.equal(new Set(samples.map(s=>s.zoom)).size,1);
      assert.equal(new Set(samples.map(s=>s.modelScale.map(v=>v.toFixed(5)).join(','))).size,1);
      // Matched assembly poses isolate the lighting change from camera timing.
      await seek(.6/duration);await page.screenshot({path:`${dir}/${width}-matched-open.png`});
      await seek(closed);await page.screenshot({path:`${dir}/${width}-closed-before-pullback.png`});
      for(const s of samples){
        assert.ok(s.footprint.left>=-1&&s.footprint.right<=width+1,'CPU fits the viewport horizontally');
        assert.ok(s.footprint.top>=0&&s.footprint.bottom<=height,'CPU fits vertically');
      }
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow');
    assert.deepEqual(errors,[]);report.viewports.push({width,height,samples,reverse,errors});await page.close();
  }
  report.passed=true;
}catch(error){report.error=error.stack;process.exitCode=1;}
finally{await fs.writeFile(`${dir}/browser.json`,JSON.stringify(report,null,2));console.log({before,passed:report.passed,viewports:report.viewports.length,error:report.error});await browser.close();}
