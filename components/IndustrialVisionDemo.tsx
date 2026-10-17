'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { useActivity } from '@/lib/use-activity';
import { useScrollLayout } from '@/lib/use-scroll-layout';
import { useMediaQuery } from '@/lib/use-media-query';
import { advanceVision, createVisionState, nextVisionEvent, actuatorPose, formatVisionTime, productTiming, visionScenarios, type VisionScenario } from '@/lib/vision-simulation';
import VisionAnalysis from './VisionAnalysis';
import './industrial-vision.css';
const StationScene=dynamic(()=>import('./IndustrialVisionScene'),{ssr:false,loading:()=> <StationFallback />});
function StationFallback(){
  return <div className="vision-fallback"><svg viewBox="0 0 900 430" role="img" aria-label="Kamera kontrol alanı, üretim bandı ve ayırma istasyonunun şematik görünümü">
    <path d="M70 255H820V314H70Z" fill="#263c34" stroke="#a1ada2"/><path d="M100 314V380M775 314V380" stroke="#82958b" strokeWidth="9"/>
    <path d="M290 255V80H390V255" stroke="#a1ada2" strokeWidth="10" fill="none"/><rect x="313" y="102" width="55" height="55" fill="#9da8a4"/><path d="M329 157H352V176H329Z" fill="#c8a968"/>
    <path d="M600 315V365H740V315" fill="#182e25" stroke="#82958b"/>
    {[180,340,510,710].map(x=><g key={x}><rect x={x} y="265" width="53" height="34" rx="5" fill="#a5b0a7"/><circle cx={x+26} cy="282" r="10" fill="#43564d"/></g>)}
    <text x="310" y="62" fill="#c8a968" fontSize="17">CAM-01</text><text x="565" y="397" fill="#c8a968" fontSize="17">AYIRMA</text>
  </svg><span>İstasyon şeması · karar ve olay kaydı aşağıda çalışmaya devam eder.</span></div>;
}
class StationBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<StationFallback />:this.props.children;}
}
export default function IndustrialVisionDemo(){
  const root=useRef<HTMLElement>(null);useScrollLayout(root);
  const {visible,reduced}=useActivity(root),mobile=useMediaQuery('(max-width:767px)',true);
  const simulation=useRef(createVisionState());
  const invalidate=useRef<()=>void>(()=>{});
  const [snapshot,setSnapshot]=useState(createVisionState),[playing,setPlaying]=useState(false);
  const [detail,setDetail]=useState(false);
  const ready=useCallback((render:()=>void)=>{invalidate.current=render;render();},[]);
  useEffect(()=>{
    if(!playing||!visible||reduced)return;
    let raf=0,last=performance.now(),paint=last;
    const tick=(now:number)=>{
      // No catch-up after a hidden tab; long stalls are bounded without tying speed to FPS.
      const next=advanceVision(simulation.current,Math.min((now-last)/1000,.1));last=now;
      const changed=next.eventSerial!==simulation.current.eventSerial;
      simulation.current=next;invalidate.current();
      if(changed||now-paint>=100){setSnapshot(next);paint=now;}
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[playing,visible,reduced]);
  const reset=(scenario:VisionScenario=snapshot.scenario)=>{
    const next=createVisionState(scenario);simulation.current=next;setSnapshot(next);setPlaying(false);invalidate.current();
  };
  const control=()=>{
    if(reduced){const next=nextVisionEvent(simulation.current);simulation.current=next;setSnapshot(next);invalidate.current();}
    else if(playing){setPlaying(false);setSnapshot(simulation.current);invalidate.current();}
    else setPlaying(true);
  };
  const current=visionScenarios.find(item=>item.id===snapshot.scenario)!;
  const actuator=actuatorPose(snapshot),decision=snapshot.inspection?.decision;
  const inspection=snapshot.inspection;
  const completed=inspection&&snapshot.time>=productTiming(inspection.product).finish;
  const captureRecord=inspection?snapshot.events.find(event=>event.productId===inspection.product.id&&event.kind==='decision'):null;
  const lastEvent=snapshot.events[0];
  const outputRecorded=lastEvent?.kind==='pass'||lastEvent?.kind==='reject';
  const flow=actuator.productId?4:outputRecorded?5:decision?3:inspection?(snapshot.time-inspection.capturedAt<.12?1:2):0;
  const flowLabel=actuator.productId?`${actuator.productId} · ayırıcı devrede`:outputRecorded?`${lastEvent.productId} · çıkış kaydı tamamlandı`:inspection?`${inspection.product.id} · ${completed?'çıkış tamamlandı':decision?'karar ürünle eşleştirildi':'özellikler inceleniyor'}`:'Ürün kontrol noktasına ilerler';
  return <section ref={root} id="kamera-deneyimi" className="camera-demo industrial-vision interactive-section"
    data-vision-time={snapshot.time.toFixed(3)} data-vision-running={String(playing&&visible&&!reduced)} data-vision-scenario={snapshot.scenario}
    data-vision-inspected={snapshot.inspected} data-vision-passed={snapshot.passed} data-vision-rejected={snapshot.rejected}
    data-vision-actuator={actuator.productId??'none'} data-vision-inspection={snapshot.inspection?.product.id??'none'}>
    <div className="container">
      <header className="interactive-heading vision-heading"><div><span className="eyebrow">ENDÜSTRİYEL GÖRÜNTÜ İŞLEME</span>
        <h2>Görüntüden karara.<br/><em>Karardan aksiyona.</em></h2></div>
        <p>Bir parça. Bir kontrol. Doğru aksiyon.<br/>İşlenmiş metal ürünlerin kamera ile incelenmesini ve ürün kimliğine bağlı olarak ayrılmasını keşfedin.</p>
      </header>
      <div className="vision-toolbar">
        <div className="vision-scenarios" role="group" aria-label="Kalite kontrol senaryosu">{visionScenarios.map(item=><button type="button" key={item.id} aria-pressed={snapshot.scenario===item.id} onClick={()=>reset(item.id)}>{item.name}</button>)}</div>
        <div className="vision-playback"><button className="vision-start" type="button" onClick={control} aria-controls="vision-station">{reduced?<StepForward size={15}/>:playing?<Pause size={15}/>:<Play size={15}/>} {reduced?'Sonraki olay':playing?'Duraklat':snapshot.time>0?'Devam et':'Başlat'}</button>
          <button type="button" className="vision-reset" onClick={()=>reset()} aria-label="Simülasyonu yeniden başlat; ürünleri ve sayaçları sıfırla"><RotateCcw size={15}/>Yeniden başlat</button></div>
      </div>
      <div className="vision-layout">
        <div className="vision-station-wrap"><div className="vision-stage-top"><span>INSPECTION CELL / 01</span><span>{actuator.productId?`AYIRICI / ${actuator.productId}`:reduced?'ADIM ADIM':playing?'ÇALIŞIYOR':snapshot.time>0?'DURAKLATILDI':'HAZIR'}</span></div>
          <div className="vision-view-switch" role="group" aria-label="İstasyon görünümü"><button type="button" aria-pressed={!detail} onClick={()=>setDetail(false)}>İstasyon</button><button type="button" aria-pressed={detail} onClick={()=>setDetail(true)}>Kontrol detayı ↗</button></div>
          <div id="vision-station" className="vision-station" role="img" aria-label="Metal flanş parçalarını kontrol eden kamera, konveyör ve pnömatik ayırma istasyonu">
            <StationBoundary>{visible?<StationScene simulation={simulation} products={snapshot.products} mobile={mobile} detail={detail} onReady={ready}/>:<StationFallback/>}</StationBoundary>
          </div>
          <div className="vision-route" aria-label="Ürün güzergâhları"><span><i>→</i> Ürün girişi</span><span>CAM-01 / kontrol</span><span>Uygun → ana hat<br/><em>Hatalı ↘ ayırma haznesi</em></span></div>
          <p className="vision-station-caption">İşlenmiş metal flanş <span>{inspection?`Son tetik · ${inspection.product.id} / ${formatVisionTime(inspection.capturedAt)}`:'Fotoelektrik tetik · konum takibi · pnömatik ayırıcı'}</span></p>
        </div>
        <aside className="vision-analysis" aria-label="Kamera analizi ve kalite kararı">
          <div className="vision-analysis-title"><span>CAM-01</span><span>TETİKLENMİŞ KARE</span></div>
          <div className="vision-analysis-copy"><div className="vision-product-id">{inspection?.product.id??'ÜRÜN BEKLENİYOR'}<span>{inspection?formatVisionTime(inspection.capturedAt):current.title}</span></div></div>
          <VisionAnalysis inspection={inspection} time={snapshot.time}/>
          <div className="vision-analysis-details">
            <dl className="vision-comparison"><div><dt>Beklenen</dt><dd>{current.expected}</dd></div><div><dt>Gözlenen</dt><dd>{decision?(inspection?.product.defective?current.observed:'Tanımlı kontrol koşulları sağlandı.'):inspection?'Özellikler inceleniyor.':'—'}</dd></div></dl>
            <div className="vision-verdict" role="status" aria-live="polite" aria-atomic="true" data-decision={decision??'pending'}>
              <span className="vision-status"><i aria-hidden="true"/>{decision==='reject'?'Kusurlu':decision==='pass'?'Uygun':inspection?'İnceleniyor':'Hazır'}</span>
              <div className="vision-action"><span>HAT KARARI</span><strong>{decision==='reject'?'AYIR':decision==='pass'?'GEÇİR':'—'}</strong></div>
              <p>{decision==='reject'?(completed?'Ürün ayırma haznesine aktarıldı.':'Ürün kimliğiyle eşleştiğinde ayırma haznesine yönlendirilir.'):decision==='pass'?(completed?'Ürün ana hat çıkışını tamamladı.':'Ürün ana hatta devam eder.'):inspection?'Tanımlı kontrol koşulları değerlendiriliyor.':'Ürün kontrol noktasına ulaştığında görüntüsü yakalanır.'}</p>
            </div>
            <p className="vision-record-status" data-vision-recorded={String(Boolean(captureRecord))}>{captureRecord?`${formatVisionTime(captureRecord.at)} · Kalite kararı kaydedildi`:'Henüz karar kaydı yok'}</p>
          </div>
        </aside>
      </div>
      <div className="vision-workflow" data-vision-flow={flow}><ol className="vision-process" aria-label="İstasyon akışı">{['Ürün girişi','Görüntü','Analiz','Karar','Ayırma','Kayıt'].map((label,index)=><li key={label} className={flow===index?'is-current':''} aria-current={flow===index?'step':undefined}><span>0{index+1}</span>{label}</li>)}</ol><span className="vision-flow-status">{flowLabel}</span></div>
      <div className="vision-records">
        <div className="vision-summary"><span className="eyebrow">BU OTURUM</span><dl className="vision-counts"><div><dt>İncelenen</dt><dd>{snapshot.inspected.toString().padStart(2,'0')}</dd></div><div><dt>Uygun çıkış</dt><dd>{snapshot.passed.toString().padStart(2,'0')}</dd></div><div><dt>Ayrılan</dt><dd>{snapshot.rejected.toString().padStart(2,'0')}</dd></div></dl><p>İnceleme karar anında, çıkış sayaçları fiziksel geçiş tamamlandığında güncellenir.</p></div>
        <div className="vision-events"><div className="vision-events-heading"><h3>Olay kaydı</h3><span>ÜRÜN KİMLİĞİYLE EŞLEŞTİRİLİR</span></div>
          <ol aria-label="Son istasyon olayları">{snapshot.events.length?snapshot.events.slice(0,3).map(event=><li key={event.key} data-product={event.productId} data-event={event.kind}><time>{formatVisionTime(event.at)}</time><strong>{event.productId}</strong><span>{event.message}</span></li>):<li className="vision-empty">Henüz olay yok. Bir senaryo seçin ve istasyonu başlatın.</li>}</ol>
        </div>
      </div>
      <p className="experience-note vision-disclosure">Temsili mühendislik simülasyonu. Kusurlar ve karar kuralları önceden tanımlıdır; gerçek bir AI modeli, kamera veya fiziksel makine kullanılmaz.</p>
      {reduced&&<p className="experience-note">Azaltılmış hareket açık. “Sonraki olay” ile ürün, kontrol ve ayırma aşamalarını otomatik hareket olmadan inceleyebilirsiniz.</p>}
    </div>
  </section>;
}
