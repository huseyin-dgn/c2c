'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CoreFallback from './CoreFallback';
import { useMediaQuery } from '@/lib/use-media-query';
import SceneDebugPanel from './SceneDebugPanel';
import { recordSceneError } from '@/lib/scene-diagnostics';
import { requestScrollRefresh } from '@/lib/use-scroll-layout';
import ProcessorPoster from './ProcessorPoster';
import './processor-world.css';
const Scene = dynamic(() => import('./EngineeringScene'), {
  ssr: false,
  loading: () => null,
});
class SceneBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    recordSceneError(error);
    this.props.onFail();
  }
  render() {
    return this.state.failed ? <CoreFallback /> : this.props.children;
  }
}
const chapters = [
  {
    label: 'MODÜLER MÜHENDİSLİK SİSTEMİ',
    title: 'Sistemin bütünü.',
    description: 'Her güçlü çözüm, doğru soruyla başlar.',
  },
  {
    label: 'AYRIŞTIRMA',
    title: 'Önce bütünü,\nsonra katmanları.',
    description:
      'Anakarttan işlemciye yaklaşırız. Biz de sistemi bütünüyle ele alır, çözümün odak noktasını belirleriz.',
  },
  {
    label: 'MÜHENDİSLİK ZEKÂSI',
    title: 'Her katmanın,\nbir görevi var.',
    description:
      'Silikon yonga, bağlantılar ve altlık ortak bir mimaride çalışır. Yazılımda da algoritmaları ve veri akışlarını aynı titizlikle kurgularız.',
  },
  {
    label: 'ENTEGRASYON',
    title: 'Parçalardan,\nçalışan bir sisteme.',
    description:
      'Katmanlar yeniden birleşir, paket tamamlanır. Geliştirdiğimiz bileşenler de mevcut iş akışınıza bağlanan bütünlüklü bir çözüme dönüşür.',
  },
];
export default function Story() {
  const root = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const motion = useRef({ value: 0 });
  const invalidateScene = useRef<() => void>(() => {});
  const [active, setActive] = useState(0);
  const [renderState, setRenderState] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  const failed=useCallback(()=>setRenderState('fallback'),[]);
  const ready=useCallback((invalidate:()=>void)=>{invalidateScene.current=invalidate;setRenderState('webgl');},[]);
  const activeRef = useRef(0);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)', true);
  const mobile = useMediaQuery('(max-width:1023px)', true);
  const [intent,setIntent]=useState(false);
  const showScene=!mobile||intent;
  useEffect(()=>{
    if(!mobile||intent||reduced)return;
    const activate=()=>{if(scrollY>4&&root.current&&root.current.getBoundingClientRect().bottom>0)setIntent(true);};
    window.addEventListener('scroll',activate,{passive:true});
    return()=>window.removeEventListener('scroll',activate);
  },[mobile,intent,reduced]);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const panels = gsap.utils.toArray<HTMLElement>('.story-chapter', root.current);
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 45 });
        const timeline = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'engineering-story',
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * (window.innerWidth < 1024 ? 3.5 : 4)}`,
            pin: stage.current,
            pinSpacing: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        timeline.to(
          motion.current,
          {
            value: 1,
            duration: 1,
            onUpdate: () => {
              const p = motion.current.value;
              invalidateScene.current();
              root.current?.setAttribute('data-progress', p.toFixed(4));
              stage.current?.style.setProperty('--story-progress', String(p));
              const next = p < 0.18 ? 0 : p < 0.42 ? 1 : p < 0.70 ? 2 : 3;
              if (activeRef.current !== next) {
                activeRef.current = next;
                setActive(next);
              }
            },
          },
          0,
        );
        for (let i = 0; i < 3; i++) {
          const at = [0.12, 0.36, 0.64][i];
          timeline
            .to(panels[i], { autoAlpha: 0, y: -32, duration: 0.095, ease: 'power1.inOut' }, at)
            .fromTo(
              panels[i + 1],
              { autoAlpha: 0, y: 45 },
              { autoAlpha: 1, y: 0, duration: 0.095, ease: 'power2.out' },
              at + 0.035,
            );
        }
        timeline.fromTo('.scene-caption', { opacity: 0.5 }, { opacity: 1, duration: 0.2 }, 0.75);
        timeline.fromTo('.story-atmosphere', { opacity: 0.6 }, { opacity: 1, duration: 0.5 }, 0.12);
        document.fonts.ready.then(requestScrollRefresh);
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);
  return (
    <>
    <section
      ref={root}
      id="deneyim"
      className="story"
      data-progress="0"
      data-renderer={reduced ? 'reduced-motion' : !showScene ? 'poster' : renderState}
      aria-label="Mühendislik dönüşümü"
    >
      <div ref={stage} className="story-stage">
        <div className="story-atmosphere" aria-hidden="true" />
        <div className="scene-shell" aria-hidden="true">
          <SceneBoundary onFail={failed}>
            {reduced ? (
              <CoreFallback />
            ) : (
              <>
              <ProcessorPoster hidden={renderState==='fallback'}/>
              {showScene&&<Scene
                progress={motion}
                onReady={ready}
                onFail={failed}
              />}
              </>
            )}
          </SceneBoundary>
        </div>
        <div className="story-copy container">
          <article className="story-chapter hero-copy" aria-hidden={active !== 0}>
            <span className="eyebrow">
              <i /> BAĞIMSIZ MÜHENDİSLİK & TEKNOLOJİ
            </span>
            <h1>
              Karmaşık
              <br />
              Problemler.
              <br />
              <em>Akıllı Çözümler.</em>
            </h1>
            <p>
              Yapay zekâ, görüntü işleme ve özel yazılımla
              <br className="desktop-break" /> işletmenize özgü mühendislik çözümleri.
            </p>
            <div className="hero-actions">
              <Link href="/iletisim" className="button button-ivory">
                Projenizi Anlatın <ArrowUpRight size={18} />
              </Link>
              <Link href="/projeler" className="hero-secondary">
                Neler Geliştiriyoruz? <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
          {chapters.slice(1).map((chapter, i) => (
            <article
              key={chapter.label}
              id={i === 0 ? 'problem' : undefined}
              className="story-chapter narrative-copy"
              aria-hidden={active !== i + 1}
            >
              <span className="eyebrow">{chapter.label}</span>
              <h2>
                {chapter.title.split('\n').map((line, j) => (
                  <span key={line}>
                    {j > 0 ? <em>{line}</em> : line}
                    <br />
                  </span>
                ))}
              </h2>
              <p>{chapter.description}</p>
              {i === 2 && (
                <Link className="text-link" href="/cozumler">
                  Çözüm alanlarını keşfedin <ArrowUpRight size={16} />
                </Link>
              )}
            </article>
          ))}
        </div>
        <div className="scene-caption" aria-hidden="true">
          <span className="caption-rule" />
          <span>
            Temsili sistem mimarisi<small>Mühendislik yaklaşımımızın görsel metaforu.</small>
          </span>
          <span className="caption-dot" />
        </div>
        <div className="story-bottom container">
          <a className="scroll-cue" href="#bizi-taniyin">
            <ArrowDown size={17} />
            <span>KAYDIRIN, DÖNÜŞÜMÜ GÖRÜN</span>
          </a>
          <div
            className="chapter-progress"
            aria-label={`Mühendislik deneyimi, aşama ${active + 1} / 4`}
          >
            {chapters.map((chapter, i) => (
              <span key={chapter.label} className={active === i ? 'is-active' : ''}>
                0{i + 1}
                <i />
              </span>
            ))}
          </div>

        </div>
        <div className="story-progress-track" aria-hidden="true">
          <span />
        </div>
      </div>
      {reduced && (
        <div className="reduced-narrative container">
          {chapters.slice(1).map((chapter) => (
            <article key={chapter.label}>
              <span className="eyebrow">{chapter.label}</span>
              <h2>{chapter.title.replace('\n', ' ')}</h2>
              <p>{chapter.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
    {process.env.NODE_ENV === 'development' && <SceneDebugPanel />}
    </>
  );
}
