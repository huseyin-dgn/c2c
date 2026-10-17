'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from '@/lib/use-media-query';
import { useScrollLayout } from '@/lib/use-scroll-layout';
import {useNearViewport} from '@/lib/use-near-viewport';
import { securityFrame } from '@/lib/security-scenario';
import SafetyCameraScene from './SafetyCameraScene';
import './problem-story.css';
const steps = [
  { label: 'Görüntü edinimi', title: 'Görüntü edinimi', text: 'Üretim alanındaki kamera, tanımlanan kontrol bölgesinden görüntü sağlar. Kamera açısı, görüş alanı ve görüntü alma koşulları uygulamanın ihtiyacına göre belirlenir.', note: 'Kamera görüşü ≠ güvenlik bölgesi' },
  { label: 'Kişi ve konum', title: 'Kişi tespiti ve konum analizi', text: 'Görüntü içindeki kişi belirlenir. Kişinin konumu ve takip bilgisi, kontrol bölgesiyle birlikte değerlendirilir. Bu aşamada kişi alanın dışındadır; bir ihlal oluşmaz.', note: 'T-01 · alan dışında' },
  { label: 'Olay koşulu', title: 'Olay koşulunun belirlenmesi', text: 'Kişinin zemin üzerindeki konumu, kontrollü alanın sınırıyla karşılaştırılır. Tanımlı sınır aşıldığında bir olay adayı oluşur; yalnızca görüntüde bulunmak yeterli değildir.', note: 'Koşul · kontrollü alana giriş' },
  { label: 'Karar mekanizması', title: 'Karar mekanizması', text: 'Olay adayı, önceden belirlenen iş kurallarıyla değerlendirilir. Bu örnekte kontrollü bölgede kişi bulunması, operatör uyarısı oluşturma koşulunu karşılar.', note: 'Kural sonucu · operatöre bildir' },
  { label: 'Bildirim ve kayıt', title: 'Bildirim ve entegrasyon', text: 'Olay; kişi, bölge ve karar bilgisiyle kaydedilir. Yetkili personele bildirim gönderilebilir veya izin verilen arayüzlerle mevcut izleme sistemine aktarılabilir.', note: 'EV-001 · olay kaydı / bildirim' },
];
/** Reuse the existing photograph: repair its old camera footprint and scale the same camera cutout. */
function CameraScaleCorrection({loadImages}:{loadImages:boolean}) {
  return <svg className="safety-camera-refinement" viewBox="0 0 1000 417" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <filter id="safety-patch-edge"><feGaussianBlur stdDeviation="2" /></filter>
      <mask id="safety-wall-repair" maskUnits="userSpaceOnUse" x="20" y="0" width="108" height="166"><rect x="24" y="-4" width="100" height="164" rx="2" fill="white" filter="url(#safety-patch-edge)" /></mask>
      <mask id="safety-bay-repair" maskUnits="userSpaceOnUse" x="116" y="25" width="121" height="111"><rect x="120" y="29" width="112" height="103" rx="2" fill="white" filter="url(#safety-patch-edge)" /></mask>
      <clipPath id="safety-existing-camera">
        <path d="M99 35L221 78L218 100L202 118L170 111L134 95L123 94L112 83L107 73L91 64Z" />
        <path d="M29 82L47 84L47 99L68 101L110 109L119 107L120 99L134 101L137 115L131 126L118 128L114 133L46 123L46 151L29 152Z" />
        <path d="M83-6C93 24 66 50 70 76C73 94 84 99 95 85" fill="none" stroke="black" strokeWidth="9" />
      </clipPath>
    </defs>
    <g mask="url(#safety-wall-repair)"><image href={loadImages?'/images/experiences/factory-safety.webp':undefined} width="1000" height="417" transform="translate(0 -240)" /></g>
    <g mask="url(#safety-bay-repair)"><image href={loadImages?'/images/experiences/factory-safety.webp':undefined} width="1000" height="417" transform="translate(-128 0)" /></g>
    <g transform="translate(74 0) scale(.75) translate(-74 0)" data-safety-camera-scale="0.75"><g clipPath="url(#safety-existing-camera)"><image href={loadImages?'/images/experiences/factory-safety.webp':undefined} width="1000" height="417" /></g></g>
    <path className="safety-refined-coverage" d="M157 71L315 397L948 397L810 233Z" />
  </svg>;
}

export default function ProblemStory() {
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const loadImages=useNearViewport(root,'1200px 0px');
  const { phase } = securityFrame(progress);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)', true);
  useScrollLayout(root);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(min-width:1024px) and (prefers-reduced-motion: no-preference)', () => {
      const trigger = ScrollTrigger.create({ id: 'problem-pipeline', trigger: root.current, start: 'top top', end: () => `+=${innerHeight * 1.45}`, pin: stage.current, pinSpacing: true,
        onRefresh: self => { if (root.current) { root.current.dataset.pipelineStart = String(self.start); root.current.dataset.pipelineEnd = String(self.end); } },
        onUpdate: self => setProgress(Math.round(self.progress * 1000) / 1000),
      });
      return () => trigger.kill();
    });
    return () => media.revert();
  }, []);
  const select = (index: number) => {
    const next = (index + .5) / steps.length;
    const trigger = ScrollTrigger.getById('problem-pipeline');
    if (trigger) scrollTo({ top: trigger.start + (trigger.end - trigger.start) * next, behavior: 'smooth' });
    else setProgress(next);
  };
  return <section ref={root} id="problemden-cozume" className="problem-story" data-pipeline-stage={phase} data-pipeline-progress={progress.toFixed(4)}>
    <div ref={stage} className="problem-story-stage container">
      <header className="problem-heading"><div><span className="eyebrow">Örnek Mühendislik Senaryosu</span><h2>Bir görüntüden,<br /><em>çalışan bir karara.</em></h2></div><p>Kamera tabanlı alan güvenliği.<br />Görünür olmak ile bir kuralı ihlal etmek arasındaki fark.</p></header>
      <div className="problem-layout">
        <div className="problem-visual safety-balanced-visual"><SafetyCameraScene progress={progress} loadImages={loadImages} /><CameraScaleCorrection loadImages={loadImages} /></div>
        <div className="problem-copy"><span className="film-position">0{phase + 1} / 05 <span>ALAN GÜVENLİĞİ</span></span><h3>{steps[phase].title}</h3><p>{steps[phase].text}</p><div className="problem-rule"><span>BU AŞAMADA</span><strong>{steps[phase].note}</strong></div><p className="experience-note">Temsili senaryo. Görsel, konum ve kurallar önceden tanımlıdır; canlı kamera veya AI modeli kullanılmaz.</p></div>
      </div>
      <div className="pipeline-navigation" role="group" aria-label="Problemden çözüme aşamaları">{steps.map((step, index) => <button key={step.label} type="button" aria-pressed={phase === index} onClick={() => select(index)}><span>0{index + 1}</span>{step.label}</button>)}</div>
      <div className="problem-footer"><span>{reduced ? 'Azaltılmış hareket · aşamaları kontrollerle inceleyin.' : 'Kaydırarak ilerleyin veya bir aşama seçin.'}</span><a className="text-link pipeline-exit" href="#calisma-sureci">Sürece devam et ↓</a></div>
    </div>
  </section>;
}
