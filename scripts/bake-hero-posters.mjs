import {chromium} from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const manifest=[];
try{
  for(const [name,width,height] of [['mobile',375,812],['tablet',768,1024],['desktop',1440,900]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:name==='desktop'?1.5:1});
    await page.goto('http://localhost:3000/?capture=1',{waitUntil:'networkidle'});
    // Also works after the mobile intent gate has been enabled.
    await page.evaluate(()=>scrollTo(0,12));await page.waitForTimeout(150);await page.evaluate(()=>scrollTo(0,0));
    await page.waitForFunction(()=>document.querySelector('.story canvas')?.dataset.poster?.startsWith('data:image/png'),null,{timeout:60000});
    await page.waitForTimeout(1600);
    const data=await page.locator('.story canvas').evaluate(c=>({url:c.dataset.poster,width:c.width,height:c.height,camera:c.dataset.camera}));
    const file=`public/models/motherboard/poster-${name}.webp`;
    await sharp(Buffer.from(data.url.split(',')[1],'base64')).webp({quality:88,alphaQuality:95}).toFile(file);
    manifest.push({name,width:data.width,height:data.height,camera:data.camera,bytes:(await fs.stat(file)).size});await page.close();
  }
  await fs.writeFile('public/models/motherboard/posters.json',JSON.stringify(manifest,null,2));console.log(manifest);
}finally{await browser.close();}
