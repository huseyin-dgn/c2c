import { useId } from 'react';
import { demoFrame, type DemoId } from '@/lib/camera-demo';
function Person({ x,y,phase,helmet=true,vest=true }: {x:number;y:number;phase:number;helmet?:boolean;vest?:boolean}) {
  const step=Math.sin(phase*Math.PI*12)*10;
  return <g transform={`translate(${x} ${y})`}>
    <ellipse cx="0" cy="78" rx="25" ry="8" fill="#061f19" opacity=".45" />
    <path d={`M-8 43L${-14+step*.5} 76M8 43L${14-step*.5} 76`} stroke="#d7d6c9" strokeWidth="10" strokeLinecap="round" />
    <path d={`M-16 0L${-25-step*.6} 36M16 0L${25+step*.6} 36`} stroke="#b4c0af" strokeWidth="8" strokeLinecap="round" />
    <path d="M-16 -6H16L19 45H-19Z" fill={vest?'#c8a968':'#48634d'} stroke="#b4c0af" />
    {vest&&<path d="M-9 -3V40M9 -3V40M-16 24H16" stroke="#f6f3e9" strokeWidth="3" />}
    <circle cx="0" cy="-22" r="14" fill="#b4c0af" />
    {helmet&&<path d="M-18 -22Q-17 -43 0 -42Q17 -43 18 -22Z" fill="#c8a968" stroke="#d7d6c9" />}
  </g>;
}
export default function CameraFrame({ scenario,progress,analysis=true }: {scenario:DemoId;progress:number;analysis?:boolean}) {
  const floorId=useId();
  const f=demoFrame(scenario,progress), x=f.personX;
  return <svg viewBox="0 0 900 500" className="camera-frame" role="img" aria-label={`${scenario==='quality'?'Üretim hattı':'Üretim tesisi'} temsili görüntüsü ve zamanla eşleşen analiz işaretleri`} data-camera-scenario={scenario} data-camera-event={String(f.event)} data-camera-progress={progress.toFixed(3)}>
    <defs><linearGradient id={floorId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#244f3a" /><stop offset="1" stopColor="#09271f" /></linearGradient></defs>
    <path d="M0 0H900V270H0Z" fill="#123d31" /><path d="M0 270H900V500H0Z" fill={`url(#${floorId})`} />
    <path d="M0 270H900M0 500L340 270M210 500L410 270M480 500L490 270M730 500L560 270M900 450L650 270M0 390H900M0 455H900" stroke="#48634d" strokeWidth="1" />
    {[55,270,620,820].map(cx=><g key={cx}><path d={`M${cx} 35V272`} stroke="#48634d" strokeWidth="9" /><path d={`M${cx-18} 37H${cx+18}`} stroke="#a5b0a3" strokeWidth="3" /></g>)}
    <path d="M0 40H900M0 90H900" stroke="#48634d" strokeWidth="5" />
    {[90,155,220].map(cx=><g key={cx}><path d={`M${cx} 165H${cx+50}V260H${cx}Z`} fill="#193d2c" stroke="#6b8661" /><path d={`M${cx+5} 190H${cx+45}M${cx+5} 223H${cx+45}`} stroke="#48634d" /></g>)}
    <path d="M660 135H785V270H660Z" fill="#09271f" stroke="#6b8661" /><path d="M677 150H769M677 170H769M677 190H769M677 210H769" stroke="#315448" strokeWidth="4" />
    {scenario==='quality'?<>
      <path d="M70 330L830 275V377L70 440Z" fill="#123d31" stroke="#b4c0af" strokeWidth="2" />
      {Array.from({length:6},(_,i)=>{const px=35+((i*130+progress*360)%780),py=335-(px-85)*.075;return <g key={i} transform={`translate(${px} ${py})`}><path d="M0 0L46 -18L85 0V55L42 75L0 55Z" fill="#48634d" stroke="#b4c0af" /><path d="M0 0L42 22L85 0M42 22V75" stroke="#a5b0a3" />{i===2&&<path d="M27 5L43 27L33 38L51 57" stroke="#061f19" strokeWidth="6" />}{analysis&&i===2&&f.event&&<rect data-detection x="-9" y="-25" width="102" height="110" fill="none" stroke="#c8a968" strokeWidth="3" />}</g>;})}
      <path d="M450 105H520V180H450ZM460 180L428 330M510 180L555 320" stroke="#c8a968" strokeWidth="2" fill="#193d2c" />
    </>:<>
      {scenario==='intrusion'&&<path d="M450 290L710 270L795 430L495 465Z" fill="#c8a968" fillOpacity=".09" stroke="#c8a968" strokeWidth="2" strokeDasharray="9 7" />}
      {scenario==='counting'&&<><path d="M450 270V480" stroke="#c8a968" strokeWidth="3" strokeDasharray="9 6" /><g transform={`translate(${f.vehicleX} 360)`}><path d="M-64 -20L-45 -65H25L65 -20V32H-64Z" fill="#48634d" stroke="#b4c0af" strokeWidth="2" /><path d="M-36 -55H18L41 -20H-49Z" fill="#123d31" /><circle cx="-42" cy="30" r="15" fill="#061f19" /><circle cx="43" cy="30" r="15" fill="#061f19" /></g>{analysis&&<rect data-detection x={f.vehicleX-76} y="283" width="153" height="125" fill="none" stroke="#b4c0af" strokeWidth="2" />}</>}
      <Person x={x} y={scenario==='counting'?205:310} phase={progress} helmet={scenario!=='equipment'} vest />
      {scenario==='equipment'&&<Person x={680-progress*120} y={335} phase={progress+.3} helmet vest={false} />}
      {analysis&&<><path data-track d={`M${Math.max(100,x-140)} ${scenario==='counting'?283:388}L${x} ${scenario==='counting'?283:388}`} stroke="#c8a968" strokeWidth="2" strokeDasharray="4 5" /><rect data-detection x={x-36} y={scenario==='counting'?157:262} width="72" height="135" fill="none" stroke={f.event?'#c8a968':'#b4c0af'} strokeWidth="2" /><text x={x-34} y={scenario==='counting'?146:250} fill="#f6f3e9" fontSize="14">Kişi · takip 01</text></>}
    </>}
    <path d="M25 45V25H50M850 25H875V45M25 455V475H50M850 475H875V455" fill="none" stroke="#d7d6c9" strokeWidth="2" />
    <text x="40" y="65" fill="#d7d6c9" fontSize="14">ÖRNEK SAHA · TEMSİLİ GÖRÜNTÜ</text>
    {analysis&&f.event&&<g data-event><rect x="35" y="425" width="310" height="35" fill="#061f19" /><circle cx="53" cy="443" r="5" fill="#c8a968" /><text x="69" y="449" fill="#f6f3e9" fontSize="15">{f.eventLabel} · inceleme kaydı</text></g>}
  </svg>;
}
