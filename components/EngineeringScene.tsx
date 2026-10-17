'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import ProcessorModel from './ProcessorModel';
import ProcessorStudio, {ProcessorStudioReady} from './ProcessorStudio';
import { useMediaQuery } from '@/lib/use-media-query';
import CoreFallback from './CoreFallback';
import { recordSceneError } from '@/lib/scene-diagnostics';
import {RendererWarmup} from './ScenePreparation';
import {MotherboardReady,preloadMotherboard} from './MotherboardModel';
import './processor-world.css';
type Props = {
  progress: RefObject<{ value: number }>;
  onReady: (invalidate: () => void) => void;
  onFail: () => void;
};
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
  const preparing=useCallback(()=>setPrepared(false),[]);
  const compiled=useCallback(()=>{setPrepared(true);onReady(invalidateScene.current);},[onReady]);
  preloadMotherboard(mobile);
  useEffect(()=>{if(visible&&prepared)invalidateScene.current();},[visible,prepared]);
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
    <div ref={host} className="engineering-canvas processor-world" style={{visibility:prepared?'visible':'hidden'}}>
      <Canvas
        camera={{ position: [8.7, 8.4, 12.5], fov: 39 }}
        dpr={[1, mobile ? 1.25 : 1.5]}
        shadows={mobile ? false : 'soft'}
        frameloop={visible && prepared ? 'demand' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        fallback={<CoreFallback />}
        onPointerMove={() => invalidateScene.current()}
        onCreated={({ invalidate }) => {
          invalidateScene.current = invalidate;
        }}
      >
        <HeroContextWatcher onLost={failed}/>
        <Suspense fallback={null}><MotherboardReady mobile={mobile}>
          <ProcessorStudioReady><ProcessorStudio /><ProcessorModel progress={progress} mobile={mobile} />
            <HeroGpuLifecycle/>
            <RendererWarmup key={String(mobile)} onStart={preparing} onReady={compiled} onError={failed} />
          </ProcessorStudioReady>
        </MotherboardReady></Suspense>
      </Canvas>
    </div>
  );
}
