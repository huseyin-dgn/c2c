'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CoreFallback from './CoreFallback';
import { useMediaQuery } from '@/lib/use-media-query';
import SceneDebugPanel from './SceneDebugPanel';
import { recordSceneError } from '@/lib/scene-diagnostics';
import { requestScrollRefresh } from '@/lib/use-scroll-layout';
const Scene = dynamic(() => import('./EngineeringScene'), {
  ssr: false,
  loading: () => <CoreFallback />,
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
    title: 'Karmaşığı\nanlaşılır kılarız.',
    description:
      'Problemi katmanlarına ayırır; veriyi, ihtiyaçları ve teknik sınırları görünür hale getiririz.',
  },
  {
    label: 'MÜHENDİSLİK ZEKÂSI',
    title: 'Her katman,\nbirlikte düşünür.',
    description:
      'Algoritmalar ve veri akışları ortak bir mimaride buluşur. Parçalar arasında anlamlı bağlantılar kurulur.',
  },
  {
    label: 'ENTEGRASYON',
    title: 'Parçalardan,\nçalışan bir sisteme.',
    description:
      'Bileşenler, mevcut iş akışınıza bağlanan bütünlüklü ve sürdürülebilir bir çözüme dönüşür.',
  },
];
export default function Story() {
  const root = useRef<HTMLElement>(null),
    stage = useRef<HTMLDivElement>(null);
  const motion = useRef({ value: 0 });
  const invalidateScene = useRef<() => void>(() => {});
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false);
  const [renderState, setRenderState] = useState<'loading' | 'webgl' | 'fallback'>('loading');
  const activeRef = useRef(0);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)', true);
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
      data-renderer={reduced ? 'reduced-motion' : renderState}
      aria-label="Mühendislik dönüşümü"
    >
      <div ref={stage} className="story-stage">
        <div className="story-atmosphere" aria-hidden="true" />
        <div className="scene-shell" aria-hidden="true">
          <SceneBoundary onFail={() => setRenderState('fallback')}>
            {reduced ? (
              <CoreFallback />
            ) : (
              <Scene
                progress={motion}
                paused={paused}
                onReady={(invalidate) => {
                  invalidateScene.current = invalidate;
                  setRenderState('webgl');
                }}
                onFail={() => setRenderState('fallback')}
              />
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
            Bir sistemin dönüşümü<small>Analizden entegrasyona.</small>
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
          {!reduced && (
            <button
              type="button"
              className="motion-toggle"
              aria-pressed={paused}
              aria-label={paused ? 'Veri akışını sürdür' : 'Veri akışını duraklat'}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
              <span>{paused ? 'Veri akışını sürdür' : 'Veri akışını duraklat'}</span>
            </button>
          )}
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
