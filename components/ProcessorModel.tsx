'use client';
import { use, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { coreMotion } from '@/lib/core-motion';
import MotherboardModel from './MotherboardModel';
import { publishHeroProjection } from '@/lib/hero-projection';

const files={metalColor:'metal-color.webp',metalSurface:'metal-surface.png',metalNormal:'metal-normal.png',siliconColor:'silicon-color.webp',siliconSurface:'silicon-surface.png',siliconNormal:'silicon-normal.png',substrateColor:'substrate-color.webp',substrateSurface:'substrate-surface.png',substrateNormal:'substrate-normal.png',shadow:'shadow.png'} as const;
const names=Object.keys(files) as (keyof typeof files)[];
const assets=Promise.all([
  fetch('/models/processor/geometry.json.gz').then(r=>{if(!r.ok||!r.body)throw new Error('Processor geometry unavailable');return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).json();}).then(data=>Object.fromEntries(Object.entries(data).map(([key,value])=>[key,new THREE.BufferGeometryLoader().parse(value as THREE.BufferGeometryJSON)]))),
  Promise.all(names.map(name=>new THREE.TextureLoader().loadAsync(`/models/processor/${files[name]}`))).then(textures=>Object.fromEntries(names.map((name,i)=>{
    const texture=textures[i];if(name.endsWith('Color'))texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=4;return[name,texture];
  })) as Record<typeof names[number],THREE.Texture>),
]);
let owners=0;
const lifts=[1.04,1.04,.16,0,-.08,-.16,-.22];
// Reused scratch vectors: no per-frame allocation for the tracking rig.
const cpuOffset=new THREE.Vector3(),cameraTarget=new THREE.Vector3();

function Contacts({mobile}:{mobile:boolean}){
  const pads=useRef<THREE.InstancedMesh>(null),caps=useRef<THREE.InstancedMesh>(null);
  const n=mobile?15:21,hole=mobile?2:3,count=n*n-(hole*2+1)**2;
  useLayoutEffect(()=>{
    if(!pads.current||!caps.current)return;
    const matrix=new THREE.Matrix4();let index=0;
    for(let z=0;z<n;z++)for(let x=0;x<n;x++){
      if(Math.abs(x-(n-1)/2)<=hole&&Math.abs(z-(n-1)/2)<=hole)continue;
      matrix.makeTranslation((x/(n-1)-.5)*3.73,-.1,(z/(n-1)-.5)*3.73);pads.current.setMatrixAt(index++,matrix);
    }
    pads.current.instanceMatrix.needsUpdate=true;
    for(let i=0;i<12;i++){matrix.makeTranslation((i%4-1.5)*.22,-.115,(Math.floor(i/4)-1)*.24);caps.current.setMatrixAt(i,matrix);}
    caps.current.instanceMatrix.needsUpdate=true;
    pads.current.computeBoundingSphere();caps.current.computeBoundingSphere();
  },[n,hole]);
  useFrame(({gl})=>{if(pads.current)gl.domElement.dataset.contacts=String(pads.current.count);});
  return <>
    <instancedMesh ref={pads} args={[undefined,undefined,count]}><cylinderGeometry args={[mobile?.071:.057,mobile?.071:.057,.012,8]}/><meshStandardMaterial color="#c8b27b" metalness={.83} roughness={.34}/></instancedMesh>
    <instancedMesh ref={caps} args={[undefined,undefined,12]}><boxGeometry args={[.14,.045,.09]}/><meshStandardMaterial color="#777d6b" metalness={.6} roughness={.42}/></instancedMesh>
  </>;
}

export default function ProcessorModel({progress,mobile}:{progress:RefObject<{value:number}>;mobile:boolean}){
  const [geometry,maps]=use(assets);
  const assembly=useRef<THREE.Group>(null),packageGroup=useRef<THREE.Group>(null),layers=useRef<THREE.Group>(null),frames=useRef(0);
  useEffect(()=>{
    owners++;
    // Geometry passed as a mesh property is owned here; R3F disposes each
    // declarative material. Cached arrays/textures can be uploaded on remount.
    Object.values(maps).forEach(texture=>{texture.needsUpdate=true;});
    return()=>{if(--owners===0){Object.values(geometry).forEach(g=>g.dispose());Object.values(maps).forEach(t=>t.dispose());}};
  },[geometry,maps]);
  useFrame(({camera,gl,scene,pointer})=>{
    if(!assembly.current||!layers.current)return;
    const p=progress.current.value,m=coreMotion(p),scale=mobile?1.12:1;
    const settle=(start:number,end:number)=>{const t=THREE.MathUtils.clamp((p-start)/(end-start),0,1);return 1-t*t*(3-2*t);};
    const bodyOpening=p>.75?.85*settle(.75,.91):m.separation;
    const lidOpening=p>.75?.85*settle(.85,1):m.separation;
    assembly.current.rotation.set(.035,m.rotation+pointer.x*.004,-.025);
    if(packageGroup.current)packageGroup.current.position.y=.32*bodyOpening;
    layers.current.children.forEach((layer,i)=>{layer.position.y=lifts[i]*(i<2?lidOpening:bodyOpening);});
    assembly.current.updateMatrixWorld(true);
    // Track only the package body's world translation, never the changing
    // exploded bounds. Both eye and target travel together at a fixed distance.
    if(packageGroup.current)packageGroup.current.getWorldPosition(cpuOffset).sub(assembly.current.position);
    camera.position.set(m.cameraX*scale+cpuOffset.x,m.cameraY+cpuOffset.y,m.cameraZ*scale+cpuOffset.z);
    cameraTarget.set(cpuOffset.x,.05+cpuOffset.y,cpuOffset.z);camera.lookAt(cameraTarget);
    if(location.search.includes('measure=1')){
      camera.updateMatrixWorld(true);
      publishHeroProjection(gl.domElement,camera,layers.current.children[3].children[0] as THREE.Mesh,layers.current.children[2].children[1] as THREE.Mesh,assembly.current,cameraTarget);
    }
    const c=gl.domElement;
    c.dataset.frames=String(++frames.current);c.dataset.separation=m.separation.toFixed(3);c.dataset.integration=m.integration.toFixed(3);
    c.dataset.camera=camera.position.toArray().map(v=>v.toFixed(2)).join(',');
    c.dataset.layers=layers.current.children.map(g=>g.position.y.toFixed(4)).join(',');
    // Read after R3F's render, including the first demand-rendered frame.
    queueMicrotask(()=>{
      c.dataset.drawCalls=String(gl.info.render.calls);c.dataset.triangles=String(gl.info.render.triangles);
      c.dataset.programs=String(gl.info.programs?.length||0);c.dataset.geometries=String(gl.info.memory.geometries);c.dataset.textures=String(gl.info.memory.textures);
    });
    c.dataset.model='motherboard-processor';
    c.dataset.packageLift=String(packageGroup.current?.position.y||0);
    // Development-only export of the actual rendered scene for mobile posters.
    if(process.env.NODE_ENV==='development'&&location.search.includes('capture=1'))queueMicrotask(()=>{c.dataset.poster=c.toDataURL('image/png');});
    scene.userData.progress=p;
  });
  return <>
    <ambientLight intensity={.12} color="#f6f3e9"/>
    <hemisphereLight args={['#f6f3e9','#12352a',.3]}/>
    <directionalLight position={[2,7,4]} intensity={1.9} color="#fff8ec" castShadow={!mobile} shadow-mapSize={[1024,1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-normalBias={.015} shadow-bias={-.0001} shadow-radius={3}/>
    <directionalLight position={[-4,2,-4]} intensity={1.1} color="#dce4d9"/>
    <group ref={assembly} scale={mobile?.84:1} position={mobile?[-.55,0,0]:[0,0,0]}>
      <MotherboardModel mobile={mobile}/>
      <group ref={packageGroup}>
      <group ref={layers}>
        <group name="heat-spreader">
          <mesh geometry={geometry.lid} castShadow receiveShadow><meshStandardMaterial color="#e0e2d9" map={maps.metalColor} metalness={.98} roughness={.75} roughnessMap={maps.metalSurface} normalMap={maps.metalNormal} normalScale={new THREE.Vector2(.16,.16)} envMapIntensity={1.1}/></mesh>
        </group>
        <group name="thermal-interface"><mesh geometry={geometry.thermal} castShadow><meshStandardMaterial color="#858a7f" metalness={.1} roughness={.88}/></mesh></group>
        <group name="silicon-die">
          <mesh geometry={geometry.die} castShadow receiveShadow><meshStandardMaterial color="#697468" metalness={.7} roughness={.25}/></mesh>
          <mesh position={[0,.103,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[1.75,1.39]}/>{mobile?<meshStandardMaterial map={maps.siliconColor} roughnessMap={maps.siliconSurface} normalMap={maps.siliconNormal} normalScale={new THREE.Vector2(.12,.12)} metalness={.5} roughness={.6} envMapIntensity={1.1}/>:<meshPhysicalMaterial map={maps.siliconColor} roughnessMap={maps.siliconSurface} normalMap={maps.siliconNormal} normalScale={new THREE.Vector2(.12,.12)} metalness={.5} roughness={.6} clearcoat={.5} clearcoatRoughness={.12} ior={1.46} envMapIntensity={1.1}/>}</mesh>
        </group>
        <group name="upper-substrate">
          <mesh geometry={geometry.substrate} castShadow receiveShadow><meshStandardMaterial color="#28432c" roughness={.5} metalness={.22}/></mesh>
          <mesh position={[0,.023,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[3.99,3.99]}/><meshStandardMaterial map={maps.substrateColor} roughnessMap={maps.substrateSurface} normalMap={maps.substrateNormal} normalScale={new THREE.Vector2(.18,.18)} metalness={.2} roughness={.95}/></mesh>
          {[-1,1].flatMap(sign=>[-1.25,-.75,-.25,.25,.75,1.25].map(x=><mesh key={`${sign}:${x}`} position={[x,.041,sign*1.91]} castShadow><boxGeometry args={[.15,.035,.075]}/><meshStandardMaterial color="#a3a58f" metalness={.6} roughness={.5}/></mesh>))}
          <mesh position={[-1.85,.021,1.85]} rotation={[-Math.PI/2,0,Math.PI/4]}><circleGeometry args={[.075,3]}/><meshStandardMaterial color="#c8b27b" metalness={.7} roughness={.35}/></mesh>
        </group>
        <group name="internal-routing"><mesh geometry={geometry.routing} castShadow><meshStandardMaterial color="#aa8d5b" metalness={.8} roughness={.4}/></mesh><mesh position={[0,-.027,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[3.94,3.94]}/><meshStandardMaterial map={maps.substrateColor} color="#c2a36f" metalness={.65} roughness={.4}/></mesh></group>
        <group name="lower-substrate"><mesh geometry={geometry.substrate} position={[0,-.065,0]} castShadow receiveShadow><meshStandardMaterial color="#203f2c" roughness={.48} metalness={.25}/></mesh></group>
        <group name="land-grid"><Contacts mobile={mobile}/></group>
      </group>
      </group>
    </group>
    <mesh position={[0,-1.32,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[7,7]}/><meshBasicMaterial map={maps.shadow} transparent opacity={.2} depthWrite={false}/></mesh>
  </>;
}
