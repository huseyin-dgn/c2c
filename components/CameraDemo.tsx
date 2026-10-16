'use client';
import { useEffect,useRef,useState } from 'react';
import { useActivity } from '@/lib/use-activity';
import { useScrollLayout } from '@/lib/use-scroll-layout';
import { demoScenarios,demoFrame,type DemoId } from '@/lib/camera-demo';
import CameraFrame from './CameraFrame';
export default function CameraDemo() {
  const root=useRef<HTMLElement>(null);
  useScrollLayout(root);
  const {visible,reduced}=useActivity(root);
  const [scenario,setScenario]=useState<DemoId>('intrusion');
  const [progress,setProgress]=useState(0),[playing,setPlaying]=useState(false);
  const finished=progress>=1;
  useEffect(()=>{
    if(!visible||!playing||reduced||finished)return;
    let raf=0,last=performance.now(),lastPaint=last;
    const frame=(now:number)=>{
      if(now-lastPaint>=30){const delta=Math.min((now-last)/14000,.04);setProgress(value=>Math.min(1,value+delta));last=now;lastPaint=now;}
      raf=requestAnimationFrame(frame);
    };
    raf=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(raf);
  },[visible,playing,reduced,finished]);
  const current=demoScenarios.find(item=>item.id===scenario)!,frame=demoFrame(scenario,progress);
  return <section ref={root} className="camera-demo interactive-section" id="kamera-deneyimi" data-demo-playing={playing&&visible&&!reduced&&progress<1?'true':'false'}>
    <div className="container">
      <div className="interactive-heading"><span className="eyebrow">Temsili Teknoloji Demonstrasyonu</span><h2>Görüntüyü izleyin.<br /><em>Olayın oluşumunu görün.</em></h2><p>Özgün, canlandırılmış örnek sahne. Hareketler ve işaretler önceden tanımlıdır; bu sayfada gerçek bir AI modeli çalışmaz.</p></div>
      <div className="demo-scenarios" role="group" aria-label="Kamera analiz senaryoları">{demoScenarios.map(item=><button type="button" key={item.id} aria-pressed={scenario===item.id} onClick={()=>{setScenario(item.id);setProgress(0);setPlaying(false);}}>{item.name}</button>)}</div>
      <div className="camera-screen"><CameraFrame scenario={scenario} progress={progress} /></div>
      <div className="demo-toolbar"><div className="demo-playback"><button type="button" className="quiet-control" disabled={reduced} onClick={()=>{if(progress===1){setProgress(0);setPlaying(true);}else setPlaying(value=>!value);}}>{playing&&progress<1?'Duraklat':'Oynat'}</button><button type="button" className="quiet-control" onClick={()=>{setProgress(0);setPlaying(!reduced);}}>Tekrar oynat</button></div><label>Demo ilerlemesi<input type="range" min="0" max="1000" value={Math.round(progress*1000)} onChange={event=>{setProgress(Number(event.target.value)/1000);setPlaying(false);}} /></label><output>{Math.round(progress*100)}%</output></div>
      <div className="demo-explanation"><div><h3>{current.title}</h3><p>{current.description}</p></div><div className="demo-event" role="status" aria-live="polite">{scenario==='counting'?`Kişi: ${frame.people} · Araç: ${frame.vehicles}`:frame.event?frame.eventLabel:'Senaryo ilerledikçe olay burada görünür.'}<small>Temsili senaryo sonucu · müşteri ölçümü değildir.</small></div></div>
      {reduced&&<p className="experience-note">Azaltılmış hareket açık. İlerleme çubuğuyla sahneyi adım adım inceleyebilirsiniz.</p>}
    </div>
  </section>;
}
