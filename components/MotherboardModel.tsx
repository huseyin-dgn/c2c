'use client';
import {use,useEffect,useMemo,type ReactNode} from 'react';
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
/** Start the critical board request alongside the processor textures. */
export function preloadMotherboard(mobile:boolean){void load(mobile).catch(()=>{});}
export function MotherboardReady({mobile,children}:{mobile:boolean;children:ReactNode}){use(load(mobile));return children;}

export default function MotherboardModel({mobile,product=false}:{mobile:boolean;product?:boolean}){
  const asset=use(load(mobile));
  // Clone only the scene/materials for hardware: the Hero keeps its original finish.
  const presentation=useMemo(()=>{
    if(!product)return {scene:asset.gltf.scene,materials:[] as THREE.MeshStandardMaterial[],textures:[] as THREE.Texture[]};
    const scene=asset.gltf.scene.clone(true);
    const materials:THREE.MeshStandardMaterial[]=[];
    const textures:THREE.Texture[]=[];
    // Composite silkscreen on a private texture; the Hero atlas remains untouched.
    const canvas=document.createElement('canvas'),size=mobile?768:1024;
    canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d')!;
    ctx.drawImage(asset.textures[0].image,0,0,size,size);
    const px=(x:number)=>(x+4.4)/8.8*size,pz=(z:number)=>(z+4.1)/8.2*size;
    ctx.fillStyle='#bdc2a9b0';ctx.font=`${size*.012}px monospace`;
    for(const [label,x,z] of [['DIMM_A1',2.9,-3.05],['DIMM_B1',3.45,-3.05],['LGA / CPU',-.9,-2.52],['C2C / REV 02',-1.9,3.75],['PCIe',-1.65,3.4],['M.2 / 2280',.35,-3.95]] as const){
      ctx.fillText(label,px(x),pz(z));
    }
    ctx.strokeStyle='#a7b29960';ctx.lineWidth=.65;
    for(let i=0;i<22;i++){
      const x=2.65+(i%2)*.14,z=-2.55+Math.floor(i/2)*.47;
      ctx.beginPath();ctx.arc(px(x),pz(z),size*.0018,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle='#0d2018';ctx.beginPath();ctx.arc(px(x),pz(z),size*.0007,0,Math.PI*2);ctx.fill();
    }
    // Short front-side breakout traces remain visible in front of the PCIe connector.
    const wx=(x:number)=>px(x/.56),wz=(z:number)=>pz(z/.49);
    ctx.strokeStyle='#68785b';ctx.lineWidth=size*.0008;
    for(let i=0;i<3;i++){
      const x=-.9+i*.38;
      ctx.beginPath();ctx.moveTo(wx(x),wz(1.94));ctx.lineTo(wx(x),wz(1.87));
      ctx.lineTo(wx(x+.064),wz(1.81));ctx.lineTo(wx(x+.064),wz(1.74));ctx.stroke();
      ctx.beginPath();ctx.arc(wx(x),wz(1.94),size*.0018,0,Math.PI*2);ctx.stroke();
    }
    const boardMap=new THREE.CanvasTexture(canvas);boardMap.colorSpace=THREE.SRGBColorSpace;boardMap.anisotropy=4;textures.push(boardMap);
    const finishes:Record<string,[string,number,number,number,number]>={
      PCB_ATLAS:['#a2afa5',.08,.87,.045,.38],
      steel:['#b9bfc1',.94,.36,.018,.72],
      solder:['#a5aaa9',.82,.48,.012,.52],
      polymer:['#202621',.02,.69,.035,.22],
      ferrite:['#454842',.12,.82,.055,.28],
      ceramic:['#797365',.04,.86,.025,.28],
      copper:['#a68d60',.78,.46,.015,.52],
    };
    scene.traverse(node=>{
      if(!(node instanceof THREE.Mesh))return;
      const material=(node.material as THREE.MeshStandardMaterial).clone();
      const finish=finishes[material.name];
      if(finish){
        const [color,metalness,roughness,relief,reflection]=finish;
        material.color.set(color);material.metalness=metalness;material.roughness=roughness;
        material.normalScale.set(relief,relief);material.envMapIntensity=reflection;
      }
      if(material.name==='PCB_ATLAS'){material.map=boardMap;material.roughness=.81;}
      node.material=material;materials.push(material);
    });
    return {scene,materials,textures};
  },[asset,product,mobile]);
  useEffect(()=>()=>{presentation.materials.forEach(material=>material.dispose());presentation.textures.forEach(texture=>texture.dispose());},[presentation]);
  useEffect(()=>{
    // Imperative Three.js GPU ownership, intentionally outside React state.
    // eslint-disable-next-line react-hooks/immutability
    asset.owners++;asset.textures.forEach(texture=>{texture.needsUpdate=true;});
    return()=>{if(--asset.owners===0){asset.textures.forEach(texture=>texture.dispose());asset.gltf.scene.traverse(node=>{if(node instanceof THREE.Mesh){node.geometry.dispose();const material=node.material as THREE.Material;material.dispose();}});}};
  },[asset]);
  return <primitive object={presentation.scene}/>;
}
