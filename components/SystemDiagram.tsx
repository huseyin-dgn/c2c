'use client';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useActivity } from '@/lib/use-activity';
export type DiagramKind = 'vision' | 'industrial' | 'software' | 'ai' | 'integration';
const stages:Record<DiagramKind,{name:string;description:string}[]> = {
  vision:[{name:'Kamera',description:'Yetkili kamera akışı, analiz için görüntü kareleri sağlar.'},{name:'Analiz / olay',description:'Görüntüden çıkarılan nesne ve konum bilgisi, tanımlı olay kurallarıyla değerlendirilir.'},{name:'Bildirim',description:'Olay adayı kayıt veya operatör bildirimine dönüşür.'}],
  industrial:[{name:'Ürün girişi',description:'Ürün, belirlenen kamera ve ışık koşullarında inceleme alanına girer.'},{name:'Görsel kontrol',description:'Ölçülebilir kabul kriterlerine göre kusur adayları işaretlenir.'},{name:'Sonuç',description:'İnceleme sonucu operasyon kaydına veya kontrol sistemine aktarılır.'}],
  software:[{name:'Veri kaynağı',description:'İş kurallarıyla ilişkili veriler, tanımlı arayüzlerden alınır.'},{name:'İş mantığı',description:'Doğrulama, algoritma ve iş kuralları uygulamanın işlem katmanında yürütülür.'},{name:'Entegrasyon',description:'Sonuçlar, izin verilen hedef sistemlere kontrollü olarak aktarılır.'}],
  ai:[{name:'Veri / ön işleme',description:'Veri kalitesi kontrol edilir; modele uygun girdi hazırlanır.'},{name:'Model',description:'Eğitilmiş model, girdiden tahmin veya sınıflandırma üretir.'},{name:'Çıktı',description:'Model çıktısı iş kuralları, sınırlar ve insan değerlendirmesiyle kullanılır.'}],
  integration:[{name:'Kaynaklar',description:'Farklı servislerin veri biçimleri ve erişim sınırları tanımlanır.'},{name:'Ortak katman',description:'Veri dönüştürme, hata yönetimi ve kontrollü aktarım ortak arayüzde yürütülür.'},{name:'Hedef sistemler',description:'Hedef servisler, kendi sözleşmelerine uygun veriyi alır.'}],
};
export default function SystemDiagram({kind,drawProgress}:{kind:DiagramKind;drawProgress?:number}) {
  const root=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null);
  const {visible,reduced}=useActivity(root);
  const [selected,setSelected]=useState<number|null>(null),[hovered,setHovered]=useState<number|null>(null),[paused,setPaused]=useState(false);
  const clock=useRef(0),draw=useRef<gsap.core.Timeline|null>(null);
  const active=hovered??selected;
  const externalDraw=drawProgress!==undefined;
  useLayoutEffect(()=>{
    if(!externalDraw||!visible)return;
    const timeline=gsap.timeline({paused:true});
    svg.current?.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach(path=>{const length=path.getTotalLength();timeline.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:1,ease:'none'},0);});
    draw.current=timeline;
    return()=>{timeline.revert();draw.current=null;};
  },[kind,externalDraw,visible]);
  useLayoutEffect(()=>{draw.current?.progress(reduced?1:drawProgress??1);},[drawProgress,reduced,visible]);
  useEffect(()=>{
    const element=svg.current!;
    element.dataset.flowState=reduced?'reduced':paused?'paused':visible?'drawing':'offscreen';
    if(!visible||reduced||paused)return;
    const paths=[...element.querySelectorAll<SVGPathElement>('[data-flow]')];
    const dots=[...element.querySelectorAll<SVGCircleElement>('[data-signal]')];
    const update=(_time:number,delta:number)=>{
      const progress=drawProgress??Number(root.current?.closest<HTMLElement>('[data-motion-region]')?.dataset.motionProgress??1);
      if(progress<.97){element.dataset.flowState='drawing';element.querySelector('.diagram-signals')?.setAttribute('opacity','0');return;}
      clock.current+=Math.min(delta,50)/1000;
      element.dataset.flowState='running'; element.dataset.flowFrame=String(Math.round(clock.current*1000));
      element.querySelector<SVGGElement>('.diagram-signals')?.setAttribute('opacity','1');
      dots.forEach((dot,index)=>{
        const path=paths[index%paths.length];if(!path)return;
        const speed=kind==='industrial'?.12:kind==='vision'?.16:kind==='ai'?.1:.14;
        const phase=(clock.current*speed+index/3)%1;
        const point=path.getPointAtLength(path.getTotalLength()*phase);
        dot.setAttribute('cx',String(point.x));dot.setAttribute('cy',String(point.y));
      });
      const scanner=element.querySelector('[data-scanner]');
      if(scanner){const x=365+Math.sin(clock.current*.9)*85;scanner.setAttribute('x1',String(x));scanner.setAttribute('x2',String(x));}
      element.querySelectorAll<SVGElement>('[data-processor]').forEach((node,index)=>node.setAttribute('opacity',String(.5+.5*Math.max(0,Math.sin(clock.current*(kind==='ai'?1.8:.8)-index)))));
    };
    gsap.ticker.add(update);return()=>gsap.ticker.remove(update);
  },[visible,reduced,paused,kind,drawProgress]);
  return <div ref={root} className="live-diagram" data-diagram-kind={kind} data-active={active===null?'none':active} onPointerOver={event=>{const node=(event.target as Element).closest('[data-node]');if(node)setHovered(Number(node.getAttribute('data-node')));}} onPointerOut={event=>{if(!(event.relatedTarget instanceof Element)||!event.relatedTarget.closest('[data-node]'))setHovered(null);}} onPointerLeave={()=>setHovered(null)} onPointerUp={event=>{const node=(event.target as Element).closest('[data-node]');if(node){const index=Number(node.getAttribute('data-node'));setSelected(selected===index?null:index);}}}>
    <SystemDrawing kind={kind} svgRef={svg} />
    <div className="diagram-controls" role="group" aria-label={`${kind} diyagramı bileşenleri`}>{stages[kind].map((stage,index)=><button type="button" key={stage.name} aria-pressed={selected===index} onFocus={()=>setHovered(index)} onBlur={()=>setHovered(null)} onClick={()=>setSelected(selected===index?null:index)}>{stage.name}</button>)}</div>
    <p className="diagram-description" aria-live="polite">{active===null?'Bileşeni seçerek veri akışındaki görevini inceleyin.':stages[kind][active].description}</p>
    <button type="button" className="diagram-pause" disabled={reduced} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?'Şema akışını sürdür':'Şema akışını duraklat'}</button>
  </div>;
}
/** Original engineering schematics, not footage or evidence of delivered projects. */
function SystemDrawing({ kind,svgRef }: { kind: DiagramKind;svgRef:RefObject<SVGSVGElement|null> }) {
  return (
    <svg ref={svgRef} viewBox="0 0 720 460" className={`system-diagram diagram-${kind}`} fill="none" aria-hidden="true" data-flow-frame="0">
      <g stroke="currentColor" strokeWidth="2.4">
        {kind === 'vision' ? <>
          <path data-draw data-flow d="M85 270H245L330 185H492V245H635" />
          <g data-mechanism data-node="0">
            <path d="M64 156L175 128L231 163V247L119 275L64 240Z" fill="var(--diagram-fill)" />
            <path d="M64 156L119 192L231 163M119 192V275M175 128V103H198V140" />
            <ellipse cx="175" cy="217" rx="31" ry="39" transform="rotate(17 175 217)" />
            <ellipse cx="175" cy="217" rx="19" ry="25" transform="rotate(17 175 217)" stroke="var(--gold)" />
            <path d="M84 178V231M94 185V238M104 192V245" opacity=".5" />
          </g>
          <path data-draw d="M320 100H590V335H320V100Z" strokeDasharray="4 8" opacity=".35" />
          <g data-mechanism data-node="1"><path d="M408 250V210Q410 186 430 186Q450 186 452 210V250M415 250L410 294M445 250L450 294" /><circle cx="430" cy="168" r="14" /><path data-processor d="M386 136V120H405M454 120H473V136M386 275V310H405M454 310H473V275" stroke="var(--gold)" /></g>
          <path data-draw d="M348 225H562" stroke="var(--gold)" />
          <circle data-node="2" cx="635" cy="245" r="13" fill="var(--gold)" stroke="none" />
        </> : kind === 'industrial' ? <>
          <path data-draw data-flow d="M65 310H653" /><path data-draw d="M85 330H632M125 330L108 367M590 330L607 367" />
          {[160, 280, 400, 520].map((x, index) => <g data-mechanism data-node={index===2?'1':'0'} key={x}>
            <path d={`M${x} 249L${x + 40} 228L${x + 79} 249V291L${x + 40} 311L${x} 291Z`} fill="var(--diagram-fill)" stroke={index === 2 ? 'var(--gold)' : 'currentColor'} />
            <path d={`M${x} 249L${x + 40} 270L${x + 79} 249M${x + 40} 270V311`} opacity=".55" />
          </g>)}
          <g data-mechanism><path d="M345 90H415V139H345ZM380 139V164M361 164H399L410 188H350Z" fill="var(--diagram-fill)" /><path d="M325 85V65H435V85M435 65H477V304" /></g>
          <path data-draw d="M355 200L330 292M405 200L430 292M320 213H440V307H320Z" stroke="var(--gold)" />
          <path data-draw d="M478 130H591V192" /><circle data-node="2" cx="591" cy="204" r="13" fill="var(--gold)" stroke="none" />
          <line data-scanner x1="365" x2="365" y1="207" y2="310" stroke="var(--gold)" strokeWidth="3" />
        </> : kind==='software' ? <>
          <path data-draw data-flow d="M75 166H260V234H455V140H637" /><path data-draw d="M75 302H260V234M455 234V330H637" />
          <g data-mechanism data-node="1"><path d="M263 161L357 116L454 161V299L357 345L263 299Z" fill="var(--diagram-fill)" /><path d="M263 161L357 207L454 161M357 207V345" />
            {[0,1,2,3].map(i=><path key={i} d={`M277 ${184+i*25}L342 ${216+i*25}M374 ${215+i*25}L440 ${183+i*25}`} opacity=".6" />)}
          </g>
          <path data-draw data-processor d="M330 159L357 145L385 159L357 174Z" stroke="var(--gold)" />
          {[['75','166'],['75','302'],['637','140'],['637','330']].map(([cx,cy])=><circle key={cy+cx} cx={cx} cy={cy} r="9" fill="var(--diagram-fill)" />)}
          <circle cx="455" cy="234" r="5" fill="var(--gold)" stroke="none" />
        </> : kind==='ai'?<>
          <path data-draw data-flow d="M75 230H646" />
          {[85,250,425,610].map((x,index)=><g data-node={index<2?'0':index===2?'1':'2'} data-mechanism key={x}><path d={`M${x-42} 173L${x} 150L${x+42} 173V270L${x} 294L${x-42} 270Z`} fill="var(--diagram-fill)" />{[0,1,2].map(row=><path data-processor key={row} d={`M${x-23} ${195+row*22}H${x+23}`} stroke={index===2?'var(--gold)':'currentColor'} />)}</g>)}
        </>:<>
          <path data-draw data-flow d="M80 120H270L355 230H640" /><path data-draw d="M80 230H640M80 340H270L355 230" />
          {[120,230,340].map(y=><g data-node="0" key={y}><circle cx="80" cy={y} r="22" fill="var(--diagram-fill)" /><path data-draw d={`M55 ${y-32}H105`} /></g>)}
          <g data-mechanism data-node="1"><path d="M300 176L355 145L410 176V283L355 315L300 283Z" fill="var(--diagram-fill)" /><path data-processor d="M327 216H383M327 241H383" stroke="var(--gold)" /></g>
          {[150,310].map(y=><g data-node="2" key={y}><path data-draw d={`M520 230V${y}H640`} /><path d={`M590 ${y-30}H668V${y+30}H590Z`} fill="var(--diagram-fill)" /></g>)}
        </>}
      </g>
      <g className="diagram-annotations legacy-annotations" fill="currentColor">
        <text x="64" y="412">{kind === 'vision' ? 'GÖRÜNTÜ' : kind === 'industrial' ? 'ÜRÜN / PARÇA' : 'VERİ KAYNAĞI'}</text>
        <text x="356" y="412" textAnchor="middle">{kind === 'vision' ? 'OLAY ANALİZİ' : kind === 'industrial' ? 'GÖRSEL KONTROL' : 'İŞ MANTIĞI'}</text>
        <text x="654" y="412" textAnchor="end">{kind === 'vision' ? 'BİLDİRİM' : kind === 'industrial' ? 'İNCELEME KAYDI' : 'ENTEGRASYON'}</text>
      </g>
      <g className="diagram-signals" opacity="0">{[0,1,2].map(index=><circle data-signal key={index} r="6" fill={index===1?'var(--gold)':'currentColor'} />)}</g>
    </svg>
  );
}
