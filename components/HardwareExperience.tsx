'use client';
import dynamic from 'next/dynamic';
import { Component, useCallback, useRef, useState, type ReactNode } from 'react';
import { hardware, type HardwareId } from '@/lib/hardware';
import { useActivity } from '@/lib/use-activity';
import {useNearViewport} from '@/lib/use-near-viewport';
import { useScrollLayout } from '@/lib/use-scroll-layout';
import { recordSceneError } from '@/lib/scene-diagnostics';
import HardwareFallback from './HardwareFallback';
import HardwareLoading from './HardwareLoading';
import styles from './HardwareExperience.module.css';
const HardwareScene = dynamic(() => import('./HardwareScene'), { ssr: false, loading: () => <HardwareLoading /> });
class HardwareBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { recordSceneError(error); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export default function HardwareExperience() {
  const root = useRef<HTMLElement>(null);
  useScrollLayout(root);
  const { visible, reduced } = useActivity(root);
  const requested=useNearViewport(root,'1200px 0px',!reduced);
  const [interacted, setInteracted] = useState(false);
  const introPlayed = useRef(false);
  const interactionSeen = useRef(false);
  const stopIntroduction = useCallback(() => {
    if (interactionSeen.current) return;
    interactionSeen.current = true;
    setInteracted(true);
  }, []);
  const [selected, setSelected] = useState<HardwareId | null>(null);
  const [hovered, setHovered] = useState<HardwareId | null>(null);
  const [exploded, setExploded] = useState(false);
  const [paused, setPaused] = useState(false);
  const selectPart=useCallback((id:HardwareId|null)=>{
    setHovered(null);
    setSelected(current=>id===null || current===id?null:id);
  },[]);
  const active = selected ?? hovered;
  const part = hardware.find(item => item.id === active);
  const fallback = <HardwareFallback active={active} exploded={exploded} onSelect={selectPart} />;
  return <section ref={root} id="donanim" className="hardware-experience interactive-section" data-hardware-selection={active ?? 'none'} data-hardware-selected={selected ?? 'none'}>
    <div className="container">
      <div className="interactive-heading"><span className="eyebrow">İNTERAKTİF BİLGİSAYAR MİMARİSİ</span><h2>PC donanımını keşfedin.<br /><em>3D olarak inceleyin.</em></h2><p>Bu etkileşimli 3D mühendislik deneyiminde bileşenleri seçin, sistemi ayırın ve her parçanın görevini keşfedin.</p></div>
      <div className="hardware-layout" onPointerDownCapture={stopIntroduction} onPointerMoveCapture={stopIntroduction} onKeyDownCapture={stopIntroduction} onWheelCapture={stopIntroduction}>
        <div className="hardware-stage">
          <p id="hardware-guide" className={styles.guide}><span>Parçaları seçerek inceleyin.</span><span>{reduced ? 'Hareket azaltıldı; bileşen listesini kullanın.' : 'Modeli sürükleyerek döndürün.'}</span></p>
          <div className="hardware-viewport">
            {reduced ? fallback : !requested ? <HardwareLoading /> : <HardwareBoundary fallback={fallback}><HardwareScene interacted={interacted} introPlayed={introPlayed} active={visible} selected={selected} hovered={hovered} exploded={exploded} paused={paused} onSelect={selectPart} onHover={setHovered} /></HardwareBoundary>}
          </div>
          <div className="hardware-controls"><button type="button" className="quiet-control" aria-pressed={exploded} onClick={()=>setExploded(value=>!value)}>{exploded ? 'Birleştir' : 'Parçaları Keşfet'}</button><button type="button" className="quiet-control" onClick={()=>{setSelected(null);setHovered(null);setExploded(false);}}>Seçimi sıfırla</button><button type="button" className="quiet-control" aria-pressed={paused} onClick={()=>setPaused(value=>!value)} disabled={reduced}>{paused ? 'Donanım akışını sürdür' : 'Donanım akışını duraklat'}</button></div>
          <p className="experience-note">Özgün donanım görselleştirmesi. Işık akışı temsili veri yollarını gösterir. Parçaların yerleşimi montaj ilişkilerini açıklar; belirli bir üretici modelinin CAD çizimi değildir.</p>
        </div>
        <div className="hardware-inspector">
          <div className="hardware-part-list" role="group" aria-label="Donanım bileşenleri">{hardware.map(item=><button type="button" key={item.id} aria-pressed={selected===item.id} data-hardware-button={item.id} onMouseEnter={()=>setHovered(item.id)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(item.id)} onBlur={()=>setHovered(null)} onClick={()=>selectPart(item.id)}>{item.name}</button>)}</div>
          <div className="hardware-description" aria-live="polite" aria-atomic="true">
            <h3>{part?.name ?? 'Bir bileşen seçin.'}</h3>
            <dl><dt>Donanım görevi</dt><dd>{part?.role ?? 'Parçaya dokunun, üzerine gelin veya klavyeyle odaklanıp Enter / Space ile seçin.'}</dd><dt>C2C yaklaşımıyla ilişkisi</dt><dd>{part?.connection ?? 'Donanımın gerçek görevi ile sistem geliştirme yaklaşımımız arasındaki ilişki burada ayrı açıklanır.'}</dd></dl>
            {part && <p className="hardware-activity">{part.activity} <span aria-hidden="true">→</span></p>}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
