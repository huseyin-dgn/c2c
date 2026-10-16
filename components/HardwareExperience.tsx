'use client';
import dynamic from 'next/dynamic';
import { Component, useRef, useState, type ReactNode } from 'react';
import { hardware, type HardwareId } from '@/lib/hardware';
import { useActivity } from '@/lib/use-activity';
import { useScrollLayout } from '@/lib/use-scroll-layout';
import { recordSceneError } from '@/lib/scene-diagnostics';
import HardwareFallback from './HardwareFallback';
const HardwareScene = dynamic(() => import('./HardwareScene'), { ssr: false, loading: () => <HardwareFallback active={null} /> });
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
  const [selected, setSelected] = useState<HardwareId | null>(null);
  const [hovered, setHovered] = useState<HardwareId | null>(null);
  const [exploded, setExploded] = useState(false);
  const [paused, setPaused] = useState(false);
  const active = hovered ?? selected;
  const part = hardware.find(item => item.id === active);
  const fallback = <HardwareFallback active={active} exploded={exploded} onSelect={setSelected} />;
  return <section ref={root} id="donanim" className="hardware-experience interactive-section" data-hardware-selection={active ?? 'none'}>
    <div className="container">
      <div className="interactive-heading"><span className="eyebrow">İNTERAKTİF BİLGİSAYAR MİMARİSİ</span><h2>Parçaları inceleyin.<br /><em>Sistemi anlayın.</em></h2><p>Donanımın gerçek görevlerini keşfedin; hesaplama, veri ve entegrasyon yaklaşımımızla bağlantısını görün.</p></div>
      <div className="hardware-layout">
        <div className="hardware-stage">
          <div className="hardware-viewport">
            {reduced || !visible ? fallback : <HardwareBoundary fallback={fallback}><HardwareScene selected={selected} hovered={hovered} exploded={exploded} paused={paused} onSelect={setSelected} onHover={setHovered} /></HardwareBoundary>}
          </div>
          <div className="hardware-controls"><button type="button" className="quiet-control" aria-pressed={exploded} onClick={()=>setExploded(value=>!value)}>{exploded ? 'Birleştir' : 'Parçaları Keşfet'}</button><button type="button" className="quiet-control" onClick={()=>{setSelected(null);setHovered(null);setExploded(false);}}>Seçimi sıfırla</button><button type="button" className="quiet-control" aria-pressed={paused} onClick={()=>setPaused(value=>!value)} disabled={reduced}>{paused ? 'Donanım akışını sürdür' : 'Donanım akışını duraklat'}</button></div>
          <p className="experience-note">Özgün donanım görselleştirmesi. Parçaların yerleşimi montaj ilişkilerini açıklar; belirli bir üretici modelinin CAD çizimi değildir.</p>
        </div>
        <div className="hardware-inspector">
          <div className="hardware-part-list" role="group" aria-label="Donanım bileşenleri">{hardware.map(item=><button type="button" key={item.id} aria-pressed={selected===item.id} data-hardware-button={item.id} onMouseEnter={()=>setHovered(item.id)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(item.id)} onBlur={()=>setHovered(null)} onClick={()=>setSelected(item.id)}>{item.name}</button>)}</div>
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
