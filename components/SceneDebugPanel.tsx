'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { recordSceneError, sceneErrors } from '@/lib/scene-diagnostics';

const subscribe = () => () => {};
const debugRequested = () => new URLSearchParams(window.location.search).get('debug') === '1';
const serverSnapshot = () => false;

type Snapshot = {
  support: string;
  webgl: string;
  canvas: string;
  triggers: number;
  activeTriggers: number;
  story: boolean;
  inRange: boolean;
  progress: number;
  pose: number;
  chapter: string;
  reduced: boolean;
  renderer: string;
  camera: string;
  errors: string[];
};

function LivePanel() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const running = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => recordSceneError(event.error || event.message);
    const onRejection = (event: PromiseRejectionEvent) => recordSceneError(event.reason);
    const onResourceError = (event: Event) => {
      if (event.target instanceof HTMLScriptElement)
        recordSceneError(`JavaScript yüklenemedi: ${event.target.src}`);
    };
    window.addEventListener('error', onError);
    window.addEventListener('error', onResourceError, true);
    window.addEventListener('unhandledrejection', onRejection);
    let supported = 'Failed';
    try {
      // A separate probe distinguishes browser support from the scene's actual context.
      const probe = document.createElement('canvas').getContext('webgl2');
      if (probe) {
        supported = 'WebGL 2 destekleniyor';
        probe.getExtension('WEBGL_lose_context')?.loseContext();
      }
    } catch (error) {
      recordSceneError(error);
    }
    const sample = () => {
      const root = document.querySelector<HTMLElement>('.story');
      const canvas = root?.querySelector<HTMLCanvasElement>('.engineering-canvas canvas');
      const triggers = ScrollTrigger.getAll();
      const story = ScrollTrigger.getById('engineering-story');
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let renderer = 'Erişilemiyor';
      let webgl = reduced ? 'Reduced motion nedeniyle kapalı' : root?.dataset.renderer==='poster' ? 'Kaydırma bekleniyor (poster)' : 'Başlatılıyor';
      try {
        const gl = canvas?.getContext('webgl2');
        if (gl && !gl.isContextLost()) {
          webgl = 'Active';
          const debug = gl.getExtension('WEBGL_debug_renderer_info');
          renderer = String(gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
        } else if (root?.dataset.renderer === 'fallback' || (gl && gl.isContextLost())) {
          webgl = 'Failed';
        }
      } catch (error) {
        webgl = 'Failed';
        recordSceneError(error);
      }
      setSnapshot({
        support: supported,
        webgl,
        canvas: canvas ? `Mounted (${canvas.width} × ${canvas.height})` : 'Not Mounted',
        triggers: triggers.length,
        activeTriggers: triggers.filter((trigger) => trigger.isActive).length,
        story: Boolean(story && 'enabled' in story && story.enabled),
        inRange: Boolean(story?.isActive),
        progress: (story?.progress ?? 0) * 100,
        pose: Number(root?.dataset.progress ?? 0) * 100,
        chapter: root?.querySelector<HTMLElement>('.story-chapter[aria-hidden="false"] h1, .story-chapter[aria-hidden="false"] h2')?.innerText.replaceAll('\n', ' ') ?? 'Bulunamadı',
        reduced,
        renderer,
        camera: canvas?.dataset.camera ?? 'Henüz çizilmedi',
        errors: [...new Set([...((window as Window & { __c2cDebugErrors?: string[] }).__c2cDebugErrors ?? []), ...sceneErrors])],
      });
    };
    sample();
    const interval = setInterval(sample, 200);
    return () => {
      clearInterval(interval);
      if (timer.current) clearTimeout(timer.current);
      running.current = false;
      window.removeEventListener('error', onError);
      window.removeEventListener('error', onResourceError, true);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  const stop = (text: string) => {
    running.current = false;
    if (timer.current) clearTimeout(timer.current);
    setTesting(false);
    setMessage(text);
  };

  const test = () => {
    if (testing) return stop('Test durduruldu.');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches)
      return setMessage('Reduced motion açık; tercih korunuyor. Scroll testi devre dışı.');
    const trigger = ScrollTrigger.getById('engineering-story');
    if (!trigger) return setMessage('Sahne trigger’ı bulunamadı; test başlatılmadı.');
    ScrollTrigger.refresh();
    running.current = true;
    setTesting(true);
    const positions = [0, 0.25, 0.5, 0.75, 1];
    let index = 0;
    const step = () => {
      if (!running.current) return;
      const live = ScrollTrigger.getById('engineering-story');
      if (!live || matchMedia('(prefers-reduced-motion: reduce)').matches)
        return stop('Sahne veya hareket tercihi değişti; test durduruldu.');
      const progress = positions[index];
      // Move the real document; do not write to animation refs or fabricate results.
      window.scrollTo({ top: live.start + (live.end - live.start) * progress, behavior: 'instant' });
      setMessage(`Hedef: %${progress * 100} · ölçülen değerler yukarıda`);
      timer.current = setTimeout(() => {
        index++;
        if (index < positions.length) step();
        else stop('Beş scroll hedefi tamamlandı. Görsel sonucu ve ölçülen değerleri kontrol edin.');
      }, 2000);
    };
    step();
  };

  return (
    <aside className="scene-debug" aria-label="Geliştirme teşhis paneli">
      <details open>
        <summary>C2C · Sahne teşhisi <small>development</small></summary>
        <p className="debug-address">{typeof window !== 'undefined' ? window.location.origin : ''} · 200 ms örnekleme</p>
        {snapshot && (
          <dl>
            <dt>WebGL desteği</dt><dd data-debug="support">{snapshot.support}</dd>
            <dt>WebGL sahnesi</dt><dd data-debug="webgl">{snapshot.webgl}</dd>
            <dt>Canvas</dt><dd data-debug="canvas">{snapshot.canvas}</dd>
            <dt>GSAP ScrollTrigger</dt><dd data-debug="trigger">{snapshot.story ? 'Active' : 'Inactive'} · sahne {snapshot.inRange ? 'aralıkta' : 'aralık dışında'}</dd>
            <dt>Trigger sayısı</dt><dd data-debug="count">{snapshot.triggers} kayıtlı / {snapshot.activeTriggers} aralıkta aktif</dd>
            <dt>Scroll ilerlemesi</dt><dd data-debug="progress">{snapshot.progress.toFixed(1)}%</dd>
            <dt>Animasyon ilerlemesi</dt><dd data-debug="pose">{snapshot.pose.toFixed(1)}%</dd>
            <dt>Aktif aşama</dt><dd data-debug="chapter">{snapshot.chapter}</dd>
            <dt>Reduced motion</dt><dd data-debug="reduced">{snapshot.reduced ? 'On' : 'Off'}</dd>
            <dt>Renderer</dt><dd data-debug="renderer">{snapshot.renderer}</dd>
            <dt>Kamera</dt><dd data-debug="camera">{snapshot.camera}</dd>
          </dl>
        )}
        <div className="debug-errors" data-debug="errors">
          <strong>JavaScript / WebGL hataları</strong>
          {snapshot?.errors.length ? <ul>{snapshot.errors.map((error, index) => <li key={index}>{error}</li>)}</ul> : <p>Panel açıldığından beri yakalanan hata yok.</p>}
        </div>
        <button type="button" onClick={test} disabled={!testing && (!snapshot?.story || snapshot.reduced)}>
          {testing ? 'Testi Durdur' : 'Animasyonu Test Et'}
        </button>
        <p className="debug-message" role="status">{message || 'Test, gerçek sayfayı 10 saniyede beş aşamaya kaydırır.'}</p>
      </details>
    </aside>
  );
}

export default function SceneDebugPanel() {
  const requested = useSyncExternalStore(subscribe, debugRequested, serverSnapshot);
  return process.env.NODE_ENV === 'development' && requested ? <LivePanel /> : null;
}
