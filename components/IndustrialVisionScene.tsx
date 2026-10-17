'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { actuatorPose, productPose, productShape, station, type Product, type VisionState } from '@/lib/vision-simulation';

type Vec3=[number,number,number];
type Props={simulation:RefObject<VisionState>;products:Product[];mobile:boolean;detail:boolean;onReady:(invalidate:()=>void)=>void};
function outline(w:number,d:number,r:number){
  const s=new THREE.Shape(),x=w/2,y=d/2;
  s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);
  s.lineTo(-x+r,y);s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);return s;
}
function Solid({at,size,material,round=.015,rotation=[0,0,0]}:{at:Vec3;size:Vec3;material:THREE.Material;round?:number;rotation?:Vec3}){
  const [w,h,d]=size;
  const geometry=useMemo(()=>{
    const edge=Math.min(round,h/5,d/5,w/5);
    const g=new THREE.ExtrudeGeometry(outline(w-edge*2,d-edge*2,Math.min(.035,d*.12,w*.12)),{depth:h-edge*2,steps:1,bevelEnabled:true,bevelSize:edge,bevelThickness:edge,bevelSegments:2,curveSegments:5});
    g.rotateX(-Math.PI/2);g.translate(0,-h/2+edge,0);return g;
  },[w,h,d,round]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} material={material} position={at} rotation={rotation} castShadow receiveShadow/>;
}
function Round({at,radius,height,material,rotation=[0,0,0],segments=24}:{at:Vec3;radius:number;height:number;material:THREE.Material;rotation?:Vec3;segments?:number}){
  return <mesh position={at} rotation={rotation} material={material} castShadow receiveShadow><cylinderGeometry args={[radius,radius,height,segments]}/></mesh>;
}
function Cable({points,material,radius=.022}:{points:Vec3[];material:THREE.Material;radius?:number}){
  const key=JSON.stringify(points);
  const geometry=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3((JSON.parse(key) as Vec3[]).map(p=>new THREE.Vector3(...p))),20,radius,6,false),[key,radius]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry} material={material} castShadow/>;
}
function ProductModel({product,simulation,materials,geometry}:{product:Product;simulation:RefObject<VisionState>;materials:ReturnType<typeof makeFinishes>;geometry:ReturnType<typeof makeProductGeometry>}){
  const group=useRef<THREE.Group>(null),identity=useRef<THREE.Sprite>(null);
  const identityMap=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
    const ink=canvas.getContext('2d')!;
    ink.fillStyle='#192527';ink.fillRect(0,0,256,64);
    ink.fillStyle='#b8a378';ink.fillRect(0,0,3,64);
    ink.fillStyle='#e2e6df';ink.font='500 32px monospace';ink.textAlign='center';ink.textBaseline='middle';ink.fillText(product.id,128,33);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  },[product.id]);
  useEffect(()=>()=>identityMap.dispose(),[identityMap]);
  useFrame(()=>{
    const current=simulation.current,pose=productPose(product,current.time);
    group.current?.position.set(pose.x,pose.y,pose.z);
    if(identity.current)identity.current.visible=current.inspection?.product.id===product.id;
  });
  const missing=product.defective&&product.scenario==='missing',misaligned=product.defective&&product.scenario==='alignment';
  return <group ref={group} position={[station.start,.694,0]}>
    <mesh geometry={missing?geometry.missing:geometry.plate} material={materials.product} castShadow receiveShadow/>
    <mesh geometry={geometry.boss} position={[misaligned?productShape.misalignment:0,0,0]} material={materials.product} castShadow receiveShadow/>
    <mesh position={[misaligned?productShape.misalignment:0,.157,0]} rotation={[-Math.PI/2,0,0]} material={materials.polished}><torusGeometry args={[.145,.002,4,40]}/></mesh>
    {product.defective&&product.scenario==='scratch'&&<mesh geometry={geometry.scratch} material={materials.scratch}/>}
    <sprite ref={identity} position={[0,.62,-.08]} scale={[.78,.195,1]} visible={false}>
      <spriteMaterial map={identityMap} toneMapped={false} depthWrite={false}/>
    </sprite>
  </group>;
}
function makeProductGeometry(){
  const plate=(missing:boolean)=>{
    const shape=outline(productShape.width-.008,productShape.depth-.008,.065);
    for(const x of [-1,1])for(const z of [-1,1]){
      if(missing&&x===1&&z===-1)continue;
      const hole=new THREE.Path();hole.absarc(x*productShape.holeX,-z*productShape.holeZ,productShape.holeRadius,0,Math.PI*2,true);shape.holes.push(hole);
    }
    const hole=new THREE.Path();hole.absarc(0,0,.078,0,Math.PI*2,true);shape.holes.push(hole);
    const g=new THREE.ExtrudeGeometry(shape,{depth:.056,steps:1,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,curveSegments:8});g.rotateX(-Math.PI/2);g.translate(0,.004,0);return g;
  };
  const boss=new THREE.LatheGeometry([[.08,.067],[.162,.067],[.174,.077],[.174,.147],[.166,.16],[.085,.16],[.08,.154],[.08,.067]].map(([x,y])=>new THREE.Vector2(x,y)),40);
  const scratch=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-.27,.065,-.137],[-.215,.065,-.152],[-.159,.065,-.104],[-.115,.065,-.081]].map(p=>new THREE.Vector3(...p))),12,.0025,4,false);
  return {plate:plate(false),missing:plate(true),boss,scratch};
}
function makeFinishes(){
  const surface=(brushed:boolean)=>{
    const size=128,data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const hash=Math.sin(x*12.9898+y*78.233)*43758.5453,grain=hash-Math.floor(hash),v=Math.round(brushed?235+Math.sin(y*1.7)*5+grain*8:219+grain*25),i=(y*size+x)*4;
      data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;
    }
    const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t;
  };
  const brushed=surface(true),grain=surface(false);
  const beltCanvas=document.createElement('canvas');beltCanvas.width=128;beltCanvas.height=64;const b=beltCanvas.getContext('2d')!;
  b.fillStyle='#252b2c';b.fillRect(0,0,128,64);b.fillStyle='#303638';b.fillRect(0,0,2,64);
  for(let i=0;i<1600;i++){b.fillStyle=i%2?'#ffffff08':'#00000012';b.fillRect(i*71%128,i*37%64,1,1);}
  const beltMap=new THREE.CanvasTexture(beltCanvas);beltMap.colorSpace=THREE.SRGBColorSpace;beltMap.wrapS=beltMap.wrapT=THREE.RepeatWrapping;beltMap.repeat.set(20,3);
  const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=256;const ink=labelCanvas.getContext('2d')!;
  ink.fillStyle='#1d2923';ink.fillRect(0,0,512,256);ink.fillStyle='#d0c7aa';ink.font='500 33px monospace';ink.fillText('C2C / CAM-01',20,55);ink.fillStyle='#a8b4a4';ink.font='17px monospace';ink.fillText('INDUSTRIAL VISION · CELL 01',20,95);
  ink.fillStyle='#d0c7aa';ink.font='500 33px monospace';ink.fillText('AYIR / REJECT',20,183);ink.fillStyle='#a8b4a4';ink.font='17px monospace';ink.fillText('KONTROL SONRASI AYIRMA',20,223);
  const labelMap=new THREE.CanvasTexture(labelCanvas);labelMap.colorSpace=THREE.SRGBColorSpace;labelMap.anisotropy=4;labelMap.repeat.set(1,.5);labelMap.offset.y=.5;
  const rejectMap=labelMap.clone();rejectMap.offset.y=0;rejectMap.needsUpdate=true;
  const metal=(color:string,roughness:number)=>new THREE.MeshStandardMaterial({color,metalness:.86,roughness,roughnessMap:brushed,bumpMap:brushed,bumpScale:.00025,envMapIntensity:1.05});
  return {
    metal:metal('#a3adb0',.34),polished:metal('#c2cacc',.24),product:metal('#b8c0c2',.3),
    frame:new THREE.MeshStandardMaterial({color:'#293735',metalness:.45,roughness:.4,roughnessMap:grain}),
    dark:new THREE.MeshStandardMaterial({color:'#171f21',metalness:.12,roughness:.7,roughnessMap:grain}),
    belt:new THREE.MeshStandardMaterial({color:'#aeb5b6',map:beltMap,roughness:.88,metalness:.02,bumpMap:grain,bumpScale:.001}),
    glass:new THREE.MeshPhysicalMaterial({color:'#101c24',metalness:.3,roughness:.08,clearcoat:1,clearcoatRoughness:.1}),
    floor:new THREE.MeshStandardMaterial({color:'#363d3e',roughness:.91,roughnessMap:grain,bumpMap:grain,bumpScale:.004}),
    safety:new THREE.MeshStandardMaterial({color:'#93876b',roughness:.8,metalness:.05}),
    light:new THREE.MeshStandardMaterial({color:'#f0eee0',roughness:.56,emissive:'#e3ddc7',emissiveIntensity:.17}),
    label:new THREE.MeshStandardMaterial({map:labelMap,roughness:.78,metalness:.15}),
    rejectLabel:new THREE.MeshStandardMaterial({map:rejectMap,roughness:.78,metalness:.15}),
    scratch:new THREE.MeshStandardMaterial({color:'#354047',roughness:.7,metalness:.35}),
    textures:[brushed,grain,beltMap,labelMap,rejectMap],
  };
}
function Studio({onReady}:{onReady:Props['onReady']}){
  const {gl,scene,camera,invalidate}=useThree();
  useLayoutEffect(()=>{
    const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(gl),target=generator.fromScene(room,.04);
    const previous=scene.environment,previousIntensity=scene.environmentIntensity;
    // Three.js scene ownership is imperative and local to this Canvas.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment=target.texture;
    scene.environmentIntensity=.85;
    camera.lookAt(0,.75,0);onReady(invalidate);invalidate();room.dispose();generator.dispose();
    return()=>{scene.environment=previous;scene.environmentIntensity=previousIntensity;target.dispose();onReady(()=>{});};
  },[gl,scene,camera,invalidate,onReady]);return null;
}
function CameraRig({mobile,detail}:{mobile:boolean;detail:boolean}){
  const {camera,size,invalidate}=useThree();
  useLayoutEffect(()=>{
    // Fit by aspect ratio; keep a lower product-photography angle and the optical head readable.
    const aspect=size.width/size.height;
    const fit=mobile?Math.max(1,1.55/aspect):Math.max(1,2.05/aspect);
    if(detail){camera.position.set(station.camera+2.05,3.3,3.8);camera.lookAt(station.camera,1.83,0);}
    else{camera.position.set(3.8*fit,.8+4.6*fit,10.3*fit);camera.lookAt(0,.85,.15);}
    invalidate();
  },[camera,size.width,size.height,mobile,detail,invalidate]);return null;
}
function Station({simulation,products,mobile,detail,onReady}:Props){
  const materials=useMemo(()=>makeFinishes(),[]),productGeometry=useMemo(()=>makeProductGeometry(),[]);
  const frames=useRef(0);
  const belt=useRef<THREE.Mesh>(null),rod=useRef<THREE.Group>(null),capture=useRef<THREE.Mesh>(null);
  useEffect(()=>()=>{Object.values(materials).forEach(m=>{if(m instanceof THREE.Material)m.dispose();});materials.textures.forEach(t=>t.dispose());Object.values(productGeometry).forEach(g=>g.dispose());},[materials,productGeometry]);
  useFrame(({gl,camera})=>{
    const current=simulation.current,actuator=actuatorPose(current);
    if(belt.current){const material=belt.current.material as THREE.MeshStandardMaterial;if(material.map)material.map.offset.x=-current.time*station.speed/10.6*20;}
    if(rod.current)rod.current.scale.z=.2+actuator.stroke*1.7;
    if(capture.current)capture.current.visible=Boolean(current.inspection&&current.time-current.inspection.capturedAt<.16);
    gl.domElement.dataset.visionFrame=String(++frames.current);gl.domElement.dataset.visionDrawCalls=String(gl.info.render.calls);gl.domElement.dataset.visionTriangles=String(gl.info.render.triangles);
    gl.domElement.dataset.visionTime=current.time.toFixed(4);gl.domElement.dataset.visionActuator=actuator.productId??'none';
    gl.domElement.dataset.visionStroke=actuator.stroke.toFixed(3);gl.domElement.dataset.visionProducts=JSON.stringify(current.products.map(p=>({id:p.id,...productPose(p,current.time)})));
    gl.domElement.dataset.visionView=detail?'detail':'station';
    gl.domElement.dataset.visionCaptureProduct=current.inspection?.product.id??'none';
    gl.domElement.dataset.visionCamera=camera.position.toArray().map(n=>n.toFixed(2)).join(',');
  });
  const m=materials;
  return <>
    <Studio onReady={onReady}/><CameraRig mobile={mobile} detail={detail}/><fog attach="fog" args={['#293333',23,48]}/>
    <ambientLight intensity={.16}/><hemisphereLight args={['#f0f3f4','#30383a',.6]}/>
    <directionalLight position={[-3,8,5]} intensity={2.2} color="#fff8ef" castShadow={!mobile} shadow-mapSize={[1024,1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-far={25} shadow-normalBias={.018} shadow-radius={3}/>
    <directionalLight position={[3,5,-4]} intensity={1.25} color="#e8eff4"/>
    <mesh position={[0,-1.22,0]} rotation={[-Math.PI/2,0,0]} receiveShadow material={m.floor}><planeGeometry args={[150,150]}/></mesh>
    {/* A restrained factory bay gives scale and material contrast, without obscuring the cell. */}
    <Solid at={[0,2.1,-5.4]} size={[24,6.6,.18]} material={m.frame} round={.01}/>
    <Solid at={[0,.18,-5.27]} size={[24,2.7,.08]} material={m.dark}/>
    {[-8,-3,3,8].map(x=><group key={x}>
      <Solid at={[x,2.2,-5.2]} size={[.28,6.8,.32]} material={m.metal}/>
      <Solid at={[x,4.6,-4.85]} size={[2.5,.055,.4]} material={m.light}/>
    </group>)}
    <Solid at={[0,4.9,-5.05]} size={[21,.08,.09]} material={m.metal}/>
    <Solid at={[0,4.72,-5.05]} size={[21,.04,.07]} material={m.dark}/>
    {[-7,-2,3,8].map(x=><Solid key={x} at={[x,-1.214,0]} size={[.012,.004,15]} material={m.dark} round={.001}/>)}
    {[-3.8,3.8].map(z=><Solid key={z} at={[0,-1.208,z]} size={[13,.006,.045]} material={m.safety} round={.001}/>)}
    <Solid at={[-7.8,.1,-3]} size={[2.4,2.6,1.35]} material={m.frame} round={.09}/>
    <Solid at={[-7.8,.35,-2.31]} size={[1.95,1.45,.025]} material={m.metal}/>
    <Solid at={[-7.8,.35,-2.29]} size={[1.55,1,.026]} material={m.glass}/>
    <Solid at={[7.4,-.28,-3.8]} size={[2.3,1.8,1.1]} material={m.frame} round={.04}/>
    {[-.55,.55].map(offset=><group key={offset}><Solid at={[7.4+offset,-.28,-3.24]} size={[1.03,1.65,.035]} material={m.metal}/><Solid at={[7.4+offset-.33,-.15,-3.21]} size={[.035,.3,.04]} material={m.dark}/></group>)}
    <Solid at={[7.4,.64,-3.8]} size={[2.45,.06,1.2]} material={m.metal}/>
    {/* Infeed and outfeed transfer hoods hide the actual birth/retirement thresholds. */}
    {[-4.9,5.1].map(x=><group key={x}>
      <Solid at={[x,1.08,0]} size={[1.04,.08,1.95]} material={m.metal} round={.025}/>
      {[-1,1].map(side=><Solid key={side} at={[x,.82,side*.94]} size={[1.04,.48,.045]} material={m.frame}/>)}
      <Solid at={[x,1.125,0]} size={[.62,.008,.045]} material={m.safety} round={.001}/>
    </group>)}
    {/* Extrusion frame, guarded rollers and a textured continuous belt. */}
    <Solid at={[0,.38,0]} size={[10.65,.22,2.36]} material={m.frame}/>
    <mesh ref={belt} position={[0,.63,0]} material={m.belt} receiveShadow><boxGeometry args={[10.6,.12,2.02]}/></mesh>
    {[-1,1].map(side=><group key={side}>
      <Solid at={[0,.64,side*1.14]} size={[10.8,.22,.14]} material={m.metal}/>
      <Solid at={[0,.67,side*1.217]} size={[10.6,.025,.008]} material={m.dark} round={.001}/>
      <Solid at={[0,.57,side*1.217]} size={[10.6,.019,.008]} material={m.dark} round={.001}/>
      <Solid at={[-1.6,.81,side*1.04]} size={[6.7,.045,.05]} material={m.polished}/>
      <Solid at={[4.25,.81,side*1.04]} size={[2.15,.045,.05]} material={m.polished}/>
      {[-4,-1,1.4,4.8].map(x=><group key={x}><Solid at={[x,.74,side*1.1]} size={[.075,.22,.13]} material={m.metal}/><Round at={[x,.866,side*1.1]} radius={.025} height={.012} material={m.dark} segments={10}/></group>)}
      {[-3.9,3.9].map(x=><group key={x}>
        <Solid at={[x,-.36,side*.96]} size={[.12,1.25,.12]} material={m.metal}/>
        <Solid at={[x-.063,-.35,side*.96]} size={[.008,1.15,.025]} material={m.dark} round={.001}/>
        <Round at={[x,-1.04,side*.96]} radius={.038} height={.15} material={m.polished}/>
        <Round at={[x,-1.15,side*.96]} radius={.13} height={.065} material={m.dark}/>
        <Solid at={[x,.24,side*.96]} size={[.3,.045,.3]} material={m.metal}/>
      </group>)}
      <Solid at={[0,-.62,side*.96]} size={[7.9,.1,.1]} material={m.metal}/>
    </group>)}
    {[-5.1,5.1].map(x=><group key={x}><Round at={[x,.58,0]} radius={.116} height={2.13} material={m.polished} rotation={[Math.PI/2,0,0]}/><Round at={[x,.58,1.21]} radius={.15} height={.05} material={m.dark} rotation={[Math.PI/2,0,0]}/></group>)}
    <Round at={[-4.7,.22,-1.5]} radius={.22} height={.65} material={m.frame} rotation={[Math.PI/2,0,0]}/>
    {[-2,-1,0,1,2].map(i=><Round key={i} at={[-4.7,.22,-1.5+i*.095]} radius={.242} height={.023} material={m.metal} rotation={[Math.PI/2,0,0]}/>)}
    <Solid at={[-4.7,.24,-1.13]} size={[.5,.5,.32]} material={m.metal}/>
    {/* Camera gantry. Optical axis and part trigger share the same x station. */}
    {[-1.4,1.4].map(z=><group key={z}><Solid at={[station.camera,1.9,z]} size={[.12,2.6,.12]} material={m.metal}/><Solid at={[station.camera,1.9,z+.065]} size={[.025,2.45,.008]} material={m.dark} round={.001}/><Solid at={[station.camera,.72,z]} size={[.36,.07,.36]} material={m.metal}/></group>)}
    <Solid at={[station.camera,3.2,0]} size={[.16,.14,2.98]} material={m.metal}/>
    {/* Rigid mounting plate, aluminium sensor housing and downward C-mount optics. */}
    <Solid at={[station.camera,3.005,0]} size={[.12,.28,.12]} material={m.dark} round={.008}/>
    <Solid at={[station.camera,2.91,0]} size={[.48,.055,.36]} material={m.metal} round={.008}/>
    {[-.18,.18].map(x=><Round key={x} at={[station.camera+x,2.945,.1]} radius={.022} height={.025} material={m.dark} segments={6}/>)}
    <Solid at={[station.camera,2.635,0]} size={[.43,.5,.39]} material={m.metal} round={.012}/>
    <Solid at={[station.camera,2.635,-.2]} size={[.425,.46,.035]} material={m.dark} round={.008}/>
    {[-.15,-.09,-.03,.03,.09,.15].map(x=><Solid key={x} at={[station.camera+x,2.64,-.229]} size={[.018,.39,.025]} material={m.metal} round={.002}/>)}
    <mesh position={[station.camera,2.69,.207]} material={m.label}><planeGeometry args={[.32,.08]}/></mesh>
    {[-1,1].flatMap(x=>[-1,1].map(y=><Round key={`${x}${y}`} at={[station.camera+x*.166,2.635+y*.194,.205]} radius={.012} height={.013} material={m.dark} rotation={[Math.PI/2,0,0]} segments={6}/>))}
    <Round at={[station.camera,2.363,0]} radius={.14} height={.045} material={m.polished}/>
    <Round at={[station.camera,2.24,0]} radius={.126} height={.21} material={m.dark}/>
    {[2.17,2.27,2.315].map(y=><Round key={y} at={[station.camera,y,0]} radius={.135} height={.025} material={m.metal}/>)}
    {Array.from({length:12},(_,i)=>i*Math.PI/6).map(angle=><Round key={angle} at={[station.camera+Math.cos(angle)*.129,2.235,Math.sin(angle)*.129]} radius={.005} height={.065} material={m.dark} segments={5}/>)}
    <Round at={[station.camera,2.126,0]} radius={.12} height={.028} material={m.dark}/>
    <Round at={[station.camera,2.109,0]} radius={.087} height={.009} material={m.glass}/>
    {/* Annular light stays open at the centre: the lens has a clear view of the part. */}
    {[-.3,.3].map(z=><Solid key={z} at={[station.camera,2.26,z]} size={[.045,.34,.045]} material={m.metal} round={.004}/>)}
    <mesh position={[station.camera,2.095,0]} material={m.dark}><cylinderGeometry args={[.36,.36,.07,40,1,true]}/></mesh>
    <mesh position={[station.camera,2.095,0]} material={m.dark}><cylinderGeometry args={[.195,.195,.07,40,1,true]} /></mesh>
    <mesh position={[station.camera,2.132,0]} rotation={[-Math.PI/2,0,0]} material={m.metal}><ringGeometry args={[.195,.36,40]}/></mesh>
    <mesh position={[station.camera,2.058,0]} rotation={[Math.PI/2,0,0]} material={m.light}><ringGeometry args={[.205,.346,40]}/></mesh>
    <Round at={[station.camera,2.88,-.23]} radius={.035} height={.09} material={m.polished} rotation={[Math.PI/2,0,0]}/>
    <Cable points={[[station.camera,2.88,-.27],[station.camera,3.07,-.44],[station.camera,3.12,-1.35],[station.camera,1,-1.5],[-2.7,.4,-1.5]]} material={m.dark} radius={.017}/>
    <Solid at={[station.camera-.23,.85,1.12]} size={[.12,.15,.1]} material={m.dark}/>
    <Round at={[station.camera-.23,.85,1.061]} radius={.025} height={.012} material={m.polished} rotation={[Math.PI/2,0,0]}/>
    <mesh ref={capture} position={[station.camera,.697,0]} rotation={[-Math.PI/2,0,0]} visible={false}><ringGeometry args={[.49,.495,40]}/><meshBasicMaterial color="#d2c298" transparent opacity={.25} depthWrite={false}/></mesh>
    {/* Guided pneumatic pusher; only the matched defective part can command a stroke. */}
    <Solid at={[station.reject,.73,-2.07]} size={[.42,.34,1.45]} material={m.metal}/>
    <Solid at={[station.reject,.735,-2.83]} size={[.5,.42,.1]} material={m.frame}/>
    <Solid at={[station.reject,.735,-1.32]} size={[.5,.42,.1]} material={m.frame}/>
    {[-.15,.15].map(x=><Round key={x} at={[station.reject+x,.78,-2.06]} radius={.023} height={1.38} material={m.polished} rotation={[Math.PI/2,0,0]}/>)}
    <group position={[station.reject,.77,-1.3]} ref={rod} scale={[1,1,.2]}><Round at={[0,0,.5]} radius={.033} height={1} material={m.polished} rotation={[Math.PI/2,0,0]}/><Solid at={[0,0,1]} size={[.62,.19,.035]} material={m.dark}/></group>
    <Solid at={[station.reject,.43,-2]} size={[.7,.12,2.2]} material={m.metal}/>
    <Cable points={[[station.reject,.9,-2.55],[station.reject+.3,.7,-2.9],[station.reject+.5,.4,-2.8],[1,.2,-1.5]]} material={m.dark} radius={.017}/>
    <Solid at={[station.reject,.85,-1.12]} size={[.1,.13,.08]} material={m.dark}/>
    {/* A lowered stainless reject chute leaves the main belt completely open. */}
    <Solid at={[station.reject+.08,.4,1.82]} size={[1.25,.055,1.55]} material={m.metal} rotation={[-.17,0,0]}/>
    {[-.61,.61].map(x=><Solid key={x} at={[station.reject+.08+x,.54,1.82]} size={[.035,.23,1.55]} material={m.metal} rotation={[-.17,0,0]}/>)}
    <Solid at={[station.reject+.08,-.37,2.31]} size={[1.4,.07,.96]} material={m.dark}/>
    {[-1,1].map(side=><group key={side}>
      <Solid at={[station.reject+.08+side*.67,.08,2.31]} size={[.06,.88,.96]} material={m.frame}/>
      <Solid at={[station.reject+.08,.08,2.31+side*.45]} size={[1.4,.88,.06]} material={m.frame}/>
      <Solid at={[station.reject+.08,.54,2.31+side*.46]} size={[1.44,.04,.08]} material={m.metal}/>
    </group>)}
    <mesh position={[station.reject+.08,-.2,2.77]} material={m.rejectLabel}><planeGeometry args={[.87,.21]}/></mesh>
    {products.map(product=><ProductModel key={product.id} product={product} simulation={simulation} materials={m} geometry={productGeometry}/>)}
  </>;
}
export default function IndustrialVisionScene(props:Props){
  return <Canvas className="vision-canvas" frameloop="demand" dpr={[1,props.mobile?1.25:1.5]} shadows={props.mobile?false:'percentage'}
    camera={{position:[5.2,6.5,11.8],fov:props.mobile?39:34,near:.1,far:100}}
    gl={{antialias:true,alpha:true,powerPreference:props.mobile?'low-power':'high-performance'}}><Station {...props}/></Canvas>;
}
