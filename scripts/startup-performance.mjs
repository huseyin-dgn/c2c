import { measurementUrl } from './measurement-url.mjs';
/* global document, window, scrollY, innerHeight, scrollTo, getComputedStyle, MutationObserver */
// Browser-cache cold/warm runs; 2x CPU, 40 ms RTT, 1.6 MB/s download.

import {chromium} from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const base=process.env.TEST_BASE_URL||process.env.BENCH_BASE||'http://localhost:3100',label=process.env.BENCH_LABEL||'production';
const trials=Number(process.env.BENCH_TRIALS||2);
const out=process.env.TEST_ARTIFACT_DIR||path.join(os.tmpdir(),'c2c-startup-performance');
fs.mkdirSync(out,{recursive:true});
async function metrics(page){return page.evaluate(()=>({fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime??null,lcp:window.__bench.lcp,heroAt:window.__bench.heroAt,hardwareAt:window.__bench.hardwareAt,longTasks:window.__bench.longTasks.map(e=>({start:e.start,duration:e.duration})),resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,start:r.startTime,end:r.responseEnd,transfer:r.transferSize,encoded:r.encodedBodySize,decoded:r.decodedBodySize,type:r.initiatorType})),navigation:performance.getEntriesByType('navigation')[0]?.toJSON(),heap:performance.memory?.usedJSHeapSize}))}
(async()=>{const browser=await chromium.launch({headless:true});const report=[];try{
for(const width of [1440,393]){
 const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'}),p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);
 await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:1600000,uploadThroughput:750000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:2});
 await p.addInitScript(()=>{
  window.__bench={lcp:null,heroAt:null,hardwareAt:null,longTasks:[]};
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__bench.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__bench.longTasks.push({start:e.startTime,duration:e.duration})}).observe({type:'longtask',buffered:true});
  new MutationObserver(()=>{if(!window.__bench.heroAt&&document.querySelector('.story canvas[data-model]')&&getComputedStyle(document.querySelector('.story canvas')).visibility==='visible')window.__bench.heroAt=performance.now();if(!window.__bench.hardwareAt&&document.querySelector('.hardware-viewport canvas[data-hardware-frame]')&&getComputedStyle(document.querySelector('.hardware-viewport canvas')).visibility==='visible')window.__bench.hardwareAt=performance.now()}).observe(document,{subtree:true,attributes:true,childList:true,attributeFilter:['data-model','data-hardware-frame','data-scene-ready','style','data-hardware-ready']});
 });
 for(let trial=0;trial<trials;trial++)for(const cache of ['cold','warm']){
  if(cache==='cold'){await cdp.send('Network.clearBrowserCache');await cdp.send('Network.clearBrowserCookies');}
  const errors=[],onError=e=>errors.push(e.message);p.on('pageerror',onError);await p.goto(measurementUrl(base),{waitUntil:'domcontentloaded'});await p.waitForTimeout(4000);
  const initial=await metrics(p);await p.screenshot({path:out+'/'+label+'-'+width+'-'+trial+'-'+cache+'-initial.png'});
  const intentAt=await p.evaluate(()=>{scrollTo(0,12);return performance.now()});
  let ready=true;try{await p.waitForFunction(()=>{const c=document.querySelector('.story canvas[data-model]');return c&&getComputedStyle(c).visibility==='visible'&&(!c.dataset.sceneReady||c.dataset.sceneReady==='true')},{},{timeout:30000})}catch{ready=false}
  const hero=await metrics(p);let movement=false,idleFrames=null;
  if(ready){
   await p.evaluate(()=>{const e=document.querySelector('.story');scrollTo(0,(e.offsetHeight-innerHeight)*.46)});await p.waitForTimeout(900);
   movement=await p.locator('.story canvas').evaluate(e=>+e.dataset.separation>.8);
   await p.waitForTimeout(900);const one=await p.locator('.story canvas').getAttribute('data-frames');await p.waitForTimeout(300);idleFrames=Number(await p.locator('.story canvas').getAttribute('data-frames'))-Number(one);
  }
  await p.locator('#donanim').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));const hwStart=await p.evaluate(()=>performance.now());let hardwareReady=true;
  try{await p.waitForFunction(()=>{const c=document.querySelector('.hardware-viewport canvas[data-hardware-frame]');return c&&getComputedStyle(c).visibility==='visible'&&(!c.dataset.sceneReady||c.dataset.sceneReady==='true')},{},{timeout:30000})}catch{hardwareReady=false}
  await p.waitForTimeout(300);const afterHardware=await metrics(p);
  report.push({label,width,trial,cache,ready,movement,idleFrames,initial,hero,heroIntentDelay:hero.heroAt===null?null:Math.max(0,hero.heroAt-intentAt),hardwareReady,hardwareDelay:afterHardware.hardwareAt===null?null:afterHardware.hardwareAt-hwStart,afterHardware,errors});
  console.log(JSON.stringify({label,width,trial,cache,fcp:initial.fcp,lcp:initial.lcp,heroAt:hero.heroAt,heroIntentDelay:hero.heroAt===null?null:Math.max(0,hero.heroAt-intentAt),hardwareDelay:afterHardware.hardwareAt===null?null:afterHardware.hardwareAt-hwStart,ready,movement,initialKB:Math.round(initial.resources.reduce((s,r)=>s+r.transfer,0)/1024),longTasks:initial.longTasks.reduce((s,e)=>s+e.duration,0)}));
  fs.writeFileSync(out+'/'+label+'.json',JSON.stringify(report,null,2));p.off('pageerror',onError);
 }
 await ctx.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});

