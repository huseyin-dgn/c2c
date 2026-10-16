'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { hardware, type HardwareId, type Vector3Tuple } from '@/lib/hardware';
import { useMediaQuery } from '@/lib/use-media-query';
import { Studio, StudioReady, RendererWarmup } from './EngineeringScene';
import HardwareFallback from './HardwareFallback';
import { recordSceneError } from '@/lib/scene-diagnostics';
type Props = { selected: HardwareId | null; hovered: HardwareId | null; exploded: boolean; paused: boolean; onSelect: (part: HardwareId) => void; onHover: (part: HardwareId | null) => void };
type Finish = { pcb: THREE.MeshStandardMaterial; metal: THREE.MeshStandardMaterial; dark: THREE.MeshStandardMaterial; gold: THREE.MeshStandardMaterial };
function ContextWatcher({onLost}:{onLost:()=>void}) {
  const {gl}=useThree();
  useEffect(()=>{
    const element=gl.domElement;
    const handle=(event:Event)=>{event.preventDefault();recordSceneError('Donanım WebGL bağlamı kaybedildi.');onLost();};
    element.addEventListener('webglcontextlost',handle);
    return()=>element.removeEventListener('webglcontextlost',handle);
  },[gl,onLost]);
  return null;
}
function Box({ at, size, material }: { at: Vector3Tuple; size: Vector3Tuple; material: THREE.Material }) { return <mesh position={at} material={material}><boxGeometry args={size} /></mesh>; }
function Fan({ material, bladeMaterial, radius = .47 }: { material: THREE.Material; bladeMaterial: THREE.Material; radius?: number }) {
  return <><mesh rotation={[Math.PI/2,0,0]} material={material}><torusGeometry args={[radius,.035,8,32]} /></mesh><mesh material={material}><cylinderGeometry args={[radius*.2,radius*.2,.09,16]} /></mesh>{Array.from({length:8},(_,i)=><group key={i} rotation={[0,i*Math.PI/4,0]}><mesh position={[radius*.45,0,0]} rotation={[0,.4,0]} material={bladeMaterial}><boxGeometry args={[radius*.7,.035,radius*.23]} /></mesh></group>)}</>;
}
function Assembly(props: Props & { mobile: boolean }) {
  const { invalidate } = useThree();
  const parts = useRef<Partial<Record<HardwareId, THREE.Group>>>({});
  const fan = useRef<THREE.Group>(null), signals = useRef<THREE.Group>(null);
  const explosion = useRef({ value: props.exploded ? 1 : 0 });
  const view = useRef({ x:7.6, y:7.8, z:9.5, tx:0, ty:.2, tz:0 });
  const clock = useRef(0);
  const active = props.hovered ?? props.selected;
  const materials = useMemo(() => Object.fromEntries(hardware.map(part => {
    const colors = { pcb: part.id==='cpu'?'#c5c3ad':'#164f3b', metal:'#b4c0af', dark:'#081e17', gold:'#c8a968' };
    const finish = Object.fromEntries(Object.entries(colors).map(([key,color]) => {
      const material = new THREE.MeshStandardMaterial({ color, metalness:key==='metal'?.88:key==='gold'?.8:.45, roughness:key==='metal'?.38:.5 });
      material.userData.original = new THREE.Color(color);
      return [key,material];
    }));
    return [part.id,finish];
  })), []) as Record<HardwareId, Finish>;
  useEffect(() => () => { for (const finish of Object.values(materials)) for (const material of Object.values(finish)) material.dispose(); }, [materials]);
  useEffect(() => {
    const tween = gsap.to(explosion.current, { value:props.exploded?1:0, duration:1.15, ease:'power2.inOut', onUpdate:invalidate });
    return () => { tween.kill(); };
  }, [props.exploded,invalidate]);
  useEffect(() => {
    const part = hardware.find(item=>item.id===active);
    const target = part && part.id!=='motherboard' ? { x:part.position[0]*.45, y:part.position[1]+(props.exploded?part.lift:0), z:part.position[2]*.4 } : {x:0,y:.3,z:0};
    const zoom = props.selected && !props.hovered ? .85 : active ? .94 : 1;
    const tween = gsap.to(view.current, { x:target.x+7.6*zoom, y:target.y+7.5*zoom, z:target.z+9.5*zoom, tx:target.x,ty:target.y,tz:target.z,duration:.8,ease:'power2.out',onUpdate:invalidate });
    invalidate();
    return ()=>{tween.kill();};
  }, [active,props.selected,props.hovered,props.exploded,invalidate]);
  useFrame(({ camera,gl,invalidate }, delta) => {
    const v=view.current, factor=props.mobile?1.12:1;
    camera.position.set(v.x*factor,v.y*factor,v.z*factor); camera.lookAt(v.tx,v.ty,v.tz);
    for (const part of hardware) {
      const group=parts.current[part.id];
      if (group) group.position.y=part.lift*explosion.current.value;
      for (const material of Object.values(materials[part.id])) {
        const original=material.userData.original as THREE.Color;
        material.color.copy(original).multiplyScalar(active && active!==part.id ? .42 : 1);
        material.envMapIntensity=active&&active!==part.id ? .18 : 1;
        material.emissive.set(active===part.id?'#164f3b':'#000000'); material.emissiveIntensity=active===part.id?.22:0;
      }
    }
    if(active && !props.paused) { clock.current+=Math.min(delta,.05); invalidate(); }
    if(fan.current) fan.current.rotation.y=active==='cooling'?clock.current*3:0;
    signals.current?.children.forEach((signal,index)=>{
      signal.visible=Boolean(active);
      const t=(clock.current*.22+index/12)%1, lane=index%4;
      const lift=(hardware.find(part=>part.id===active)?.lift??0)*explosion.current.value;
      if(active==='cpu') signal.position.set(-.7+Math.cos(t*Math.PI*2)*.65,.4+lift,-.4+Math.sin(t*Math.PI*2)*.65);
      else if(active==='gpu') signal.position.set(-2.25+t*3.4,.48+lane*.19+lift,1.46);
      else if(active==='ram') signal.position.set(.65+lane*.37,.72+lift,-1.25+t*1.6);
      else if(active==='ssd') signal.position.set(.85+(index%2?t:1-t)*1.65,.31+lift,1.7+(lane-1.5)*.055);
      else if(active==='cooling') signal.position.set(-.7+Math.sin(index)*.6,1.2+lift+t*1.3,-.4+Math.cos(index)*.6);
      else if(active==='io') signal.position.set(-3.3+t*1.15,.35+lift,-1.6+lane*.24);
      else signal.position.set(-2.1+t*4.2,.13,[-1.45,-.9,.35,1.55][lane]);
    });
    gl.domElement.dataset.hardwarePart=active??'none'; gl.domElement.dataset.explosion=explosion.current.value.toFixed(3);
    gl.domElement.dataset.flowFrame=String(Math.round(clock.current*1000));
    gl.domElement.dataset.hardwareCamera=[camera.position.x,camera.position.y,camera.position.z].map(n=>n.toFixed(3)).join(',');
  });
  const group=(id:HardwareId,children:React.ReactNode)=><group key={id} ref={value=>{if(value)parts.current[id]=value;}} onPointerOver={e=>{e.stopPropagation();props.onHover(id);}} onPointerOut={e=>{e.stopPropagation();props.onHover(null);}} onClick={e=>{e.stopPropagation();props.onSelect(id);}}>{children}</group>;
  const board=materials.motherboard,cpu=materials.cpu,gpu=materials.gpu,ram=materials.ram,ssd=materials.ssd,cool=materials.cooling,io=materials.io;
  return <>
    <Studio /><ambientLight intensity={.55} /><hemisphereLight args={['#f6f3e9','#061f19',1.7]} /><directionalLight position={[2,8,5]} intensity={3} color="#f6f3e9" /><directionalLight position={[-5,3,-2]} intensity={2} color="#b4c0af" />
    {group('motherboard',<>
      <Box at={[0,0,0]} size={[5.2,.1,4]} material={board.pcb} />
      <Box at={[-.7,.1,-.4]} size={[1.45,.12,1.45]} material={board.dark} />
      {[-1,1].flatMap(x=>[-1,1].map(z=><mesh key={`${x}${z}`} position={[x*2.38,.11,z*1.78]} material={board.metal}><cylinderGeometry args={[.075,.075,.13,8]} /></mesh>))}
      {[0,1].map(i=><Box key={i} at={[-.6-i*.25,.1,1.1+i*.5]} size={[i?2.7:3.4,.14,.12]} material={board.dark} />)}
      {[0,1,2,3].map(i=><Box key={i} at={[.65+i*.37,.13,-.5]} size={[.15,.18,2.1]} material={board.dark} />)}
      {Array.from({length:14},(_,i)=><Box key={i} at={[-2.02+i*.29,.058,-1.5+(i%4)*.75]} size={[.018,.01,1.9]} material={board.gold} />)}
      {Array.from({length:8},(_,i)=><Box key={i} at={[-1.65+i*.18,.12,-1.46]} size={[.11,.14,.22]} material={board.dark} />)}
    </>)}
    {group('cpu',<><Box at={[-.7,.2,-.4]} size={[1.16,.1,1.16]} material={cpu.pcb} /><Box at={[-.7,.27,-.4]} size={[.98,.08,.98]} material={cpu.metal} /><Box at={[-.7,.318,-.4]} size={[.45,.015,.45]} material={cpu.pcb} />{[-1,1].map(sign=><Box key={sign} at={[-.7+sign*.65,.2,-.4]} size={[.045,.06,1.36]} material={cpu.metal} />)}</>)}
    {group('ram',<>{[0,1,2,3].map(i=><group key={i} position={[.65+i*.37,0,-.5]}><Box at={[0,.45,0]} size={[.075,.52,1.85]} material={ram.pcb} />{Array.from({length:6},(_,j)=><group key={j}><Box at={[.05,.48,-.73+j*.29]} size={[.045,.28,.2]} material={ram.dark} /><Box at={[.05,.22,-.73+j*.29]} size={[.04,.055,.15]} material={ram.gold} /></group>)}<Box at={[0,.75,0]} size={[.1,.075,1.95]} material={ram.metal} /></group>)}</>)}
    {group('gpu',<><Box at={[-.6,.69,1.15]} size={[3.5,1.12,.12]} material={gpu.pcb} /><Box at={[-.6,.8,1.32]} size={[3.65,1.12,.24]} material={gpu.dark} />{[-1.5,.25].map(x=><group key={x} position={[x,.82,1.49]} rotation={[Math.PI/2,0,0]}><Fan material={gpu.metal} bladeMaterial={gpu.dark} /></group>)}<Box at={[-2.42,.75,1.14]} size={[.11,1.45,.7]} material={gpu.metal} />{Array.from({length:9},(_,i)=><Box key={i} at={[-1.9+i*.3,.27,1.17]} size={[.18,.1,.02]} material={gpu.gold} />)}</>)}
    {group('ssd',<><Box at={[1.65,.16,1.7]} size={[1.7,.08,.43]} material={ssd.pcb} />{[1.06,1.48,1.9].map(x=><Box key={x} at={[x,.23,1.7]} size={[.3,.07,.31]} material={ssd.dark} />)}<Box at={[2.42,.19,1.7]} size={[.16,.03,.4]} material={ssd.gold} /><mesh position={[.88,.22,1.7]} material={ssd.metal}><cylinderGeometry args={[.065,.065,.035,8]} /></mesh></>)}
    {group('cooling',<>
      <Box at={[-.7,.39,-.4]} size={[1.08,.12,1.08]} material={cool.metal} />
      {Array.from({length:props.mobile?9:15},(_,i)=><Box key={i} at={[-1.33+i*(props.mobile ? .157 : .09),.74,-.4]} size={[.035,.65,1.35]} material={cool.metal} />)}
      {[-.9,-.5].map(x=><mesh key={x} position={[x,.52,-.4]} rotation={[Math.PI/2,0,0]} material={cool.gold}><cylinderGeometry args={[.045,.045,1.5,10]} /></mesh>)}
      <Box at={[-.7,1.13,-.4]} size={[1.4,.09,1.4]} material={cool.dark} /><group ref={fan} position={[-.7,1.2,-.4]}><Fan radius={.59} material={cool.metal} bladeMaterial={cool.dark} /></group>
    </>)}
    {group('io',<>
      <Box at={[-2.3,.24,-1]} size={[.45,.44,1.75]} material={io.metal} />
      {[-1.6,-1.1,-.6].map(z=><Box key={z} at={[-2.54,.24,z]} size={[.025,.23,.3]} material={io.dark} />)}
      <Box at={[2.38,.18,-1.25]} size={[.22,.26,1.03]} material={io.dark} />{Array.from({length:8},(_,i)=><Box key={i} at={[2.4,.32,-1.65+i*.12]} size={[.1,.04,.055]} material={io.gold} />)}
    </>)}
    <group ref={signals}>{Array.from({length:12},(_,i)=><mesh key={i} visible={false}><sphereGeometry args={[.035,6,6]} /><meshBasicMaterial color={i%2?'#c8a968':'#f6f3e9'} /></mesh>)}</group>
  </>;
}
export default function HardwareScene(props:Props) {
  const mobile=useMediaQuery('(max-width:767px)',true);
  const [lost,setLost]=useState(false);
  const [prepared,setPrepared]=useState(false);
  const compiled=useCallback(()=>setPrepared(true),[]),failed=useCallback(()=>setLost(true),[]);
  if(lost)return <HardwareFallback active={props.selected} exploded={props.exploded} />;
  return <Canvas className="computer-canvas" dpr={[1,mobile?1:1.4]} camera={{position:[7.6,7.8,9.5],fov:mobile?39:31}} frameloop={prepared?'demand':'never'} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} fallback={<HardwareFallback active={props.selected} />}><StudioReady><ContextWatcher onLost={failed} /><Assembly {...props} mobile={mobile} /><RendererWarmup onReady={compiled} onError={failed} /></StudioReady></Canvas>;
}
