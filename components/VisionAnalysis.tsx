import { useId } from 'react';
import { productShape, type Inspection } from '@/lib/vision-simulation';

export default function VisionAnalysis({inspection,time}:{inspection:Inspection|null;time:number}){
  const id=useId(),defect=inspection?.product.defective,scenario=inspection?.product.scenario;
  const scale=332,ox=180,oy=134;
  const width=productShape.width*scale,depth=productShape.depth*scale;
  const boss=defect&&scenario==='alignment'?productShape.misalignment*scale:0;
  const radius=productShape.bossRadius*scale,holeRadius=productShape.holeRadius*scale;
  const marking=Boolean(inspection?.decision);
  const holes=[[-1,-1],[-1,1],[1,-1],[1,1]];
  // Same local X/Z coordinates as the scratch in the existing 3D product geometry.
  const scratch=[[-.27,-.137],[-.215,-.152],[-.159,-.104],[-.115,-.081]];
  const scratchPath=scratch.map(([x,z],index)=>`${index?'L':'M'}${ox+x*scale} ${oy+z*scale}`).join('');
  return <svg className="vision-capture" viewBox="0 0 360 268" role="img" aria-label={inspection?`${inspection.product.id} tetiklenmiş kamera görüntüsü; ${inspection.decision==='reject'?'kusurlu':inspection.decision==='pass'?'uygun':'kontrol sürüyor'}`:'Kamera tetik bekliyor'} data-vision-capture={inspection?.product.id??'none'} data-defect={defect?scenario:'none'}>
    <defs>
      <linearGradient id={`${id}-steel`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#859398"/><stop offset=".22" stopColor="#cbd2d3"/><stop offset=".48" stopColor="#a6b2b6"/><stop offset=".72" stopColor="#d3d8d8"/><stop offset="1" stopColor="#7c8c92"/></linearGradient>
      <radialGradient id={`${id}-boss`} cx=".34" cy=".28"><stop stopColor="#dbe0e1"/><stop offset=".72" stopColor="#a7b3b7"/><stop offset="1" stopColor="#71838a"/></radialGradient>
      <pattern id={`${id}-grain`} width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 .5H3" stroke="#23353d" strokeOpacity=".12" strokeWidth=".4"/></pattern>
    </defs>
    <path d="M0 0H360V268H0Z" fill="#20292c"/>
    <path d="M14 31V14H31M329 14H346V31M346 237V254H329M31 254H14V237" fill="none" stroke="#667573" strokeOpacity=".45"/>
    {inspection?<g key={inspection.product.id} className="vision-captured-part">
      <rect x={ox-width/2} y={oy-depth/2+6} width={width} height={depth} rx="17" fill="#060b0d" opacity=".5"/>
      <rect x={ox-width/2} y={oy-depth/2} width={width} height={depth} rx="16" fill={`url(#${id}-steel)`} stroke="#d0d7d8" strokeWidth="1.2"/>
      <rect x={ox-width/2+3} y={oy-depth/2+3} width={width-6} height={depth-6} rx="13" fill={`url(#${id}-grain)`} stroke="#677b83" strokeWidth=".7"/>
      {holes.map(([x,z])=>defect&&scenario==='missing'&&x===1&&z===-1?null:<g key={`${x}${z}`} data-mounting-hole>
        <circle cx={ox+x*productShape.holeX*scale} cy={oy+z*productShape.holeZ*scale} r={holeRadius+2} fill="#74858d" stroke="#d4dcde"/>
        <circle cx={ox+x*productShape.holeX*scale} cy={oy+z*productShape.holeZ*scale} r={holeRadius} fill="#121c21"/>
        <path d={`M${ox+x*productShape.holeX*scale-holeRadius*.65} ${oy+z*productShape.holeZ*scale+holeRadius*.65}q${holeRadius*.65} 5 ${holeRadius*1.3} 0`} stroke="#50636b" fill="none"/>
      </g>)}
      <circle cx={ox+boss} cy={oy+2} r={radius+2} fill="#5a6e77" stroke="#d4dcde"/>
      <circle cx={ox+boss} cy={oy} r={radius} fill={`url(#${id}-boss)`} stroke="#c6cfd2"/>
      {[.68,.76,.84,.92].map(r=><circle key={r} cx={ox+boss} cy={oy} r={radius*r} fill="none" stroke="#526a74" strokeOpacity=".26" strokeWidth=".5"/>)}
      <circle cx={ox+boss} cy={oy} r={.08*scale} fill="#121c21" stroke="#8d9da3" strokeWidth="2"/>
      {defect&&scenario==='scratch'&&<><path d={scratchPath} fill="none" stroke="#40535c" strokeWidth="1.5"/><path d={scratchPath} transform="translate(0 1)" fill="none" stroke="#e2e7e8" strokeOpacity=".7" strokeWidth=".55"/></>}
      {marking&&inspection.product.defective&&<g fill="none" stroke="#c6a365" strokeWidth="1.3" data-vision-annotation opacity={time-inspection.capturedAt<1.05?1:.85}>
        {scenario==='scratch'?<><rect x={ox-.27*scale-8} y={oy-.152*scale-8} width={.155*scale+16} height={.071*scale+16} rx="3"/><path d={`M${ox-.27*scale-8} ${oy-.152*scale-8}l-12-14`}/></>:scenario==='missing'?<><circle cx={ox+productShape.holeX*scale} cy={oy-productShape.holeZ*scale} r={holeRadius+8} strokeDasharray="4 3"/><path d={`M${ox+productShape.holeX*scale+16} ${oy-productShape.holeZ*scale-16}l16-16`}/></>:<><path d={`M${ox} ${oy-radius-8}V${oy+radius+8}M${ox-radius-8} ${oy}H${ox+boss+radius+8}`} strokeDasharray="3 4"/><path d={`M${ox} 244H${ox+boss}M${ox} 240V248M${ox+boss} 240V248`}/><text x={ox+boss+9} y="248" fill="#d4bc84" stroke="none" fontSize="11">+6,5 mm</text></>}
      </g>}
    </g>:<><rect x="88" y="62" width="184" height="143" rx="12" fill="none" stroke="#536267" strokeDasharray="4 6"/><circle cx="180" cy="124" r="27" fill="none" stroke="#82918d"/><path d="M180 109V125L191 132" stroke="#aab8b4" fill="none"/><text x="180" y="181" fill="#b7c2be" textAnchor="middle" fontSize="11">Ürün tetik sinyali bekleniyor</text></>}
  </svg>;
}
