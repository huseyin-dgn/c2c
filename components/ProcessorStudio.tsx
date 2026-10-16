'use client';
import {use,useEffect,type ReactNode} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import manifest from '@/public/models/processor/studio-env.json';
let owners=0;
const environment=fetch('/models/processor/studio-env.bin.gz').then(async response=>{
  if(!response.ok||!response.body)throw new Error('Hero studio environment unavailable');
  const bytes=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  if(bytes.byteLength!==manifest.bytes)throw new Error('Hero studio environment incomplete');
  const texture=new THREE.DataTexture(new Uint16Array(bytes),manifest.width,manifest.height,THREE.RGBAFormat,THREE.HalfFloatType);
  texture.mapping=THREE.CubeUVReflectionMapping;texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
  return texture;
});
export function ProcessorStudioReady({children}:{children:ReactNode}){use(environment);return children;}
export default function ProcessorStudio(){
  const texture=use(environment),{scene,invalidate}=useThree();
  useEffect(()=>{
    owners++;
    // Three.js resource ownership; re-upload the cached CPU data after remount.
    // eslint-disable-next-line react-hooks/immutability
    texture.needsUpdate=true;
    const previous=scene.environment;
    // eslint-disable-next-line react-hooks/immutability
    scene.environment=texture;invalidate();
    return()=>{scene.environment=previous;if(--owners===0)texture.dispose();};
  },[scene,texture,invalidate]);
  return null;
}
