'use client';
import { useLayoutEffect,useRef,useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from '@/lib/use-media-query';
import CameraFrame from './CameraFrame';
const steps=[
  {title:'Kamera görüntüsü',text:'Yetkili kamera, üretim tesisindeki tanımlı alanı görüntüler.'},
  {title:'Görüntü analizi',text:'Görüntü kareleri işlenir; konum ve nesne bilgisi elde edilir.'},
  {title:'Olay tespiti',text:'Takip edilen kişinin tanımlı sınırı geçişi olay adayı oluşturur.'},
  {title:'Karar mekanizması',text:'Bölge, zaman ve yetki için önceden tanımlanmış iş kuralları değerlendirilir.'},
  {title:'Bildirim ve entegrasyon',text:'Olay kaydı ve operatör bildirimi oluşturulur; izin verilen arayüzle mevcut sisteme aktarılabilir.'},
];
export default function ProblemStory() {
  const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null);
  const [phase,setPhase]=useState(0);
  const [progress,setProgress]=useState(0);
  const reduced=useMediaQuery('(prefers-reduced-motion: reduce)',true);
  useLayoutEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);const media=gsap.matchMedia();
    media.add('(min-width:1024px) and (prefers-reduced-motion: no-preference)',()=>{
      const trigger=ScrollTrigger.create({id:'problem-pipeline',trigger:root.current,start:'top top',end:()=>`+=${innerHeight*1.8}`,pin:stage.current,pinSpacing:true,onRefresh:self=>{root.current!.dataset.pipelineStart=String(self.start);root.current!.dataset.pipelineEnd=String(self.end);},onUpdate:self=>{root.current!.dataset.pipelineProgress=self.progress.toFixed(4);setProgress(Math.round(self.progress*400)/400);setPhase(Math.min(4,Math.floor(self.progress*4+.001)));}});
      return()=>trigger.kill();
    });return()=>media.revert();
  },[]);
  const select=(index:number)=>{const trigger=ScrollTrigger.getById('problem-pipeline');if(trigger)scrollTo({top:trigger.start+(trigger.end-trigger.start)*index/4,behavior:'smooth'});else {setPhase(index);setProgress(index/4);}};
  const cameraProgress=progress<=.25 ? .24 : progress<=.5 ? .24+(progress-.25)*1.44 : Math.min(.72,.6+(progress-.5)*.48);
  return <section ref={root} id="problemden-cozume" className="problem-story" data-pipeline-stage={phase} data-pipeline-progress="0">
    <div ref={stage} className="problem-story-stage container">
      <span className="eyebrow">Örnek Mühendislik Senaryosu</span><h2>Bir görüntüden,<br /><em>çalışan bir karara.</em></h2>
      <div className="problem-layout"><div className="problem-visual"><CameraFrame scenario="intrusion" progress={cameraProgress} analysis={phase>0} /><svg className="pipeline-flow" viewBox="0 0 700 30" fill="none" aria-hidden="true"><path d="M15 15H685" stroke="currentColor" opacity=".25" /><path d="M15 15H685" stroke="var(--gold)" strokeWidth="2" strokeDasharray="670" strokeDashoffset={670*(1-progress)} /><circle data-pipeline-signal cx={15+670*progress} cy="15" r="4" fill="var(--gold)" /></svg><div className={`pipeline-result ${phase>=3?'is-active':''}`}><span>{phase>=3?'Kural: tanımlı alana giriş':'İş kuralı bekleniyor'}</span><span className={phase===4?'is-active':''}>{phase===4?'Olay kaydı → Operatör / API':'Bildirim ve entegrasyon'}</span></div></div><div className="problem-copy"><span className="film-position">0{phase+1} / 05</span><h3>{steps[phase].title}</h3><p>{steps[phase].text}</p><p className="experience-note">Temsili süreç; gerçek bir kamera veya AI modeli kullanılmaz.</p></div></div>
      <div className="pipeline-navigation" role="group" aria-label="Problemden çözüme aşamaları">{steps.map((step,index)=><button key={step.title} type="button" aria-pressed={phase===index} onClick={()=>select(index)}><span>0{index+1}</span>{step.title}</button>)}</div>
      <a className="text-link pipeline-exit" href="#calisma-sureci">Sürece devam et ↓</a>
      {reduced&&<p className="experience-note">Aşamaları yukarıdaki kontrollerle inceleyebilirsiniz.</p>}
    </div>
  </section>;
}
