import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='artifacts/hero-finale',before=JSON.parse(await fs.readFile(`${root}/before/browser.json`)),after=JSON.parse(await fs.readFile(`${root}/after/browser.json`));
const summary=[],lighting=[];
for(const viewport of after.viewports){
  const {width,height,samples}=viewport,first=samples[0],last=samples.at(-1);
  const close=samples.filter(s=>s.requested>=.3&&s.requested<=1.02/1.15),distances=close.map(s=>s.distance);
  summary.push({width,height,firstFinalSizeDifference:Math.abs(first.footprint.width-last.footprint.width),firstFinalCenterDifference:[Math.abs(first.footprint.centerX-last.footprint.centerX),Math.abs(first.footprint.centerY-last.footprint.centerY)],closeDistanceRange:Math.max(...distances)-Math.min(...distances),drawCalls:first.drawCalls,triangles:first.triangles,stages:[0,.3,.6,.8,.9,1].map(p=>samples.find(s=>s.requested===p))});
  const b=before.viewports.find(v=>v.width===width).samples[0].footprint,w=b.width,h=b.height;
  const regions={lowerPCB:{left:b.centerX-w*.25,top:b.bottom+h*.07,width:w*.5,height:h*.28},connector:{left:b.right-w*.08,top:b.centerY+h*.1,width:w*.25,height:h*.28},background:{left:width*.02,top:height*.15,width:width*.08,height:height*.08}};
  const result={width,regions:[]};
  for(const [name,rect] of Object.entries(regions)){
    const roi=Object.fromEntries(Object.entries(rect).map(([k,v])=>[k,Math.round(v)]));
    const mean=async phase=>{
      const {data,info}=await sharp(`${root}/${phase}/${width}-0.png`).extract(roi).removeAlpha().raw().toBuffer({resolveWithObject:true});let luma=0;
      for(let i=0;i<data.length;i+=info.channels)luma+=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;
      return luma/(info.width*info.height);
    };
    const old=await mean('before'),current=await mean('after');
    result.regions.push({name,roi,before:old,after:current,changePercent:(current/old-1)*100});
  }
  lighting.push(result);
}
await fs.writeFile(`${root}/summary.json`,JSON.stringify({closureProgress:1/1.15,pullbackStart:1.02/1.15,summary,lighting,note:'Screenshot sRGB luma in fixed screen ROIs, not calibrated photometry. Matched initial camera.'},null,2));
const images=[375,768,1440,1920].map(w=>`<section><h2>${w} px</h2>${[0,30,60,80,90,100].map(p=>`<h3>Hero scroll · %${p}</h3><div class="pair"><figure><img loading="lazy" src="before/${w}-${p}.png" alt="Önce yüzde ${p}"><figcaption>Önce · f5147a1</figcaption></figure><figure><img loading="lazy" src="after/${w}-${p}.png" alt="Sonra yüzde ${p}"><figcaption>Sonra · Görev 1.3</figcaption></figure></div>`).join('')}<h3>Işık karşılaştırması · aynı açık CPU pozu</h3><div class="pair"><figure><img loading="lazy" src="before/${w}-60.png" alt="Önce aynı açık CPU"><figcaption>Önce · eski mekanik ilerleme %60</figcaption></figure><figure><img loading="lazy" src="after/${w}-matched-open.png" alt="Sonra aynı açık CPU"><figcaption>Sonra · aynı mekanik ilerleme; yalnızca dolgu farkı</figcaption></figure></div><h3>Kapak kapalı · geri çekilme henüz başlamadı</h3><img loading="lazy" src="after/${w}-closed-before-pullback.png" alt="Kapalı CPU yakın plan"></section>`).join('');
const reports=[];
for(const name of ['desktop','desktop-repeat','mobile']){
  try{const r=JSON.parse(await fs.readFile(`${root}/lighthouse/${name}.report.json`));reports.push(`<li><a href="lighthouse/${name}.report.html">${name}: Performance ${Math.round(r.categories.performance.score*100)}, Accessibility ${Math.round(r.categories.accessibility.score*100)}, Best Practices ${Math.round(r.categories['best-practices'].score*100)}</a></li>`);}catch{/* QA gallery can be generated before Lighthouse finishes. */}
}
await fs.writeFile(`${root}/index.html`,`<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>C2C — Hero finali</title><style>body{margin:0;background:#071e18;color:#f4f0e6;font:16px/1.65 system-ui}main{max-width:1500px;margin:auto;padding:40px 24px}h1{font-size:clamp(30px,5vw,56px);font-weight:400}h2{margin-top:70px;border-bottom:1px solid #796e51}h3{font-weight:400;margin-top:40px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}img,video{width:100%;height:auto;display:block}figure{margin:0}a,figcaption{color:#d2bd87}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #355045;padding:12px;text-align:left}@media(max-width:650px){.pair{grid-template-columns:1fr}th,td{padding:5px;font-size:12px}}</style><main><small>C2C MÜHENDİSLİK · GÖREV 1.3</small><h1>Kapandıktan sonra tek, kontrollü dönüş.</h1><p>Kapak %86,96'da kapanır. Kamera %88,70'ten sonra geri çekilir. Önceki açılma ve birleşme, aynı scroll mesafesini ve hızını korur; Hero sonuna %15 ek scroll mesafesi ayrılmıştır. Materyaller ve geometriler korunur; gölgesiz 0,45 yoğunluklu ön dolgu ışığı eklenir.</p><table><tr><th>Viewport</th><th>İlk / son CPU genişlik farkı</th><th>İlk / son merkez farkı X/Y</th><th>Kapanışa kadar mesafe farkı</th></tr>${summary.map(s=>`<tr><td>${s.width} × ${s.height}</td><td>${s.firstFinalSizeDifference.toFixed(4)} px</td><td>${s.firstFinalCenterDifference.map(n=>n.toFixed(4)).join(' / ')} px</td><td>${s.closeDistanceRange.toFixed(6)}</td></tr>`).join('')}</table><p><a href="summary.json">Ölçüm ve ışık özeti</a> · <a href="after/browser.json">İleri / geri ham veri</a>. Gerçek headless Chrome / WebGL kayıtları; fiziksel telefon FPS testi değildir.</p><ul>${reports.join('')}</ul><h2>İleri / geri animasyon</h2><video controls preload="metadata" src="recording/c2c-processor-hero.webm"></video>${images}</main></html>`);
console.log({framing:summary.map(s=>({width:s.width,sizeDelta:s.firstFinalSizeDifference,distanceRange:s.closeDistanceRange})),lighting});
