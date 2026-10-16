import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const base=process.env.TEST_BASE_URL||'http://localhost:3000';
const output=path.resolve(process.env.TEST_ARTIFACT_DIR||'artifacts/interactive/browser');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,browser:browser.version(),generated:new Date().toISOString(),viewports:[],checks:[],errors:[],passed:false};
let page;
const focus=async(selector)=>{await page.locator(selector).first().evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-140,behavior:'instant'}));await page.waitForTimeout(350);};
const seek=async(selector,value)=>{
  await page.locator(selector).evaluate((e,p)=>{const key=e.id==='cozumler'?'showcase':'pipeline';const start=Number(e.dataset[`${key}Start`]),end=Number(e.dataset[`${key}End`]);scrollTo({top:start+(end-start)*p,behavior:'instant'});},value);
  await page.waitForFunction(({selector,value})=>Math.abs(Number(document.querySelector(selector).dataset[selector==='#cozumler'?'showcaseProgress':'pipelineProgress'])-value)<.003,{selector,value});
  await page.waitForTimeout(800);
};
const shot=async(name)=>page.screenshot({path:path.join(output,`${name}.png`)});
try{
  for(const viewport of [{width:375,height:812},{width:768,height:1024},{width:1440,height:900},{width:1920,height:1080}].filter(v=>!process.env.QA_WIDTH||v.width===Number(process.env.QA_WIDTH))){
    const context=await browser.newContext({viewport,hasTouch:viewport.width<1024,reducedMotion:'no-preference',recordVideo:viewport.width===1440?{dir:output,size:{width:1440,height:900}}:undefined});
    page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
    await page.goto(base,{waitUntil:'networkidle'});
    await page.waitForSelector('.story canvas[data-camera]');
    await page.mouse.move(0,0);
    const result={...viewport,hardware:[],camera:[],showcase:[],pipeline:[],overflow:[]};
    await focus('.hardware-viewport');await page.waitForSelector('.hardware-viewport canvas');
    for(const id of ['motherboard','cpu','gpu','ram','ssd','cooling','io']){
      const button=page.locator(`[data-hardware-button="${id}"]`);
      if(viewport.width<1024)await button.tap();else await button.click();
      await page.mouse.move(0,0);
      assert.equal(await button.getAttribute('aria-pressed'),'true');
      await focus('.hardware-viewport');
      await page.waitForFunction(id=>document.querySelector('.hardware-viewport canvas')?.dataset.hardwarePart===id,id);
      const before=Number(await page.locator('.hardware-viewport canvas').getAttribute('data-flow-frame'));
      await page.waitForTimeout(120);
      const after=Number(await page.locator('.hardware-viewport canvas').getAttribute('data-flow-frame'));
      assert.ok(after>before,`${id}: actual rendered animation advances`);
      result.hardware.push({id,before,after,description:await page.locator('.hardware-description').innerText()});
    }
    await page.getByRole('button',{name:'Parçaları Keşfet',exact:true}).click();await focus('.hardware-viewport');
    await page.waitForFunction(()=>Number(document.querySelector('.hardware-viewport canvas')?.dataset.explosion)>.999);
    await shot(`${viewport.width}-hardware-exploded`);
    await page.getByRole('button',{name:'Birleştir',exact:true}).click();await focus('.hardware-viewport');
    await page.waitForFunction(()=>Number(document.querySelector('.hardware-viewport canvas')?.dataset.explosion)<.001);
    await page.locator('[data-hardware-button="cpu"]').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
    assert.equal(await page.locator('[data-hardware-button="cpu"]').getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'Seçimi sıfırla',exact:true}).click();await page.mouse.move(0,0);
    assert.equal(await page.locator('#donanim').getAttribute('data-hardware-selection'),'none');
    result.keyboard=true;
    if(viewport.width>=1024){
      await focus('.hardware-viewport');
      const bounds=await page.locator('.hardware-viewport canvas').boundingBox();let picked='none';
      for(const [x,y] of [[.5,.5],[.5,.65],[.4,.6],[.6,.6],[.4,.7]]){
        await page.mouse.move(bounds.x+bounds.width*x,bounds.y+bounds.height*y);await page.waitForTimeout(100);
        picked=await page.locator('#donanim').getAttribute('data-hardware-selection');
        if(picked!=='none'){await page.mouse.click(bounds.x+bounds.width*x,bounds.y+bounds.height*y);break;}
      }
      assert.notEqual(picked,'none','real 3D raycast hover');assert.equal(await page.locator('[data-hardware-button="'+picked+'"]').getAttribute('aria-pressed'),'true');
      result.meshPicking=picked;
      await page.getByRole('button',{name:/^Donan.m ak.*duraklat$/}).click();await focus('.hardware-viewport');await page.waitForTimeout(150);
      const frame=await page.locator('.hardware-viewport canvas').getAttribute('data-flow-frame');await page.waitForTimeout(180);assert.equal(await page.locator('.hardware-viewport canvas').getAttribute('data-flow-frame'),frame);
      await page.getByRole('button',{name:/^Donan.m ak.*s.rd.r$/}).click();
      await page.getByRole('button',{name:/^Se.imi s.f.rla$/}).click();await page.mouse.move(0,0);
    }
    await focus('#kamera-deneyimi .demo-scenarios');
    for(const [id,name] of [['intrusion','Alan ihlali'],['counting','Kişi / araç sayımı'],['equipment','İş güvenliği'],['quality','Kalite kontrol']]){
      await page.getByRole('button',{name,exact:true}).click();
      await page.getByRole('slider',{name:'Demo ilerlemesi'}).fill('900');
      assert.equal(await page.locator('#kamera-deneyimi svg').getAttribute('data-camera-scenario'),id);
      if(id==='counting')assert.match(await page.locator('.demo-event').innerText(),/Kişi: 1 · Araç: 1/);
      else assert.equal(await page.locator('#kamera-deneyimi svg').getAttribute('data-camera-event'),'true');
      assert.ok(await page.locator('#kamera-deneyimi [data-detection]').count()>0);
      result.camera.push({id,status:await page.locator('.demo-event').innerText()});
      await focus('.camera-screen');await shot(`${viewport.width}-camera-${id}`);
    }
    await page.getByRole('button',{name:'Tekrar oynat',exact:true}).click();
    await page.waitForTimeout(500);
    assert.ok(Number(await page.getByRole('slider',{name:'Demo ilerlemesi'}).inputValue())>0);
    await page.getByRole('button',{name:'Duraklat',exact:true}).click();
    const paused=await page.getByRole('slider',{name:'Demo ilerlemesi'}).inputValue();await page.waitForTimeout(250);
    assert.equal(await page.getByRole('slider',{name:'Demo ilerlemesi'}).inputValue(),paused);
    await page.getByRole('button',{name:'Oynat',exact:true}).click();await page.waitForTimeout(180);
    assert.ok(Number(await page.getByRole('slider',{name:'Demo ilerlemesi'}).inputValue())>Number(paused));
    await page.getByRole('button',{name:'Duraklat',exact:true}).click();
    result.playPauseReplay=true;
    assert.equal(await page.locator('.solution-film').count(),5);
    if(viewport.width>=1024){
      for(const progress of [0,.25,.5,.75,1,.75,.5,.25,0]){
        await seek('#cozumler',progress);
        const state=await page.locator('#cozumler').evaluate(e=>({progress:Number(e.dataset.showcaseProgress),x:getComputedStyle(e.querySelector('.solutions-film-track')).transform,active:[...e.querySelectorAll('.solution-film')].findIndex(a=>!a.inert),pin:e.querySelector('.solutions-film-stage').getBoundingClientRect().top}));
        assert.equal(state.active,Math.round(progress*4));assert.ok(Math.abs(state.pin)<2);result.showcase.push(state);
        if(result.showcase.length<=5)await shot(`${viewport.width}-solution-${Math.round(progress*4)}`);
        const diagram=page.locator('.solution-film').nth(Math.round(progress*4)).locator('.live-diagram');
        const svg=diagram.locator('svg');
        const before=Number(await svg.getAttribute('data-flow-frame'));await page.waitForTimeout(160);
        assert.ok(Number(await svg.getAttribute('data-flow-frame'))>before,'visible diagram continues while stationary');
      }
      assert.equal(result.showcase[1].x,result.showcase[7].x,'reverse solution position matches');
      for(const progress of [0,.25,.5,.75,1,.75,.5,.25,0]){
        await seek('#problemden-cozume',progress);
        assert.equal(await page.locator('#problemden-cozume').getAttribute('data-pipeline-stage'),String(Math.round(progress*4)));
        result.pipeline.push({progress,title:await page.locator('.problem-copy h3').innerText(),analysis:await page.locator('.problem-visual [data-detection]').count(),event:await page.locator('.problem-visual [data-event]').count()});
        if(result.pipeline.length<=5)await shot(`${viewport.width}-pipeline-${Math.round(progress*4)}`);
      }
      assert.deepEqual(result.pipeline[1],result.pipeline[7]);
      // Drawing is reversible during the horizontal entrance of the industrial diagram.
      await seek('#cozumler',.15);
      const pathNode=page.locator('.solution-film').nth(1).locator('[data-draw]').first();
      await page.waitForFunction(()=>parseFloat(getComputedStyle(document.querySelectorAll('.solution-film')[1].querySelector('[data-draw]')).strokeDashoffset)>1);
      const half=await pathNode.evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset));
      report.drawDebug=await page.locator('#cozumler').evaluate(e=>({data:e.dataset,paths:[...e.querySelectorAll('.live-diagram')].map(d=>({kind:d.dataset.diagramKind,svg:d.querySelector('svg').dataset,style:d.querySelector('[data-draw]').getAttribute('style')}))}));assert.ok(half>0,'scroll draws incomplete connections');
      await seek('#cozumler',.25);await page.waitForFunction(()=>parseFloat(getComputedStyle(document.querySelectorAll('.solution-film')[1].querySelector('[data-draw]')).strokeDashoffset)===0);assert.equal(await pathNode.evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset)),0);
      await seek('#cozumler',.15);await page.waitForFunction(value=>Math.abs(parseFloat(getComputedStyle(document.querySelectorAll('.solution-film')[1].querySelector('[data-draw]')).strokeDashoffset)-value)<1,half);assert.ok(Math.abs((await pathNode.evaluate(e=>parseFloat(getComputedStyle(e).strokeDashoffset)))-half)<1);
      await seek('#cozumler',.25);
      const diagram=page.locator('.solution-film').nth(1).locator('.live-diagram');
      await diagram.getByRole('button',{name:'Görsel kontrol',exact:true}).focus();await page.keyboard.press('Space');
      assert.equal(await diagram.getAttribute('data-active'),'1');
      await diagram.getByRole('button',{name:'Şema akışını duraklat',exact:true}).click();
      const frame=await diagram.locator('svg').getAttribute('data-flow-frame');await page.waitForTimeout(180);assert.equal(await diagram.locator('svg').getAttribute('data-flow-frame'),frame);
      await diagram.getByRole('button',{name:'Şema akışını sürdür',exact:true}).click();await page.waitForTimeout(120);
      await focus('#calisma-sureci');await page.waitForTimeout(200);
      const offscreen=await diagram.locator('svg').getAttribute('data-flow-frame');await page.waitForTimeout(180);assert.equal(await diagram.locator('svg').getAttribute('data-flow-frame'),offscreen);
    }else{
      assert.equal(await page.locator('#cozumler').getAttribute('data-showcase-mode'),'vertical');
      assert.equal(await page.locator('.pin-spacer:has(.solutions-film-stage),.pin-spacer:has(.problem-story-stage)').count(),0);
      for(let i=0;i<5;i++){await page.locator('.pipeline-navigation button').nth(i).tap();assert.equal(await page.locator('#problemden-cozume').getAttribute('data-pipeline-stage'),String(i));result.pipeline.push(i);}
      await focus('.solution-film-visual');await shot(`${viewport.width}-solution-vertical`);
      const diagram=page.locator('.live-diagram').first();await diagram.locator('.diagram-controls button').nth(1).tap();assert.equal(await diagram.getAttribute('data-active'),'1');
      await focus('.problem-visual');await shot(`${viewport.width}-pipeline-mobile`);
    }
    for(const selector of ['.story','#donanim','#kamera-deneyimi','#cozumler','#problemden-cozume','#calisma-sureci','.footer']){
      if(await page.locator(selector).count())await focus(selector);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.ok(overflow<=1,`${viewport.width} ${selector}: overflow ${overflow}`);result.overflow.push({selector,overflow});
    }
    await page.goto(`${base}/iletisim?alan=goruntu-isleme`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('select[name="area"]').inputValue(),'goruntu-isleme');assert.match(await page.locator('#problem-guidance').innerText(),/kamera/);
    await page.locator('select[name="area"]').selectOption('yapay-zeka');assert.match(await page.locator('#problem-guidance').innerText(),/veriye/);
    assert.equal(await page.locator('.contact-form').evaluate(form=>form.checkValidity()),false);
    assert.equal(await page.getByRole('button',{name:'Proje Talebini Gönder'}).isDisabled(),true);
    await focus('.contact-form');await shot(`${viewport.width}-contact`);
    if(viewport.width===375){await page.getByRole('button',{name:'Menüyü aç'}).click();await page.getByRole('link',{name:'Çözümler',exact:true}).last().click();await page.waitForURL('**/cozumler');result.mobileNavigation=true;}
    report.viewports.push(result);
    await context.close();
    console.log(`PASS: ${viewport.width}px interactions, screenshots, overflow`);
  }
  const reduced=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});page=await reduced.newPage();await page.goto(base,{waitUntil:'networkidle'});
  assert.equal(await page.locator('canvas,.pin-spacer').count(),0);assert.equal(await page.locator('.solution-film').count(),5);
  await page.locator('[data-hardware-button="cpu"]').click();assert.match(await page.locator('.hardware-description').innerText(),/Genel amaçlı/);
  await page.getByRole('slider',{name:'Demo ilerlemesi'}).fill('900');assert.equal(await page.locator('#kamera-deneyimi svg').getAttribute('data-camera-event'),'true');
  await page.locator('.pipeline-navigation button').last().click();assert.equal(await page.locator('#problemden-cozume').getAttribute('data-pipeline-stage'),'4');
  await focus('.problem-visual');await shot('reduced-motion');await reduced.close();report.checks.push('Reduced motion: no Canvas/pins, all content and manual controls available');
  const fallback=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});page=await fallback.newPage();
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'||type==='webgl2'?null:original.call(this,type,...args);};});
  await page.goto(base,{waitUntil:'networkidle'});await focus('.hardware-viewport');await page.waitForTimeout(1500);
  assert.equal(await page.locator('.story').getAttribute('data-renderer'),'fallback');assert.equal(await page.locator('[data-hardware-fallback]').count(),1);
  await page.locator('[data-hardware-button="ssd"]').click();assert.match(await page.locator('.hardware-description').innerText(),/kalıcı/);await focus('.hardware-viewport');await shot('webgl-unavailable');await fallback.close();report.checks.push('WebGL unavailable: both scenes retain meaningful fallback and hardware selection');
  const loss=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});page=await loss.newPage();await page.goto(base,{waitUntil:'networkidle'});await focus('.hardware-viewport');await page.waitForSelector('.hardware-viewport canvas');
  await page.locator('.hardware-viewport canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await page.waitForSelector('[data-hardware-fallback]');await shot('hardware-context-lost');await loss.close();report.checks.push('Actual WEBGL_lose_context: hardware fallback');
  assert.deepEqual(report.errors,[]);report.passed=true;
}catch(error){report.error={message:error.message,stack:error.stack};if(page&&!page.isClosed())await shot('failure').catch(()=>{});process.exitCode=1;}
finally{await browser.close();await fs.writeFile(path.join(output,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,viewports:report.viewports.length,checks:report.checks,error:report.error?.message},null,2));}
