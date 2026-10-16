'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { use, useCallback, useEffect, useRef, useState, type RefObject, type ReactNode } from 'react';
import * as THREE from 'three';
import ProcessorModel from './ProcessorModel';
import { useMediaQuery } from '@/lib/use-media-query';
import CoreFallback from './CoreFallback';
import { recordSceneError } from '@/lib/scene-diagnostics';
import studioManifest from '@/public/models/studio-env.json';
import './processor-world.css';
type Props = {
  progress: RefObject<{ value: number }>;
  onReady: (invalidate: () => void) => void;
  onFail: () => void;
};
let studioUsers=0;
const studioEnvironment=fetch('/models/studio-env.bin.gz').then(async response=>{
  if(!response.ok||!response.body)throw new Error('Stüdyo yansıması yüklenemedi.');
  const bytes=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  if(bytes.byteLength!==studioManifest.bytes)throw new Error('Stüdyo yansıma verisi eksik.');
  const texture=new THREE.DataTexture(new Uint16Array(bytes),studioManifest.width,studioManifest.height,THREE.RGBAFormat,THREE.HalfFloatType);
  texture.mapping=THREE.CubeUVReflectionMapping;
  texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  texture.needsUpdate=true;
  return texture;
});
export function StudioReady({children}:{children:ReactNode}) {use(studioEnvironment);return children;}
export function Studio() {
  const { scene,invalidate } = useThree();
  const texture=use(studioEnvironment);
  useEffect(() => {
    studioUsers++;
    // Re-upload this imperative Three texture after its last GPU owner disposed it.
    // eslint-disable-next-line react-hooks/immutability
    texture.needsUpdate=true;
    const previous = scene.environment;
    // R3F exposes an imperative Three.js scene, not immutable React state.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = texture;
    invalidate();
    return () => {
      scene.environment = previous;
      if(--studioUsers===0)texture.dispose();
    };
  }, [scene,texture,invalidate]);
  return null;
}
export function RendererWarmup({onReady,onError}:{onReady:()=>void;onError:()=>void}) {
  const {gl,scene,camera}=useThree();
  useEffect(()=>{
    let disposed=false;
    // Yield to paint, then let KHR_parallel_shader_compile prepare the programs.
    const timer=setTimeout(()=>{
      void gl.compileAsync(scene,camera).then(()=>{if(!disposed)onReady();}).catch(error=>{if(!disposed){recordSceneError(error);onError();}});
    },0);
    return()=>{disposed=true;clearTimeout(timer);};
  },[gl,scene,camera,onReady,onError]);
  return null;
}

function HeroContextWatcher({onLost}:{onLost:()=>void}) {
  const {gl}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    const handle=(event:Event)=>{
      event.preventDefault();
      recordSceneError('WebGL context kaybedildi; sahne alternatifi gösteriliyor.');
      onLost();
    };
    canvas.addEventListener('webglcontextlost',handle);
    return()=>canvas.removeEventListener('webglcontextlost',handle);
  },[gl,onLost]);
  return null;
}

function HeroGpuLifecycle(){
  const {scene,gl}=useThree();
  useEffect(()=>{
    // Next's Activity cache can hide a route while keeping its Canvas connected.
    // Intrinsic R3F materials would otherwise keep their programs until eviction.
    const materials=new Set<THREE.Material>();
    const shadows:THREE.LightShadow[]=[];
    scene.traverse(node=>{
      if(node instanceof THREE.Mesh){
        const owned=Array.isArray(node.material)?node.material:[node.material];
        owned.forEach(material=>materials.add(material));
      }
      if(node instanceof THREE.DirectionalLight)shadows.push(node.shadow);
    });
    return()=>{
      // Retain these references: R3F detaches nodes before passive cleanup.
      materials.forEach(material=>material.dispose());
      shadows.forEach(shadow=>shadow.map?.dispose());
      gl.renderLists.dispose();
    };
  },[scene,gl]);
  return null;
}

export default function EngineeringScene({ progress, onReady, onFail }: Props) {
  const invalidateScene = useRef<() => void>(() => {});
  const mobile = useMediaQuery('(max-width:1023px)', true),
    host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true),
    [lost, setLost] = useState(false);
  const [prepared,setPrepared]=useState(false);
  const compiled=useCallback(()=>setPrepared(true),[]);
  const failed=useCallback(()=>{setLost(true);onFail();},[onFail]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting && !document.hidden),
    );
    if (host.current) observer.observe(host.current);
    const change = () =>
      setVisible(
        !document.hidden &&
          Boolean(host.current && host.current.getBoundingClientRect().bottom > 0),
      );
    document.addEventListener('visibilitychange', change);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', change);
    };
  }, []);
  if (lost) return <CoreFallback />;
  return (
    <div ref={host} className="engineering-canvas processor-world">
      <Canvas
        camera={{ position: [8.7, 8.4, 12.5], fov: 39 }}
        dpr={[1, mobile ? 1 : 1.5]}
        shadows={mobile ? false : 'soft'}
        frameloop={visible && prepared ? 'demand' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        fallback={<CoreFallback />}
        onPointerMove={() => invalidateScene.current()}
        onCreated={({ invalidate }) => {
          invalidateScene.current = invalidate;
          onReady(invalidate);
        }}
      >
        <HeroContextWatcher onLost={failed}/>
        <HeroGpuLifecycle/>
        <StudioReady><Studio /><ProcessorModel progress={progress} mobile={mobile} />
        <RendererWarmup onReady={compiled} onError={failed} /></StudioReady>
      </Canvas>
    </div>
  );
}
