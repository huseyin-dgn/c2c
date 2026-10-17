import { measurementUrl } from './measurement-url.mjs';
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const dir=process.env.RECORD_DIR||'artifacts/processor/recording';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir,size:{width:1440,height:900}}});
const page=await context.newPage();
await page.goto(measurementUrl(process.env.BASE_URL||'http://localhost:3100'),{waitUntil:'networkidle'});
await page.locator('.story canvas[data-model="motherboard-processor"]').waitFor();
await page.waitForTimeout(800);
await page.evaluate(async()=>{
  const move=(to,duration)=>new Promise(resolve=>{
    const from=scrollY,start=performance.now();
    function frame(now){const p=Math.min(1,(now-start)/duration),t=p*p*(3-2*p);scrollTo({top:from+(to-from)*t,behavior:'instant'});if(p<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);
  });
  const root=document.querySelector('.story'),end=root.getBoundingClientRect().top+scrollY+root.offsetHeight-innerHeight;
  await move(end,11000);await new Promise(r=>setTimeout(r,900));
  await move(end+innerHeight*.6,1200);await new Promise(r=>setTimeout(r,500));
  await move(0,8000);await new Promise(r=>setTimeout(r,900));
});
const video=page.video();await context.close();await video.saveAs(`${dir}/c2c-processor-hero.webm`);await video.delete();await browser.close();
console.log(`${dir}/c2c-processor-hero.webm`);
