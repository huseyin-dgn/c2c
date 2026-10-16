// Original, dimensioned CPU-region assembly. No downloaded mesh or texture.
import * as T from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';

// GLTFExporter's binary-only path needs this browser Blob adapter in Node.
globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}
};
const dir='public/models/motherboard';await fs.mkdir(dir,{recursive:true});
const width=8.8,depth=8.2;
function rounded(w,h,r,Path=T.Shape){
  const s=new Path(),x=w/2-r,y=h/2-r;
  s.absarc(x,y,r,0,Math.PI/2);s.absarc(-x,y,r,Math.PI/2,Math.PI);s.absarc(-x,-y,r,Math.PI,Math.PI*1.5);s.absarc(x,-y,r,Math.PI*1.5,Math.PI*2);s.closePath();return s;
}
function solid(w,d,h,x,y,z,r=.035,hole=0){
  const shape=rounded(w,d,r);if(hole)shape.holes.push(rounded(hole,hole,.07,T.Path));
  const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSegments:1,bevelSize:.008,bevelThickness:.008,steps:1,curveSegments:3});
  geo.rotateX(-Math.PI/2);geo.translate(x,y,z);geo.clearGroups();return new T.BufferGeometry().copy(geo);
}
const materials={pcb:['#192923',.28,.55],polymer:['#171b18',.13,.55],steel:['#a5aca1',.85,.3],solder:['#aaa99a',.72,.4],ferrite:['#353b34',.38,.52],ceramic:['#72725f',.25,.62],copper:['#ad9464',.82,.38]};
const manifest=[];
for(const mobile of [false,true]){
  const bins=Object.fromEntries(Object.keys(materials).map(k=>[k,[]]));
  const add=(key,g)=>bins[key].push((g.index?g.toNonIndexed():g).deleteAttribute('uv'));
  const box=(key,w,d,h,x,y,z,r=.025)=>{if(mobile&&w<.8&&d<.8){const g=new T.BoxGeometry(w,h,d);g.translate(x,y+h/2,z);add(key,g);}else add(key,solid(w,d,h,x,y,z,r));};
  const cylinder=(key,r,h,x,y,z,segments=mobile?10:16)=>{const g=new T.CylinderGeometry(r,r,h,segments);g.translate(x,y+h/2,z);add(key,g);};
  const smd=(x,z,axis=0)=>{
    const g=mobile?new T.BoxGeometry(.12,.045,.055).translate(0,.0225,0):solid(.12,.055,.045,0,0,0,.008);g.rotateY(axis);g.translate(x,-.472,z);add('ceramic',g);
    for(const sign of [-1,1]){const g=new T.BoxGeometry(.024,.048,.057);g.translate(sign*.052,.02,0);g.rotateY(axis);g.translate(x,-.47,z);add('solder',g);}
  };
  const capacitor=(x,z)=>{
    cylinder('polymer',.145,.035,x,-.49,z);cylinder('steel',.128,.37,x,-.46,z);cylinder('solder',.116,.012,x,-.08,z);
    box('polymer',.13,.009,.003,x,-.065,z,.002);box('polymer',.009,.13,.003,x,-.065,z,.002);
  };
  // Layered FR-4 board with genuine mounting holes, not a solid green slab.
  const shape=rounded(width,depth,.14);
  for(const x of [-4.04,4.04])for(const z of [-3.73,3.73]){const path=new T.Path();path.absarc(x,z,.105,0,Math.PI*2,true);shape.holes.push(path);}
  const pcb=new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSize:.015,bevelThickness:.008,bevelSegments:1,curveSegments:8});
  pcb.rotateX(-Math.PI/2);pcb.translate(0,-.65,0);pcb.clearGroups();
  const uv=pcb.getAttribute('uv'),position=pcb.getAttribute('position');
  for(let i=0;i<position.count;i++)uv.setXY(i,(position.getX(i)+width/2)/width,1-(position.getZ(i)+depth/2)/depth);
  const scene=new T.Scene(),pcbMaterial=new T.MeshStandardMaterial({name:'PCB_ATLAS',color:'#ffffff',metalness:.25,roughness:.55});
  scene.add(new T.Mesh(pcb,pcbMaterial));
  box('polymer',width-.04,depth-.04,.035,0,-.59,0,.13);
  // Socket insulator, landing bed, chamfered load plate, four fasteners and latch.
  add('polymer',solid(4.63,4.63,.34,0,-.48,0,.12,3.76));
  box('polymer',3.95,3.95,.04,0,-.17,0,.06);
  add('steel',solid(4.68,4.68,.045,0,.005,0,.11,3.68));
  for(const x of [-2.18,2.18])for(const z of [-2.18,2.18]){
    cylinder('steel',.085,.07,x,.055,z,12);box('polymer',.07,.014,.004,x,.129,z,.002);
  }
  const latchPath=new T.CatmullRomCurve3([new T.Vector3(2.45,-.23,-2.22),new T.Vector3(2.53,-.05,-2),new T.Vector3(2.53,.02,1.84),new T.Vector3(2.43,.03,2.26),new T.Vector3(2.01,.035,2.42)]);
  add('steel',new T.TubeGeometry(latchPath,mobile?14:28,.037,6,false));
  box('steel',.16,.24,.11,2.45,-.27,-1.9);box('steel',.16,.24,.11,2.45,-.27,1.9);
  // Six repeated, connected VRM phases: shielded inductor, MOSFET + solder pads,
  // output capacitor. Positions follow a power-delivery bank, never random scatter.
  for(let i=0;i<6;i++){
    const z=-2.65+i*.98;
    box('ferrite',.51,.63,.43,-3.03,-.49,z,.055);
    box('steel',.39,.5,.012,-3.03,-.049,z,.045);
    box('polymer',.37,.49,.1,-3.82,-.49,z,.025);
    for(const sign of [-1,1])box('solder',.07,.4,.022,-3.82+sign*.21,-.49,z,.008);
    capacitor(-2.52,z+.2);
    if(!mobile){smd(-3.48,z+.3);smd(-3.48,z-.27);}
  }
  // Low-profile memory connector crop, keyed slot, fine contacts and end latches.
  for(const x of [3.12,3.63]){
    box('polymer',.29,5.4,.29,x,-.49,.1,.04);
    box('polymer',.075,5.1,.07,x,-.20,.1,.01);
    for(let j=0;j<(mobile?26:54);j++)for(const side of [-1,1])box('copper',.026,.045,.009,x+side*.094,-.18,-2.4+j*(mobile?.195:.094),.002);
    for(const z of [-2.7,2.9])box('steel',.38,.18,.15,x,-.22,z,.025);
  }
  // Clock/reference and controller packages, with intentional peripheral placement.
  box('polymer',.74,.74,.1,1.44,-.49,3.2,.03);
  for(let i=0;i<12;i++)for(const side of [-1,1])box('solder',.045,.10,.015,1.12+i*.058,-.49,3.2+side*.41,.004);
  box('steel',.36,.18,.08,.59,-.49,3.28,.07);
  for(let i=0;i<(mobile?9:18);i++)smd(-1.75+i*(mobile?.19:.095),2.72);
  // Matched decoupling arrays outside the retention keepout and near each rail.
  for(const side of [-1,1])for(let i=0;i<(mobile?14:28);i++){
    const x=-1.85+(i%(mobile?7:14))*(mobile?.55:.275),z=side*(2.74+Math.floor(i/(mobile?7:14))*.23);
    smd(x,z,Math.PI/2);
  }
  for(const x of [-4.04,4.04])for(const z of [-3.73,3.73]){
    const ring=new T.RingGeometry(.108,.20,mobile?12:24);ring.rotateX(-Math.PI/2);ring.translate(x,-.506,z);add('solder',ring);
  }
  let triangles=position.count/3;
  for(const [name,list] of Object.entries(bins)){
    if(!list.length)continue;
    const g=mergeVertices(mergeGeometries(list),.0001);triangles+=(g.index?.count||g.getAttribute('position').count)/3;
    const [color,metalness,roughness]=materials[name];
    const mesh=new T.Mesh(g,new T.MeshStandardMaterial({name,color,metalness,roughness}));mesh.name=name;scene.add(mesh);
  }
  scene.userData={author:'C2C project original procedural asset',license:'Project-owned original asset; no external model',purpose:'Representative CPU region, not a specific commercial motherboard'};
  const binary=await new GLTFExporter().parseAsync(scene,{binary:true,onlyVisible:true});
  const name=mobile?'mobile':'desktop';await fs.writeFile(`${dir}/${name}.glb.gz`,gzipSync(Buffer.from(binary),{level:9}));
  manifest.push({name,triangles,drawCalls:scene.children.length,uncompressedBytes:binary.byteLength,compressedBytes:gzipSync(Buffer.from(binary),{level:9}).length});
}
// Screen-printed routing atlas. Vias, differential routes, board laminate grain,
// silkscreen keepouts and contact shadows are baked, not individually drawn.
const S=1536,px=x=>(x+width/2)/width*S,py=z=>(z+depth/2)/depth*S;
let routes=`<rect width="${S}" height="${S}" fill="#18261f"/>`;
for(let i=0;i<74;i++){
  const x=-2.13+i*.056,z=2.42+(i%7)*.038;
  routes+=`<path d="M${px(x)} ${py(1.98)}V${py(z)}l${i%2?12:-12} 12V${py(3.55)}" stroke="#52604c" stroke-width="1.3" fill="none"/>`;
  routes+=`<circle cx="${px(x)}" cy="${py(3.55)}" r="2.2" fill="#78826a"/>`;
}
for(let i=0;i<68;i++){
  const z=-2.05+i*.061;
  routes+=`<path d="M${px(1.98)} ${py(z)}H${px(2.46+(i%4)*.06)}l22 22H${px(3.06)}" stroke="#63705a" stroke-width="1.15" fill="none"/>`;
}
for(let i=0;i<6;i++){
  const z=-2.65+i*.98;
  routes+=`<path d="M${px(-3.05)} ${py(z)}H${px(-2.4)}l20 20H${px(-1.96)}" stroke="#667358" stroke-width="7" fill="none" opacity=".55"/>`;
  routes+=`<rect x="${px(-3.4)}" y="${py(z-.38)}" width="${S*.085}" height="${S*.103}" rx="12" fill="#040d09" opacity=".45"/>`;
}
for(const z of [-2.75,2.75])routes+=`<rect x="${px(-2.05)}" y="${py(z-.12)}" width="${px(2.05)-px(-2.05)}" height="${S*.065}" fill="#06110b" opacity=".35"/>`;
routes+=`<rect x="${px(-2.41)}" y="${py(-2.41)}" width="${px(2.41)-px(-2.41)}" height="${py(2.41)-py(-2.41)}" rx="18" fill="#07130c" opacity=".48"/>`;
routes+=`<g fill="none" stroke="#b1b6a0" stroke-opacity=".28" stroke-width="1.5"><rect x="${px(-2.4)}" y="${py(-2.4)}" width="${px(2.4)-px(-2.4)}" height="${py(2.4)-py(-2.4)}" rx="22"/></g>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${routes}</svg>`;
for(const [name,size] of [['desktop',1536],['mobile',768]])await sharp(Buffer.from(svg)).resize(size).webp({quality:86}).toFile(`${dir}/${name}.webp`);
await fs.writeFile(`${dir}/manifest.json`,JSON.stringify(manifest,null,2));
await fs.writeFile(`${dir}/LICENSE.md`,'# Asset provenance\n\nOriginal motherboard CPU-region meshes and routing atlases authored for this repository by scripts/bake-motherboard.mjs. No external image or mesh is embedded. Geometry authoring/export: Three.js (MIT, existing dependency); raster conversion: Sharp (Apache-2.0, existing dependency).\n\nThe layout represents socket retention, VRM phases, decoupling banks, memory connector crops and PCB routing. It is not an electrically verified board, specific commercial product, or claim that C2C manufactures hardware.\n\nA Sketchfab candidate (Mother Board 3d Model, ARComputerFundamentals, 99a5f94e130a41c48590d59877f08663) was screened from its public listing. Its asset endpoint could not be inspected (403); no model was downloaded or reused. No third-party attribution claim is made for the original meshes here.\n');
console.log(manifest);
