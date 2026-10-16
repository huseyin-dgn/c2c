import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const before=process.argv.includes('--before'),base=process.env.BASE_URL||'http://localhost:3000';
const dir=`artifacts/hero-polish/${before?'before':'after'}`;await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
for(const [width,height] of [[375,812],[768,1024],[1440,900],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/?measure=1`,{waitUntil:'networkidle'});
  if(width<1024)await page.evaluate(()=>scrollTo(0,12));
  await page.locator('.story canvas[data-projection]').waitFor({timeout:60000});
  const samples=[],reverse=[];
  const seek=async p=>{
    await page.evaluate(p=>scrollTo(0,innerHeight*(innerWidth<1024?3.5:4)*p),p);await page.waitForTimeout(850);
    return await page.locator('.story canvas').evaluate(c=>({progress:Number(document.querySelector('.story').dataset.progress),...JSON.parse(c.dataset.projection),layers:c.dataset.layers,drawCalls:Number(c.dataset.drawCalls),triangles:Number(c.dataset.triangles)}));
  };
  for(let i=0;i<=20;i++){
    const p=i/20,sample=await seek(p);samples.push(sample);
    if(i%4===0)await page.screenshot({path:`${dir}/${width}-${i*5}.png`});
  }
  for(const p of [1,.8,.6,.4,.2,0]){
    const sample=await seek(p);reverse.push(sample);
    const forward=samples[Math.round(p*20)];
    assert.ok(Math.abs(sample.footprint.width-forward.footprint.width)<.25,'reverse projected size');
    assert.ok(Math.abs(sample.footprint.centerX-forward.footprint.centerX)<.25,'reverse screen centre');
  }
  if(!before){
    for(let i=1;i<=5;i++)assert.ok(samples[i].footprint.width>=samples[i-1].footprint.width*.995,'approach grows on screen');
    const close=samples.slice(8),widths=close.map(s=>s.footprint.width),areas=close.map(s=>s.footprint.area),distances=close.map(s=>s.distance);
    assert.ok(Math.max(...widths)/Math.min(...widths)<1.02,'close-up width stable within 2%');
    assert.ok(Math.max(...areas)/Math.min(...areas)<1.025,'close-up projected area stable within 2.5%');
    assert.ok(Math.max(...distances)-Math.min(...distances)<.002,'actual CPU distance held through reassembly');
    for(const axis of ['centerX','centerY']){
      const values=close.map(s=>s.footprint[axis]);
      assert.ok(Math.max(...values)-Math.min(...values)<Math.min(...widths)*.015,'close-up framing drift below 1.5% of CPU width');
    }
    assert.equal(new Set(samples.map(s=>s.fov)).size,1);assert.equal(new Set(samples.map(s=>s.zoom)).size,1);
    assert.equal(new Set(samples.map(s=>s.modelScale.map(v=>v.toFixed(6)).join(','))).size,1);
  }
  assert.deepEqual(errors,[]);results.push({width,height,samples,reverse,errors});await page.close();
}
await fs.writeFile(`${dir}/projection.json`,JSON.stringify(results,null,2));console.log(`${before?'Before':'After'}: 4 widths, 21 forward samples and 6 reverse samples captured.`);
}finally{await browser.close();}
