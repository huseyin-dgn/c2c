/* global document, window */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
const output=path.resolve(process.env.TEST_ARTIFACT_DIR||'artifacts/products/browser');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,viewports:[],errors:[],checks:[],passed:false};
const names=['Yasak Alan ve Bölge İhlali Tespiti','Baret ve Koruyucu Ekipman Kontrolü','Hatalı Ürün ve Parça Tespiti','Ürün Sayımı ve Sınıflandırma','Forklift ve Yaya Risk Analizi','Makine Çalışma ve Duruş Takibi','Üretim, Kalite ve Operasyon Yönetim Platformu','ERP / PLC / API Entegrasyonları'];
const imageFiles=['intrusion','ppe','quality','counting','forklift','machine','platform','integration'];
const imageReady=async image=>{await image.scrollIntoViewIfNeeded();await image.evaluate(async img=>{if(!img.complete)await new Promise((resolve,reject)=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',reject,{once:true});});await img.decode();});};
try {
 for(const width of [1440,1024,768,393,320]) {
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<768});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.goto(`${base}/urunlerimiz`,{waitUntil:'networkidle'});
  assert.match(await page.title(),/Ürünlerimiz/);
  assert.equal(await page.locator('[data-concept-category]').count(),4);assert.equal(await page.locator('[data-concept-id]').count(),8);
  for(const section of await page.locator('[data-concept-category]').all())assert.equal(await section.locator('[data-concept-id]').count(),2);
  assert.match(await page.locator('h1').innerText(),/Ürünlerimiz/);assert.ok((await page.locator('main').innerText()).includes('ÖRNEK ÇÖZÜM KONSEPTLERİ'));
  const cards=page.locator('[data-concept-id]');
  for(let i=0;i<8;i++) {
   const card=cards.nth(i),button=card.locator('button');await imageReady(card.locator('img'));
   assert.equal(await card.locator('h3').innerText(),names[i]);
   const imageSource=await card.locator('img').evaluate(img=>new URL(img.currentSrc).searchParams.get('url'));
   assert.equal(imageSource,`/images/products/${imageFiles[i]}.webp`,'card image matches its concept');
   if(width===1440) {await button.focus();await page.keyboard.press('Enter');} else await button.click();
   const modal=page.getByRole('dialog');await modal.waitFor({state:'visible'});
   assert.equal(await modal.locator('h2').innerText(),names[i]);
   await modal.locator('img').evaluate(img=>img.decode());
   assert.equal(await modal.locator('img').evaluate(img=>new URL(img.currentSrc).searchParams.get('url')),imageSource,'detail uses the matching card image');
   const imageBounds=await modal.locator('img').boundingBox();assert.ok(imageBounds.height<=400&&imageBounds.height>=170);
   if(width===1440)assert.ok(imageBounds.height>=300&&imageBounds.width/imageBounds.height<3,'desktop detail image is not a narrow banner');assert.equal(await page.locator('body').evaluate(e=>e.style.overflow),'hidden');
   assert.equal(await modal.getByRole('heading',{name:'Nasıl çalışabilir?'}).count(),1);
   assert.equal(await modal.getByRole('heading',{name:'Kullanım alanları'}).count(),1);
   assert.equal(await modal.getByRole('heading',{name:'Beklenen çıktılar'}).count(),1);
   assert.match(await modal.innerText(),/ALTYAPI VE ENTEGRASYON/);assert.match(await modal.innerText(),/tamamlanmış müşteri referansı değildir/);
   assert.match(await modal.locator('a').getAttribute('href'),/^\/iletisim\?alan=(goruntu-isleme|otomasyon|ozel-yazilim)$/);
   const overflow=await modal.evaluate(e=>e.scrollWidth>e.clientWidth+1||[...e.querySelectorAll('h2,p,section')].some(x=>x.getBoundingClientRect().right>e.getBoundingClientRect().right+.5));assert.equal(overflow,false,`${width}: dialog ${i} horizontal overflow`);
   if(i===2) {
    await modal.locator('img').evaluate(img=>img.decode());await page.waitForTimeout(280);await page.screenshot({path:path.join(output,`${width}-detail.png`)});
    await modal.locator('a').focus();await page.keyboard.press('Shift+Tab');assert.equal(await modal.getByRole('button',{name:'Detay penceresini kapat'}).evaluate(e=>e===document.activeElement),true);
    await button.evaluate(e=>e.focus());assert.equal(await button.evaluate(e=>e===document.activeElement),false,'background is inert');
   }
   if(i%3===0)await page.keyboard.press('Escape');
   else if(i%3===1){await page.waitForTimeout(280);await page.mouse.click(4,160);}
   else await modal.getByRole('button',{name:'Detay penceresini kapat'}).click();
   await modal.waitFor({state:'detached'});assert.equal(await button.evaluate(e=>e===document.activeElement),true,'focus returns to opener');assert.notEqual(await page.locator('body').evaluate(e=>e.style.overflow),'hidden');
  }
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);assert.ok(overflow<=1,`${width}: page overflow ${overflow}`);
  if(width>=1024) {
   const nav=page.getByRole('navigation',{name:'Ana menü'});assert.equal(await nav.getByRole('link',{name:'Ürünlerimiz',exact:true}).count(),1);assert.equal(await nav.getByRole('link',{name:'Neler geliştiriyoruz?',exact:true}).count(),1);
   const layout=await nav.evaluate(e=>({right:e.getBoundingClientRect().right,cta:document.querySelector('.header-cta').getBoundingClientRect().left}));assert.ok(layout.right<=layout.cta-10,'desktop navigation does not collide with contact CTA');
  } else {
   await page.getByRole('button',{name:'Menüyü aç'}).click();const nav=page.getByRole('navigation',{name:'Mobil menü'});
   assert.equal(await nav.getByRole('link',{name:'Ürünlerimiz',exact:true}).isVisible(),true);assert.equal(await nav.getByRole('link',{name:'Neler geliştiriyoruz?',exact:true}).isVisible(),true);await page.getByRole('button',{name:'Menüyü kapat'}).click();
  }
  // Regress the actual post-dialog paint: no reload, eager-loading override or DOM repair.
  await page.mouse.move(0,0);await page.waitForTimeout(150);
  const imageRects=await cards.locator('img').evaluateAll(images=>images.map(img=>{const r=img.getBoundingClientRect();return{x:r.x,y:r.y+window.scrollY,w:r.width,h:r.height};}));
  const capture=await page.screenshot({path:path.join(output,`${width}-catalog.png`),fullPage:true});
  const imagePaint=[];
  for(const [index,r] of imageRects.entries()){
   const crop=await sharp(capture).extract({left:Math.round(r.x+20),top:Math.round(r.y+20),width:Math.floor(r.w-40),height:Math.floor(r.h-80)}).toBuffer();
   const deviation=(await sharp(crop).stats()).channels[0].stdev;assert.ok(deviation>5,`${width}: ${imageFiles[index]} loaded but painted blank`);imagePaint.push(Math.round(deviation*100)/100);
  }
  const mainCta=page.getByRole('link',{name:'Bizimle iletişime geçin',exact:true});assert.equal(await mainCta.getAttribute('href'),'/iletisim');
  await mainCta.click();await page.waitForURL('**/iletisim');assert.equal(await page.locator('.contact-form').count(),1);
  await page.goto(`${base}/projeler`,{waitUntil:'networkidle'});assert.match(await page.locator('h1').innerText(),/İhtiyacınızdan başlayan/);assert.equal(await page.locator('[data-concept-id]').count(),0);
  const nav=page.getByRole('navigation',{name:width>=1024?'Ana menü':'Mobil menü'});
  if(width<1024)await page.getByRole('button',{name:'Menüyü aç'}).click();await nav.getByRole('link',{name:'Ürünlerimiz',exact:true}).click();await page.waitForURL('**/urunlerimiz');
  report.viewports.push({width,categories:4,concepts:8,dialogsTested:8,overflow,focusRestored:true,imagesLoaded:8,imagePaint,separateRoutes:true});await context.close();
 }
 const reduced=await browser.newContext({viewport:{width:393,height:850},reducedMotion:'reduce'}),page=await reduced.newPage();await page.goto(`${base}/urunlerimiz`,{waitUntil:'networkidle'});await page.locator('[data-concept-id]').first().locator('button').click();
 assert.equal(await page.getByRole('dialog').evaluate(e=>window.getComputedStyle(e).animationName),'none');await page.keyboard.press('Escape');await reduced.close();
 assert.deepEqual(report.errors,[]);report.checks.push('40 dialog openings: complete content, keyboard, ESC/backdrop/close button, inert background, focus restoration and scroll unlock','All eight card/detail image mappings verified and bitmap paint checked after dialogs, without reload/eager overrides; four groups of two concepts at five widths','Separate /projeler and /urunlerimiz routes, desktop/mobile navigation and contact CTA','Reduced-motion disables drawer animation; no runtime errors');report.passed=true;
} finally {await browser.close();await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
