'use client';
import {use,useEffect} from 'react';
import * as THREE from 'three';
import {GLTFLoader,type GLTF} from 'three/addons/loaders/GLTFLoader.js';

type Asset={gltf:GLTF;textures:THREE.Texture[];owners:number};
const cache=new Map<boolean,Promise<Asset>>();
function load(mobile:boolean){
  let asset=cache.get(mobile);
  if(!asset){
    const name=mobile?'mobile':'desktop';
    asset=Promise.all([
      fetch(`/models/motherboard/${name}.glb.gz`).then(r=>{if(!r.ok||!r.body)throw new Error('Motherboard model unavailable');return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}).then(bytes=>new GLTFLoader().parseAsync(bytes,'')),
      new THREE.TextureLoader().loadAsync(`/models/motherboard/${name}.webp`),
      new THREE.TextureLoader().loadAsync('/models/processor/board-surface.png'),
      new THREE.TextureLoader().loadAsync('/models/processor/board-normal.png'),
    ]).then(([gltf,texture,surface,normal])=>{
      texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
      for(const map of [surface,normal]){map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;}
      gltf.scene.traverse(node=>{
        if(node instanceof THREE.Mesh){
          node.castShadow=true;node.receiveShadow=true;
          const material=node.material as THREE.MeshStandardMaterial;
          material.roughnessMap=surface;material.normalMap=normal;material.normalScale.set(.1,.1);
          material.envMapIntensity=material.name==='steel'?.65:.28;
          if(material.name==='steel'){material.color.set('#a6ada2');material.metalness=.95;material.roughness=.4;}
          if(material.name==='PCB_ATLAS'){material.map=texture;material.color.set('#8b9986');material.metalness=.12;material.roughness=.95;}
          if(material.name==='polymer'||material.name==='ferrite'||material.name==='ceramic')material.roughness=.95;
          material.needsUpdate=true;
        }
      });
      return {gltf,textures:[texture,surface,normal],owners:0};
    });
    cache.set(mobile,asset);
  }
  return asset;
}
export default function MotherboardModel({mobile}:{mobile:boolean}){
  const asset=use(load(mobile));
  useEffect(()=>{
    // Imperative Three.js GPU ownership, intentionally outside React state.
    // eslint-disable-next-line react-hooks/immutability
    asset.owners++;asset.textures.forEach(texture=>{texture.needsUpdate=true;});
    return()=>{if(--asset.owners===0){asset.textures.forEach(texture=>texture.dispose());asset.gltf.scene.traverse(node=>{if(node instanceof THREE.Mesh){node.geometry.dispose();const material=node.material as THREE.Material;material.dispose();}});}};
  },[asset]);
  return <primitive object={asset.gltf.scene}/>;
}
