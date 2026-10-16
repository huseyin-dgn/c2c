'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense } from 'react';
import MotherboardModel from './MotherboardModel';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { hardware, type HardwareId, type Vector3Tuple } from '@/lib/hardware';
import { useMediaQuery } from '@/lib/use-media-query';
import { Studio, StudioReady, RendererWarmup } from './EngineeringScene';
import HardwareFallback from './HardwareFallback';
import { recordSceneError } from '@/lib/scene-diagnostics';
type Props = { selected: HardwareId | null; hovered: HardwareId | null; exploded: boolean; paused: boolean; onSelect: (part: HardwareId | null) => void; onHover: (part: HardwareId | null) => void };
let hardwareIntroPlayed=false;
const separationOrder:HardwareId[]=['cooling','gpu','ram','ssd','cpu','io'];
const separationEase=gsap.parseEase('power2.inOut');
function separationProgress(id:HardwareId,progress:number){
  if(id==='motherboard')return 0;
  return separationEase(THREE.MathUtils.clamp((progress*1.45-separationOrder.indexOf(id)*.07)/1.1,0,1));
}

type Finish = { pcb: THREE.MeshStandardMaterial; metal: THREE.MeshStandardMaterial; dark: THREE.MeshStandardMaterial; gold: THREE.MeshStandardMaterial; ceramic: THREE.MeshStandardMaterial; trace: THREE.MeshStandardMaterial; marking: THREE.MeshStandardMaterial };
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
function Box({ at, size, material }: { at: Vector3Tuple; size: Vector3Tuple; material: THREE.Material }) { return <mesh castShadow receiveShadow position={at} material={material}><boxGeometry args={size} /></mesh>; }
function roundedOutline(width:number,height:number,radius:number){
  const shape=new THREE.Shape(),x=width/2,y=height/2,r=radius;
  shape.moveTo(-x+r,-y);shape.lineTo(x-r,-y);shape.quadraticCurveTo(x,-y,x,-y+r);
  shape.lineTo(x,y-r);shape.quadraticCurveTo(x,y,x-r,y);
  shape.lineTo(-x+r,y);shape.quadraticCurveTo(-x,y,-x,y-r);
  shape.lineTo(-x,-y+r);shape.quadraticCurveTo(-x,-y,-x+r,-y);
  return shape;
}
function Package({at,size,material}:{at:Vector3Tuple;size:Vector3Tuple;material:THREE.Material}){
  const [w,h,d]=size;
  const geometry=useMemo(()=>{
    const bevel=Math.min(.008,h*.12,d*.12);
    const shape=roundedOutline(w-2*bevel,h-2*bevel,Math.min(.018,h*.15));
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-2*bevel,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,steps:1,curveSegments:3});
    geometry.translate(0,0,-d/2+bevel);return geometry;
  },[w,h,d]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} material={material} position={at} castShadow receiveShadow />;
}
function Marking({cell,at,size,rotation=[0,0,0],material}:{cell:number;at:Vector3Tuple;size:[number,number];rotation?:Vector3Tuple;material:THREE.Material}){
  const geometry=useMemo(()=>{
    const geometry=new THREE.PlaneGeometry(1,1),uv=geometry.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+cell%4)/4,(uv.getY(i)+1-Math.floor(cell/4))/2);
    return geometry;
  },[cell]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} material={material} position={at} rotation={rotation} scale={[...size,1]} />;
}
function CardSubstrate({material}:{material:THREE.Material}){
  const geometry=useMemo(()=>{
    const shape=roundedOutline(3.54,1.02,.045);
    for(const x of [-1.59,1.59]){const hole=new THREE.Path();hole.absarc(x,.375,.029,0,Math.PI*2,true);shape.holes.push(hole);}
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.027,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1,steps:1,curveSegments:5});
    geometry.translate(0,.535,-.0135);
    const uv=geometry.getAttribute('uv'),vertices=geometry.getAttribute('position');
    for(let i=0;i<uv.count;i++)uv.setXY(i,(vertices.getX(i)+1.775)/3.55,(vertices.getY(i)-.02)/1.03);
    return geometry;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}
function Fan({material,bladeMaterial,radius=.56}:{material:THREE.Material;bladeMaterial:THREE.Material;radius?:number}){
  const geometry=useMemo(()=>{
    const blade=new THREE.Shape();
    blade.moveTo(.09,.035);blade.bezierCurveTo(.22,.13,.4,.2,.51,.07);
    blade.quadraticCurveTo(.53,.015,.49,-.035);blade.bezierCurveTo(.32,.04,.25,-.075,.1,-.055);blade.closePath();
    const geometry=new THREE.ExtrudeGeometry(blade,{depth:.012,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:1,curveSegments:7});
    geometry.rotateX(-Math.PI/2);geometry.scale(radius/.56,1,radius/.56);return geometry;
  },[radius]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <>
    <mesh material={material} castShadow><cylinderGeometry args={[.115,.125,.075,24]} /></mesh>
    <mesh position={[0,.043,0]} material={material}><cylinderGeometry args={[.094,.11,.012,24]} /></mesh>
    {Array.from({length:7},(_,i)=><group key={i} rotation={[0,i*Math.PI*2/7,0]}><mesh geometry={geometry} material={bladeMaterial} rotation={[.06,0,0]} castShadow /></group>)}
  </>;
}
function FanFrame({finish}:{finish:Finish}){
  const geometry=useMemo(()=>{
    const frame=roundedOutline(1.42,1.42,.075);
    const hole=new THREE.Path();hole.absarc(0,0,.585,0,Math.PI*2,true);frame.holes.push(hole);
    for(const x of [-.62,.62])for(const y of [-.62,.62]){const screw=new THREE.Path();screw.absarc(x,y,.031,0,Math.PI*2,true);frame.holes.push(screw);}
    const geometry=new THREE.ExtrudeGeometry(frame,{depth:.045,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:1,curveSegments:8});
    geometry.rotateX(-Math.PI/2);return geometry;
  },[]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <>
    <mesh geometry={geometry} position={[0,.602,0]} material={finish.dark} castShadow receiveShadow />
    {[-.62,.62].flatMap(x=>[-.62,.62].map(z=><group key={`${x}${z}`}>
      <mesh position={[x,.661,z]} material={finish.metal}><cylinderGeometry args={[.039,.039,.014,12]} /></mesh>
      <Box at={[x,.669,z]} size={[.043,.002,.007]} material={finish.dark} />
    </group>))}
    {[0,1,2].map(i=><group key={i} position={[0,.597,0]} rotation={[0,i*Math.PI*2/3,0]}><Box at={[.31,0,0]} size={[.5,.022,.035]} material={finish.dark} /></group>)}
  </>;
}
// Repeated surface-mount parts share a draw call, including on mobile.
type BoxSpec = [number, number, number, number, number, number];
function BoxBatch({ boxes, material }: { boxes: BoxSpec[]; material: THREE.Material }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const transform = new THREE.Object3D();
    boxes.forEach(([x,y,z,w,h,d], index) => {
      transform.position.set(x,y,z); transform.scale.set(w,h,d); transform.updateMatrix();
      mesh.current!.setMatrixAt(index,transform.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    mesh.current!.computeBoundingSphere();
  }, [boxes]);
  return <instancedMesh castShadow receiveShadow ref={mesh} args={[undefined,undefined,boxes.length]} material={material}><boxGeometry /></instancedMesh>;
}
function Capacitor({ at, finish }: { at: Vector3Tuple; finish: Finish }) {
  return <group position={at}>
    <mesh material={finish.dark}><cylinderGeometry args={[.056,.056,.025,12]} /></mesh>
    <mesh position={[0,.065,0]} material={finish.metal}><cylinderGeometry args={[.05,.05,.12,12]} /></mesh>
    <Box at={[0,.127,0]} size={[.065,.002,.006]} material={finish.dark} />
    <Box at={[0,.127,0]} size={[.006,.002,.065]} material={finish.dark} />
  </group>;
}
function ComputeCard({ finish, mobile }: { finish: Finish; mobile: boolean }) {
  const count = mobile ? 24 : 48;
  const passives: BoxSpec[] = Array.from({length:count},(_,i)=>[
    -1.48+(i%12)*.245,.28+Math.floor(i/12)*.14,.057,.065,.028,.028,
  ]);
  const pads: BoxSpec[] = passives.flatMap(([x,y,z])=>[-1,1].map(sign=>[x+sign*.039,y,z,.018,.032,.032] as BoxSpec));
  return <>
    {/* PCIe card lies in XY; the keyed edge enters the connector below. */}
    <CardSubstrate material={finish.pcb} />
    <Box at={[0,.045,0]} size={[2.45,.14,.035]} material={finish.pcb} />
    <BoxBatch material={finish.gold} boxes={Array.from({length:64},(_,i)=>[-1.18+i*.037,.028,.02,.023,.1,.004])} />
    <Box at={[-.83,.025,.023]} size={[.055,.13,.008]} material={finish.dark} />
    <Package at={[-.1,.69,.045]} size={[.58,.5,.045]} material={finish.dark} />
    <Box at={[-.1,.69,.078]} size={[.29,.27,.022]} material={finish.metal} />
    <Box at={[-.1,.69,.091]} size={[.23,.21,.006]} material={finish.dark} />
    {[-.64,.43].flatMap(x=>[.53,.86].map(y=><group key={`${x}${y}`}><Package at={[x,y,.062]} size={[.27,.22,.075]} material={finish.dark} /><Marking cell={1} at={[x,y,.101]} size={[.23,.17]} material={finish.marking} /></group>))}
    <BoxBatch material={finish.metal} boxes={[-.64,.43].flatMap(x=>[.53,.86].flatMap(y=>Array.from({length:8},(_,i)=>[x-.11+i*.031,y-.125,.049,.013,.025,.017] as BoxSpec)))} />
    {/* Four VRM phases: MOSFET, shielded inductor and output capacitor. */}
    {[0,1,2,3].map(i=><group key={i} position={[.88+i*.22,0,0]}>
      <Box at={[0,.48,.064]} size={[.13,.13,.07]} material={finish.dark} />
      <Box at={[0,.69,.105]} size={[.16,.16,.14]} material={finish.ceramic} />
      <Box at={[0,.69,.179]} size={[.09,.008,.003]} material={finish.metal} />
      <group position={[0,.92,.075]} rotation={[Math.PI/2,0,0]}><Capacitor at={[0,0,0]} finish={finish} /></group>
    </group>)}
    <BoxBatch boxes={passives} material={finish.ceramic} />
    <BoxBatch boxes={pads} material={finish.metal} />
    <BoxBatch material={finish.metal} boxes={Array.from({length:16},(_,i)=>[.81+Math.floor(i/4)*.22,.44+(i%4)*.027,.035,.035,.014,.008])} />
    <BoxBatch material={finish.gold} boxes={Array.from({length:18},(_,i)=>[-1.58+i*.18,1.01,.02,.018,.018,.003])} />
    <BoxBatch material={finish.trace} boxes={Array.from({length:24},(_,i)=>{
      const x=-1.52+i*.13;
      return [x,.16+(i%3)*.015,.019,.008,.17,.002];
    })} />
    <BoxBatch material={finish.trace} boxes={Array.from({length:16},(_,i)=>[-1.32,.32+i*.035,.019,.42+(i%4)*.045,.006,.002])} />
    <Marking cell={3} at={[-1.2,.86,.019]} size={[.55,.19]} material={finish.marking} />
    <Marking cell={0} at={[-.1,.69,.096]} size={[.2,.18]} material={finish.marking} />
    <Box at={[1.46,1.02,.09]} size={[.45,.17,.17]} material={finish.dark} />
    <BoxBatch material={finish.gold} boxes={Array.from({length:6},(_,i)=>[1.29+i*.065,1.04,.181,.025,.06,.004])} />
    <Box at={[-1.81,.52,0]} size={[.045,1.26,.32]} material={finish.metal} />
    {[.3,.65].map(y=><group key={y}>
      <Box at={[-1.77,y,.11]} size={[.15,.18,.27]} material={finish.metal} />
      <Box at={[-1.77,y,.251]} size={[.105,.115,.012]} material={finish.dark} />
    </group>)}
    {[-1.59,1.59].map(x=><mesh key={x} position={[x,.91,.02]} material={finish.metal}><ringGeometry args={[.027,.046,12]} /></mesh>)}
  </>;
}
// Ribbons follow the baked atlas's 45-degree memory/PCIe fan-out, on the PCB plane.
const boardRoutes:Partial<Record<HardwareId,number[][][]>>={
  cpu:[0,1,2].map(i=>{const z=(-1.67+i*.98)*.49;return [[-1.708,z],[-1.344,z],[-1.28,z+.052],[-1.098,z+.052]];}),
  ram:[0,1,2].map(i=>{const z=-.7+i*.46;return [[1.109,z],[1.378,z],[1.448,z+.058],[1.714,z+.058]];}),
  gpu:[0,1,2].map(i=>{const x=-.9+i*.38;return [[x,1.94],[x,1.87],[x+.064,1.81],[x+.064,1.74]];}),
  ssd:[0,1].map(i=>[[1.11,-.7-i*.07],[1.39+i*.035,-.98-i*.07],[1.39+i*.035,-1.6],[1.24,-1.75-i*.035]]),
};
function DataRoutes({selected,paused,reduced,mobile}:{selected:HardwareId|null;paused:boolean;reduced:boolean;mobile:boolean}){
  const {invalidate}=useThree();
  const meshes=useRef<Record<string,THREE.Mesh>>({});
  const routes=useMemo(()=>Object.entries(boardRoutes).map(([id,paths])=>{
    const vertices:number[]=[],progress:number[]=[];
    for(const path of paths.slice(0,mobile?1:3)){
      const lengths=[0];
      for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
      for(let i=1;i<path.length;i++){
        const a=path[i-1],b=path[i],distance=lengths[i]-lengths[i-1],w=.004;
        const dx=-(b[1]-a[1])/distance*w,dz=(b[0]-a[0])/distance*w;
        const corners=[[a[0]+dx,a[1]+dz],[a[0]-dx,a[1]-dz],[b[0]+dx,b[1]+dz],[b[0]-dx,b[1]-dz]];
        for(const index of [0,1,2,2,1,3]){
          vertices.push(corners[index][0],-.124,corners[index][1]);
          progress.push(lengths[index<2?i-1:i]/lengths.at(-1)!);
        }
      }
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setAttribute('along',new THREE.Float32BufferAttribute(progress,1));
    const material=new THREE.ShaderMaterial({
      uniforms:{strength:{value:0},time:{value:0},ink:{value:new THREE.Color('#d5c29a')}},
      vertexShader:`attribute float along; varying float vAlong; void main(){vAlong=along;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform float strength; uniform float time; uniform vec3 ink; varying float vAlong; void main(){float t=fract(vAlong-time*.24);float pulse=smoothstep(.74,.91,t)*(1.0-smoothstep(.94,1.0,t));gl_FragColor=vec4(ink,strength*(.045+.42*pulse));#include <colorspace_fragment>}`.replace(';#include',';\n#include'),
      transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,
    });
    return {id,geometry,material};
  }),[mobile]);
  useEffect(()=>()=>routes.forEach(({geometry,material})=>{geometry.dispose();material.dispose();}),[routes]);
  useEffect(()=>{invalidate();},[selected,paused,reduced,invalidate]);
  useFrame(({gl},delta)=>{
    let visible=0;
    for(const route of routes){
      const material=meshes.current[route.id]?.material as THREE.ShaderMaterial|undefined;
      if(!material)continue;
      const uniforms=material.uniforms,target=selected===route.id?1:0;
      const next=reduced?target:THREE.MathUtils.damp(uniforms.strength.value,target,7,Math.min(delta,.05));
      uniforms.strength.value=Math.abs(next-target)<.001?target:next;
      if(uniforms.strength.value>0){
        visible++;
        if(!paused && !reduced){uniforms.time.value+=Math.min(delta,.05);invalidate();}
      }
      if(uniforms.strength.value!==target)invalidate();
    }
    gl.domElement.dataset.hardwareFlow=visible?selected??'fading':'none';
  });
  return <group>{routes.map(route=><mesh key={route.id} ref={mesh=>{if(mesh)meshes.current[route.id]=mesh;}} geometry={route.geometry} material={route.material} raycast={()=>{}} />)}</group>;
}
function ProductGround(){
  const texture=useMemo(()=>{
    const size=128,data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const edge=Math.pow((x-63.5)/52,4)+Math.pow((y-63.5)/43,4),i=(y*size+x)*4;
      data[i]=data[i+1]=data[i+2]=0;data[i+3]=Math.round(72*Math.exp(-edge*2));
    }
    const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <group>
    <mesh position={[0,-.247,0]} rotation={[-Math.PI/2,0,0]} raycast={()=>{}}>
      <planeGeometry args={[7,6]} /><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
    <mesh position={[0,-.244,0]} rotation={[-Math.PI/2,0,0]} receiveShadow raycast={()=>{}}>
      <planeGeometry args={[80,80]} /><shadowMaterial transparent opacity={.22} depthWrite={false} />
    </mesh>
  </group>;
}
function Assembly(props: Props & { mobile: boolean; ready: boolean; reduced: boolean }) {
  const { invalidate } = useThree();
  const parts = useRef<Partial<Record<HardwareId, THREE.Group>>>({});
  const fan = useRef<THREE.Group>(null);
  const fanMotion = useRef({speed:0,angle:0});
  const explosion = useRef({ value: props.exploded ? 1 : 0 });
  const view = useRef({ x:7.6, y:7.5, z:9.5, tx:0, ty:.3, tz:0 });
  const introStarted=useRef(false);
  const clock = useRef(0);
  const frames=useRef(0);
  const active = props.selected ?? props.hovered;
  const surfaces = useMemo(() => {
    // Small linear-data textures: subtle mold grain and directional machining.
    const make = (brushed: boolean) => {
      const data = new Uint8Array(64*64*4);
      for(let y=0;y<64;y++)for(let x=0;x<64;x++){
        const noise=Math.sin(x*127.1+y*311.7)*43758.5453;
        const grain=noise-Math.floor(noise);
        const value=Math.round(brushed?222+18*Math.sin(y*2.7)+grain*8:225+grain*30);
        const index=(y*64+x)*4;
        data[index]=data[index+1]=data[index+2]=value;data[index+3]=255;
      }
      const texture=new THREE.DataTexture(data,64,64,THREE.RGBAFormat);
      texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
      texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
      return texture;
    };
    const atlas=document.createElement('canvas');atlas.width=1024;atlas.height=512;
    const ink=atlas.getContext('2d')!;
    const labels=[['C2C / COMPUTE','BGA / REV 02'],['MEMORY','DDR / 8G'],['NAND FLASH','NVMe / 2280'],['C2C ENGINEERING','CTRL / 01'],['DIMM_A','UDIMM / 1.2V'],['M.2 / PCIe','2280 / REV 02'],['C2C / LGA','PROCESSOR'],['R22','POWER STAGE']];
    labels.forEach(([title,detail],i)=>{
      const x=i%4*256,y=Math.floor(i/4)*256;
      ink.fillStyle='#c3c4b7';ink.font='500 25px monospace';ink.fillText(title,x+12,y+88);
      ink.fillStyle='#939a8e';ink.font='18px monospace';ink.fillText(detail,x+12,y+124);
      ink.fillStyle='#bbc0ae';ink.fillRect(x+12,y+151,8,8);
      for(let j=0;j<24;j++)ink.fillRect(x+36+j*7,y+151,j%3===0?3:1,17);
    });
    const markings=new THREE.CanvasTexture(atlas);markings.colorSpace=THREE.SRGBColorSpace;markings.anisotropy=4;
    const circuit=(kind:'gpu'|'ram'|'ssd')=>{
      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=320;
      const ctx=canvas.getContext('2d')!;
      ctx.fillStyle=kind==='ram'?'#45624c':'#4b6855';ctx.fillRect(0,0,1024,320);
      for(let i=0;i<9000;i++){
        const x=(i*73)%1024,y=(i*137)%320;
        ctx.fillStyle=i%2?'#ffffff05':'#00000007';ctx.fillRect(x,y,1,1);
      }
      ctx.strokeStyle='#81926a';ctx.lineWidth=.8;
      for(let i=0;i<42;i++){
        const x=65+i*21;
        ctx.beginPath();ctx.moveTo(x,310);ctx.lineTo(x,255-i%6*8);ctx.lineTo(x+(i%2?14:-14),230-i%6*8);ctx.lineTo(x+(i%2?14:-14),155);ctx.stroke();
        ctx.fillStyle='#9ba47c';ctx.beginPath();ctx.arc(x,300,1.5,0,Math.PI*2);ctx.fill();
      }
      ctx.strokeStyle='#bac2a290';ctx.lineWidth=1;
      for(const x of [55,285,515,745])ctx.strokeRect(x,38,135,144);
      ctx.fillStyle='#c6c9b0';ctx.font='14px monospace';ctx.fillText(kind==='gpu'?'COMPUTE / REV 02':kind==='ram'?'DIMM / A1':'NVMe / 2280',28,24);
      for(let i=0;i<12;i++){ctx.font='10px monospace';ctx.fillText(`C${101+i}`,50+i*76,280);}
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
    };
    return {grain:make(false),brushed:make(true),markings,gpu:circuit('gpu'),ram:circuit('ram'),ssd:circuit('ssd')};

  },[]);
  useEffect(()=>()=>{Object.values(surfaces).forEach(texture=>texture.dispose());},[surfaces]);
  const materials = useMemo(() => Object.fromEntries(hardware.map(part => {
    const colors = { pcb: part.id==='ram'?'#304c3b':'#344f40', metal:'#aab2b5', dark:part.id==='cooling'?'#171c19':part.id==='io'?'#232923':'#1c211e', gold:'#a68d60', ceramic:'#736e61', trace:'#52694e', marking:'#d4d4c5' };
    const finish = Object.fromEntries(Object.entries(colors).map(([key,color]) => {
      const metallic=key==='metal'||key==='gold';
      const material = new THREE.MeshStandardMaterial({
        color, metalness:key==='metal'?.92:key==='gold'?.78:.03,
        roughness:key==='metal'?(part.id==='cooling'?.34:.38):key==='gold'?.48:key==='dark'?.72:.88,
        roughnessMap:metallic?surfaces.brushed:surfaces.grain,
        bumpMap:metallic?surfaces.brushed:surfaces.grain,
        bumpScale:metallic?.0008:.0015,
        envMapIntensity:metallic?.72:key==='dark'?.18:.32,
      });
      if(key==='pcb' && (part.id==='gpu'||part.id==='ram'||part.id==='ssd')){
        material.map=surfaces[part.id];material.color.set('#a9b4a6');
      }
      if(key==='marking'){
        material.map=surfaces.markings;material.transparent=true;material.alphaTest=.08;
        material.depthWrite=false;material.polygonOffset=true;material.polygonOffsetFactor=-2;
        material.roughness=.92;material.bumpMap=null;material.roughnessMap=null;
      }
      material.userData.reflection=material.envMapIntensity;
      material.userData.emphasis=1;
      material.userData.original = material.color.clone();
      return [key,material];
    }));
    return [part.id,finish];
  })), [surfaces]) as Record<HardwareId, Finish>;
  useEffect(() => () => { for (const finish of Object.values(materials)) for (const material of Object.values(finish)) material.dispose(); }, [materials]);
  useEffect(() => { invalidate(); }, [active,invalidate]);
  useEffect(() => {
    const target=props.exploded?1:0;
    // A linear master clock makes assembling the exact reverse of separation.
    const tween = gsap.to(explosion.current, {
      value:target,duration:props.reduced?0:1.45*Math.abs(target-explosion.current.value),
      ease:'none',onUpdate:invalidate,
    });
    return () => { tween.kill(); };
  }, [props.exploded,props.reduced,invalidate]);
  useEffect(() => {
    if(!props.ready)return;
    const inspecting=props.selected!==null && props.selected!=='motherboard';
    const entering=!props.selected && (!hardwareIntroPlayed || introStarted.current) && !props.reduced;
    if(entering && !introStarted.current){
      view.current.x*=1.045;view.current.y*=1.045;view.current.z*=1.045;
      introStarted.current=true;
    }
    hardwareIntroPlayed=true;
    if(props.selected || props.reduced)introStarted.current=false;
    const zoom=inspecting?(props.mobile?.9:.78):1;
    const tween=gsap.to(view.current,{
      x:7.6*zoom,y:7.5*zoom,z:9.5*zoom,
      duration:props.reduced?0:entering?1.35:1.05,
      ease:entering?'power2.out':'power2.inOut',onUpdate:invalidate,
      onComplete:()=>{introStarted.current=false;},
    });
    invalidate();
    return ()=>{tween.kill();};
  },[props.selected,props.mobile,props.ready,props.reduced,invalidate]);
  useFrame(({ camera,gl,invalidate }, delta) => {
    const v=view.current, factor=props.mobile?1.12:1;
    const step=Math.min(delta,.05);
    for (const part of hardware) {
      const group=parts.current[part.id];
      if (group) group.position.y=part.lift*separationProgress(part.id,explosion.current.value);
      for (const material of Object.values(materials[part.id])) {
        const original=material.userData.original as THREE.Color;
        const target=active && active!==part.id ? 0 : 1;
        const blend=props.reduced?target:THREE.MathUtils.damp(material.userData.emphasis as number,target,10,step);
        const emphasis=Math.abs(blend-target)<.001?target:blend;
        material.userData.emphasis=emphasis;
        material.color.copy(original).multiplyScalar(.74+.26*emphasis);
        material.envMapIntensity=(material.userData.reflection as number)*(.68+.32*emphasis);
        if(emphasis!==target)invalidate();
        material.emissiveIntensity=0;
      }
    }
    // Follow the moving part, rather than the final exploded destination.
    const selected=hardware.find(part=>part.id===props.selected && part.id!=='motherboard');
    const targetX=selected?.position[0]??0;
    const targetY=selected?selected.position[1]+selected.lift*separationProgress(selected.id,explosion.current.value):.3;
    const targetZ=selected?.position[2]??0;
    const settle=(current:number,target:number)=>{
      const next=props.reduced?target:THREE.MathUtils.damp(current,target,6,step);
      if(Math.abs(next-target)<.0005)return target;
      invalidate();return next;
    };
    v.tx=settle(v.tx,targetX);v.ty=settle(v.ty,targetY);v.tz=settle(v.tz,targetZ);
    camera.position.set(v.tx+v.x*factor,v.ty+v.y*factor,v.tz+v.z*factor);
    camera.lookAt(v.tx,v.ty,v.tz);
    if(active && !props.paused && !props.reduced)clock.current+=step;
    if(!props.paused && !props.reduced){
      const motion=fanMotion.current, target=active==='cooling'?3:0;
      motion.speed=THREE.MathUtils.damp(motion.speed,target,6,Math.min(delta,.05));
      if(Math.abs(motion.speed-target)<.001)motion.speed=target;
      motion.angle=(motion.angle+motion.speed*Math.min(delta,.05))%(Math.PI*2);
      if(motion.speed>0)invalidate();
    }
    if(fan.current)fan.current.rotation.y=fanMotion.current.angle;
    gl.domElement.dataset.hardwarePart=active??'none'; gl.domElement.dataset.explosion=explosion.current.value.toFixed(3);
    gl.domElement.dataset.flowFrame=String(Math.round(clock.current*1000));
    gl.domElement.dataset.hardwareFrame=String(++frames.current);
    gl.domElement.dataset.hardwareCamera=[camera.position.x,camera.position.y,camera.position.z].map(n=>n.toFixed(3)).join(',');
  });
  const group=(id:HardwareId,children:React.ReactNode)=><group key={id} ref={value=>{if(value)parts.current[id]=value;}} onPointerOver={e=>{e.stopPropagation();if(e.pointerType!=='touch')props.onHover(id);}} onPointerOut={e=>{e.stopPropagation();props.onHover(null);}} onClick={e=>{e.stopPropagation();props.onHover(null);props.onSelect(id);}}>{children}</group>;
  const cpu=materials.cpu,gpu=materials.gpu,ram=materials.ram,ssd=materials.ssd,cool=materials.cooling,io=materials.io;
  return <>
    <Studio />
    <ProductGround />
    <DataRoutes selected={props.selected} paused={props.paused} reduced={props.reduced} mobile={props.mobile} />
    <ambientLight intensity={.22} />
    <hemisphereLight args={['#eef0f2','#454641',.65]} />
    <directionalLight position={[-3,7,5]} intensity={2.1} color="#fff7ed"
      castShadow={!props.mobile} shadow-mapSize={[1024,1024]} shadow-radius={3.5}
      shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4}
      shadow-camera-near={.5} shadow-camera-far={20} shadow-bias={-.00015} shadow-normalBias={.012} />
    <directionalLight position={[5,3,2]} intensity={.7} color="#e5ebf0" />
    <directionalLight position={[1,4,-5]} intensity={1.15} color="#edf0f3" />
{group('motherboard',
  <>
  <Suspense fallback={null}>
    <group
      position={[0, 0.16, 0]}
      scale={[0.56, 0.56, 0.49]}
    >
      <MotherboardModel mobile={props.mobile} product />
    </group>
  </Suspense>
  {[-2.2624,2.2624].flatMap(x=>[-1.8277,1.8277].map(z=><mesh key={`${x}${z}`} position={[x,-.218,z]} material={materials.motherboard.metal} castShadow><cylinderGeometry args={[.047,.055,.05,12]} /></mesh>))}
  </>
)}
    {/* GLB socket is centered at the origin; DIMM centers are 3.12/3.63 * .56. */}
    {group('cpu',<>
      <Box at={[0,.095,0]} size={[1.94,.07,1.68]} material={cpu.pcb} />
      <Package at={[0,.153,0]} size={[1.71,.045,1.48]} material={cpu.metal} />
      <Marking cell={6} at={[0,.177,0]} rotation={[-Math.PI/2,0,0]} size={[.7,.48]} material={cpu.marking} />
      <BoxBatch material={cpu.gold} boxes={Array.from({length:20},(_,i)=>[-.86+i*.09,.133,-.8,.035,.008,.035])} />
    </>)}
    {group('ram',<>{[1.7472,2.0328].map(x=><group key={x} position={[x,0,.049]}>
      <Box at={[0,.34,0]} size={[.026,.59,2.5]} material={ram.pcb} />
      {[-1,1].map(side=><group key={side}>
        <BoxBatch material={ram.dark} boxes={Array.from({length:8},(_,i)=>[side*.034,.39,-1.08+i*.305,.038,.24,.22])} />
        {Array.from({length:8},(_,i)=><Marking key={i} cell={1} at={[side*.054,.39,-1.08+i*.305]} rotation={[0,side*Math.PI/2,0]} size={[.19,.17]} material={ram.marking} />)}
        <BoxBatch material={ram.gold} boxes={Array.from({length:64},(_,i)=>[side*.014,.09,-1.2+i*.038,.003,.085,.023])} />
        <BoxBatch material={ram.ceramic} boxes={Array.from({length:16},(_,i)=>[side*.021,.56,-1.13+i*.15,.016,.025,.045])} />
      </group>)}
      <Marking cell={4} at={[.014,.59,.72]} rotation={[0,Math.PI/2,0]} size={[.48,.07]} material={ram.marking} />
      <Box at={[0,.08,-.32]} size={[.03,.09,.035]} material={ram.dark} />
    </group>)}</>)}
    {group('gpu',<group position={[-.2,-.005,1.73]}><ComputeCard finish={gpu} mobile={props.mobile} /></group>)}
    {group('ssd',<group position={[.42,-.015,-1.79]}>
      {/* M.2 2280 proportions with an open mounting cutout. */}
      <Box at={[0,0,0]} size={[1.52,.026,.44]} material={ssd.pcb} />
      {[-1,1].map(sign=><Box key={sign} at={[-.8,0,sign*.151]} size={[.08,.026,.138]} material={ssd.pcb} />)}
      {[-.48,-.09].map(x=><group key={x}><Package at={[x,.046,0]} size={[.31,.065,.33]} material={ssd.dark} /><Marking cell={2} at={[x,.079,0]} rotation={[-Math.PI/2,0,0]} size={[.27,.28]} material={ssd.marking} /></group>)}
      <Marking cell={5} at={[.04,.014,0]} rotation={[-Math.PI/2,0,0]} size={[1.2,.38]} material={ssd.marking} />
      <Box at={[.37,.038,0]} size={[.22,.05,.26]} material={ssd.dark} />
      <BoxBatch material={ssd.ceramic} boxes={Array.from({length:12},(_,i)=>[-.6+i*.105,.025,.19,.04,.018,.025])} />
      <BoxBatch material={ssd.metal} boxes={Array.from({length:12},(_,i)=>[-.6+i*.105,.021,-.19,.045,.012,.025])} />
      <BoxBatch material={ssd.gold} boxes={Array.from({length:20},(_,i)=>[.724,.015,-.195+i*.02,.13,.003,.012])} />
      <Box at={[.73,.017,.09]} size={[.14,.008,.025]} material={ssd.dark} />
      <Box at={[.82,-.01,0]} size={[.13,.11,.51]} material={ssd.dark} />
      <mesh position={[-.81,-.065,0]} material={ssd.metal}><cylinderGeometry args={[.055,.055,.1,12]} /></mesh>
      <mesh position={[-.81,.018,0]} material={ssd.metal}><cylinderGeometry args={[.062,.062,.022,16]} /></mesh>
      <Box at={[-.81,.03,0]} size={[.065,.003,.009]} material={ssd.dark} />
    </group>)}
    {group('cooling',<>
      <Box at={[0,.206,0]} size={[1.36,.06,1.28]} material={cool.metal} />
      <BoxBatch material={cool.metal} boxes={Array.from({length:props.mobile?17:27},(_,i)=>[-.76+i*(props.mobile?.095:.0585),.415,0,.012,.35,1.44])} />
      {[-.45,.45].map(x=><mesh key={x} position={[x,.27,0]} rotation={[Math.PI/2,0,0]} material={cool.metal}><cylinderGeometry args={[.035,.035,1.46,10]} /></mesh>)}
      {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}${z}`}>
        <Box at={[x*.85,.22,z*.85]} size={[.15,.035,.15]} material={cool.metal} />
        <mesh position={[x*.85,.25,z*.85]} material={cool.dark}><cylinderGeometry args={[.038,.038,.04,12]} /></mesh>
      </group>))}
      <FanFrame finish={cool} />
      <group ref={fan} position={[0,.65,0]}><Fan radius={.56} material={cool.dark} bladeMaterial={cool.dark} /></group>
    </>)}
    {group('io',<>
      <Box at={[-2.23,.01,-1.77]} size={[.3,.28,.42]} material={io.metal} />
      <Box at={[-2.385,.01,-1.77]} size={[.012,.16,.3]} material={io.dark} />
      <Box at={[2.27,-.025,-1.77]} size={[.24,.18,.4]} material={io.dark} />
      <BoxBatch material={io.gold} boxes={Array.from({length:8},(_,i)=>[2.23+(i%2)*.08,.07,-1.91+Math.floor(i/2)*.09,.027,.035,.027])} />
    </>)}
    {/* Board-side socket stays seated while the card lifts for inspection. */}
    <group onClick={e=>{e.stopPropagation();props.onHover(null);props.onSelect('motherboard');}}>
      <Box at={[-.2,-.077,1.73]} size={[2.75,.15,.14]} material={materials.motherboard.dark} />
    </group>

  </>;
}
export default function HardwareScene(props:Props) {
  const mobile=useMediaQuery('(max-width:767px)',true);
  const reduced=useMediaQuery('(prefers-reduced-motion: reduce)',true);
  const [lost,setLost]=useState(false);
  const [prepared,setPrepared]=useState(false);
  const compiled=useCallback(()=>setPrepared(true),[]),failed=useCallback(()=>setLost(true),[]);
  if(lost)return <HardwareFallback active={props.selected} exploded={props.exploded} />;
  return <Canvas onPointerMissed={event=>{if(event.type==='click'){props.onHover(null);props.onSelect(null);}}} shadows={mobile?false:'percentage'} className="computer-canvas" dpr={[1,mobile?1:1.4]} camera={{position:[7.6,7.8,9.5],fov:mobile?31:22.5}} frameloop={prepared?'demand':'never'} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} fallback={<HardwareFallback active={props.selected} />}><StudioReady><ContextWatcher onLost={failed} /><Assembly {...props} mobile={mobile} ready={prepared} reduced={reduced} /><RendererWarmup onReady={compiled} onError={failed} /></StudioReady></Canvas>;
}
