'use client';
import { useLayoutEffect,useRef,useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { solutionShowcase } from '@/lib/solution-showcase';
import { useMediaQuery } from '@/lib/use-media-query';
import SystemDiagram from './SystemDiagram';
export default function SolutionsShowcase() {
  const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null);
  const [progress,setProgress]=useState(0);
  const wide=useMediaQuery('(min-width:1024px)');
  const reduced=useMediaQuery('(prefers-reduced-motion: reduce)',true);
  const desktop=wide&&!reduced;
  useLayoutEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const media=gsap.matchMedia();
    media.add('(min-width:1024px) and (prefers-reduced-motion: no-preference)',()=>{
      root.current!.dataset.showcaseMode='horizontal';
      const tween=gsap.to(track.current,{x:()=>-(track.current!.scrollWidth-stage.current!.clientWidth),ease:'none',scrollTrigger:{id:'solutions-film',trigger:root.current,start:'top top',end:()=>`+=${innerHeight*2.8}`,pin:stage.current,pinSpacing:true,onRefresh:self=>{root.current!.dataset.showcaseStart=String(self.start);root.current!.dataset.showcaseEnd=String(self.end);},scrub:.6,invalidateOnRefresh:true,onUpdate:self=>{root.current!.dataset.showcaseProgress=self.progress.toFixed(4);setProgress(Math.round(self.progress*200)/200);}}});
      return()=>{tween.scrollTrigger?.kill();tween.revert();root.current?.setAttribute('data-showcase-mode','vertical');};
    });
    return()=>media.revert();
  },[]);
  const active=desktop?Math.round(progress*4):0;
  const seek=(index:number)=>{const trigger=ScrollTrigger.getById('solutions-film');if(trigger)window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*index/4,behavior:'smooth'});else document.getElementById(`solution-${solutionShowcase[index].id}`)?.scrollIntoView({behavior:'smooth',block:'start'});};
  return <section ref={root} id="cozumler" className="solutions-film" data-showcase-mode="vertical" data-showcase-progress="0">
    <div ref={stage} className="solutions-film-stage">
      <div className="container film-heading"><span className="eyebrow">NELER GELİŞTİRİYORUZ?</span><div><h2>Probleme göre teknoloji.<br /><em>İhtiyaca göre sistem.</em></h2><a href="#problemden-cozume" className="text-link">Vitrini geç ↓</a></div><p>Çözüm alanlarımız · tamamlanmış müşteri projeleri değildir.</p></div>
      <div className="film-window"><div ref={track} className="solutions-film-track">
        {solutionShowcase.map((item,index)=><article key={item.id} id={`solution-${item.id}`} className={`solution-film solution-film-${index}`} inert={desktop&&active!==index?true:undefined}>
          <div className="container solution-film-layout"><div className="solution-film-copy"><span className="film-position">{String(index+1).padStart(2,'0')} / 05</span><h3>{item.title}</h3><dl><dt>İşletmenin problemi</dt><dd>{item.problem}</dd><dt>Geliştirilebilecek çözüm</dt><dd>{item.solution}</dd><dt>Teknik yaklaşım</dt><dd>{item.approach}</dd></dl><Link href={`/iletisim?alan=${item.area}`} className="text-link">İhtiyacınızı paylaşın ↗</Link></div><div className="solution-film-visual"><SystemDiagram kind={item.kind} drawProgress={desktop?Math.max(0,Math.min(1,(progress*4-index+.5)*2)):undefined} /></div></div>
        </article>)}
      </div></div>
      <div className="container film-navigation" role="group" aria-label="Çözüm vitrininde gezinme">{solutionShowcase.map((item,index)=><button key={item.id} type="button" aria-current={desktop&&active===index?'step':undefined} onClick={()=>seek(index)}>{['Güvenlik','Endüstri','Yapay zekâ','Entegrasyon','Özel yazılım'][index]}</button>)}</div>
    </div>
  </section>;
}
