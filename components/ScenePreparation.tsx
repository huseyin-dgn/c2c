'use client';
import {use,useEffect,useLayoutEffect,type ReactNode} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {recordSceneError} from '@/lib/scene-diagnostics';
import studioManifest from '@/public/models/studio-env.json';

let studioUsers=0;
let studioEnvironment:Promise<THREE.DataTexture>|undefined;
const loadStudioEnvironment=()=>studioEnvironment??=fetch('/models/studio-env.bin.gz').then(async response=>{
  if(!response.ok||!response.body)throw new Error('Stüdyo yansıması yüklenemedi.');
  const bytes=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  if(bytes.byteLength!==studioManifest.bytes)throw new Error('Stüdyo yansıma verisi eksik.');
  const texture=new THREE.DataTexture(new Uint16Array(bytes),studioManifest.width,studioManifest.height,THREE.RGBAFormat,THREE.HalfFloatType);
  texture.mapping=THREE.CubeUVReflectionMapping;
  texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  texture.needsUpdate=true;
  return texture;
});
export function preloadStudio(){void loadStudioEnvironment().catch(()=>{});}
export function StudioReady({children}:{children:ReactNode}) {use(loadStudioEnvironment());return children;}
export function Studio() {
  const { scene,invalidate } = useThree();
  const texture=use(loadStudioEnvironment());
  useLayoutEffect(() => {
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
/** Prepare the complete suspended scene before exposing its first frame. */
/* eslint-disable react-hooks/immutability -- R3F exposes imperative Three.js renderer/texture state, not React state. */
export function RendererWarmup({onReady,onError,onStart}:{onReady:()=>void;onError:()=>void;onStart:()=>void}) {
  const {gl,scene,camera,advance}=useThree();
  useLayoutEffect(()=>{
    gl.domElement.dataset.sceneReady='false';
    onStart();
  },[gl,onStart]);
  useEffect(()=>{
    let disposed=false;
    const yieldTask=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
    const prepare=async()=>{
      await yieldTask();
      if(disposed)return;
      const started=performance.now(),textures=new Set<THREE.Texture>();
      if(scene.environment)textures.add(scene.environment);
      scene.traverse(node=>{
        if(!(node instanceof THREE.Mesh))return;
        const materials=Array.isArray(node.material)?node.material:[node.material];
        for(const material of materials)for(const value of Object.values(material)){
          if(value instanceof THREE.Texture)textures.add(value);
        }
      });
      // Texture decode/upload/mipmaps otherwise stall the first animated render.
      // Yield between uploads, rather than moving that entire burst onto one frame.
      for(const texture of textures){
        if(disposed)return;
        gl.initTexture(texture);
        await yieldTask();
      }
      if(disposed)return;
      await gl.compileAsync(scene,camera);
      if(disposed)return;
      // Also prime geometry buffers and the shadow pass behind the loading view.
      // Use the normal R3F frame so the existing model/camera pose is retained.
      advance(performance.now()/1000,false);
      // Submission is not completion: wait without blocking the main thread for
      // uploads and the first draw to finish on the GPU before revealing Canvas.
      const context=gl.getContext();
      if(!('fenceSync' in context))throw new Error('WebGL 2 GPU preparation unavailable.');
      const fence=context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE,0);
      if(!fence)throw new Error('GPU preparation could not start.');
      context.flush();
      const deadline=performance.now()+15000;
      try{
        while(!disposed){
          const result=context.clientWaitSync(fence,0,0);
          if(result===context.ALREADY_SIGNALED||result===context.CONDITION_SATISFIED)break;
          if(result===context.WAIT_FAILED||performance.now()>deadline)throw new Error('GPU preparation did not complete.');
          await new Promise<void>(resolve=>setTimeout(resolve,16));
        }
      }finally{context.deleteSync(fence);}
      await yieldTask();
      if(disposed)return;
      gl.domElement.dataset.sceneReady='true';
      gl.domElement.dataset.prepareMs=(performance.now()-started).toFixed(1);
      onReady();
    };
    void prepare().catch(error=>{if(!disposed){recordSceneError(error);onError();}});
    return()=>{disposed=true;};
  },[gl,scene,camera,advance,onReady,onError]);
  return null;
}

/* eslint-enable react-hooks/immutability */
