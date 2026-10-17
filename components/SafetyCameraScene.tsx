import { safetyZone, securityFrame } from '@/lib/security-scenario';

/** The factory and worker are original generated plates; all overlays share image coordinates. */
export default function SafetyCameraScene({ progress,loadImages=true }: { progress: number;loadImages?:boolean }) {
  const f = securityFrame(progress);
  const zone = safetyZone.map(point => [point[0],point[1]*.625].join(',')).join(' ');
  return <div className="safety-scene" data-safety-inside={String(f.inside)} data-safety-alert={String(f.alert)} data-safety-recorded={String(f.recorded)} data-safety-detected={String(f.detected)}>
    <div className="safety-camera-bar"><span>CAM-S01 <i /> ALAN GÜVENLİĞİ</span><span>TEMSİLİ SAHNE</span></div>
    <svg viewBox="0 0 1000 417" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Fabrikada monte edilmiş kamera ve kontrollü makine alanı. ${f.detected ? 'Kişi tespit edildi.' : 'Görüntü ediniliyor.'} ${f.inside ? 'Kişi kontrollü alan içinde.' : 'Kişi kontrollü alan dışında; ihlal yok.'}`}>
      <defs><linearGradient id="safety-coverage" x1=".15" y1=".25" x2=".7" y2=".9"><stop stopColor="#f6f3e9" stopOpacity=".02"/><stop offset="1" stopColor="#f6f3e9" stopOpacity=".1"/></linearGradient></defs>
      <image href={loadImages?'/images/experiences/factory-safety.webp':undefined} width="1000" height="417" preserveAspectRatio="xMidYMid slice" />
      <g className="safety-coverage" aria-hidden="true"><path d="M185 95L315 397L948 397L810 233Z" fill="url(#safety-coverage)" stroke="#e8eee3" strokeOpacity=".42" strokeWidth="1" strokeDasharray="6 7"/><path d="M185 95L948 397M185 95L315 397" stroke="#edf1e5" strokeOpacity=".2" strokeWidth="1"/></g>
      <polygon points={zone} className={`safety-zone ${f.condition ? 'is-crossed' : ''}`} fill="#c8a968" fillOpacity={f.condition ? '.16' : '.06'} stroke="#c8a968" strokeWidth="2" strokeDasharray="9 5" />
      <g transform={`translate(${f.x} ${f.y*.625})`} data-safety-person>
        <ellipse cy="-2" rx="39" ry="9" fill="#071b14" opacity=".3" />
        <image href={loadImages?'/images/experiences/safety-worker.webp':undefined} x="-55" y="-170" width="110" height="170" preserveAspectRatio="xMidYMax meet" />
        {f.detected && <g fill="none" stroke={f.condition ? '#dfc78e' : '#edf1e5'} strokeWidth="1.5" data-safety-detection>
          <path d="M-43-150V-170H-23M23-170H43V-150M43-20V0H23M-23 0H-43V-20" />
          <circle r="4" fill={f.condition ? '#dfc78e' : '#edf1e5'} stroke="none" />
          <path d="M-9 0H9M0-9V9" />
        </g>}
      </g>
    </svg>
    <div className="safety-legend"><span><i className="coverage-key" />Kamera görüş alanı</span><span><i className="zone-key" />Kontrollü bölge</span><span><i className="person-key" />{f.detected ? 'Kişi · T-01' : 'Görüntü edinimi'}</span></div>
    <div className={`safety-event ${f.alert ? 'has-event' : ''}`} role="status" aria-live="polite" aria-atomic="true">
      <span className="safety-event-mark" aria-hidden="true">{f.recorded ? '✓' : f.alert ? '!' : '—'}</span>
      <div><strong>{f.recorded ? 'OLAY KAYDI OLUŞTURULDU' : f.alert ? 'ALAN İHLALİ ALGILANDI' : f.condition ? 'SINIR GEÇİŞİ · OLAY ADAYI' : f.detected ? 'KİŞİ TESPİT EDİLDİ · İHLAL YOK' : 'KAMERA KONTROL ALANINI İZLİYOR'}</strong>
        <p>{f.recorded ? 'EV-001 · T-01 / Bölge A — Operatör bildirimi hazır.' : f.alert ? 'Kontrollü bölgede kişi var. Önerilen aksiyon: operatöre bildirim.' : f.condition ? 'Konum koşulu oluştu; sonraki aşamada iş kuralı değerlendirilir.' : f.detected ? 'Kişinin görünmesi olay değildir; konumu alan sınırıyla karşılaştırılır.' : 'Görüş alanı ile güvenlik bölgesi farklı tanımlardır.'}</p>
      </div>
    </div>
  </div>;
}
