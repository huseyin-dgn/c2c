import { hardware, type HardwareId } from '@/lib/hardware';

export default function HardwareFallback({ active, exploded = false, onSelect }: { active: HardwareId | null; exploded?: boolean; onSelect?: (id: HardwareId) => void }) {
  const shapes: Record<HardwareId, [number,number,number,number]> = { motherboard:[65,45,510,340], cpu:[210,130,100,95], gpu:[110,275,290,65], ram:[350,95,115,140], ssd:[440,260,95,35], cooling:[215,135,90,85], io:[75,70,70,170] };
  return <div className="hardware-fallback" data-hardware-fallback>
    <svg viewBox="0 0 640 430" role="img" aria-label="Anakart üzerindeki CPU, RAM, GPU, M.2 SSD, soğutma ve giriş çıkış bağlantılarının şematik yerleşimi">
      {hardware.map(part => { const [x,y,w,h] = shapes[part.id]; return <g key={part.id} data-part={part.id} className={active === part.id ? 'is-active' : ''} transform={`translate(0 ${exploded ? -part.lift * 24 : 0})`}>
        <rect x={x} y={y} width={w} height={h} rx="3" fill={part.id === 'motherboard' ? '#164f3b' : '#123d31'} stroke={active === part.id ? '#c8a968' : '#b4c0af'} strokeWidth={active === part.id ? 3 : 1.5} />
        {part.id === 'ram' && [0,1,2].map(i=><path key={i} d={`M${x+20+i*32} ${y+12}V${y+h-12}`} stroke="#c8a968" />)}
        {part.id === 'gpu' && [x+70,x+205].map(cx=><circle key={cx} cx={cx} cy={y+32} r="23" fill="#061f19" stroke="#b4c0af" />)}
        <text x={x+w/2} y={part.id==='cooling'?y+43:y+h/2+5} textAnchor="middle" fill="#f6f3e9" fontSize={part.id==='motherboard'?16:13}>{part.name}</text>
      </g>; })}
      <path d="M310 175H365M260 225V275M405 300H440" stroke="#c8a968" strokeWidth="2" fill="none" />
    </svg>
    {onSelect && <span className="hardware-view-label">Şematik görünüm · parçaları aşağıdan seçebilirsiniz</span>}
  </div>;
}
