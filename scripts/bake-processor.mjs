// Original C2C visualization asset. No third-party mesh or image input.
import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const out='public/models/processor';await fs.mkdir(out,{recursive:true});
function outline(w,h,r,Path=T.Shape){
  const s=new Path(),x=w/2-r,y=h/2-r;
  s.absarc(x,y,r,0,Math.PI/2);s.absarc(-x,y,r,Math.PI/2,Math.PI);
  s.absarc(-x,-y,r,Math.PI,Math.PI*1.5);s.absarc(x,-y,r,Math.PI*1.5,Math.PI*2);s.closePath();return s;
}
function body(w,h,d,y,r=.08,hole=0){
  const shape=outline(w,h,r);if(hole)shape.holes.push(outline(hole,hole,.08,T.Path));
  const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelThickness:Math.min(d*.2,.012),bevelSize:Math.min(d*.4,.018),bevelSegments:2,steps:1,curveSegments:4});
  g.rotateX(-Math.PI/2);g.translate(0,y,0);g.clearGroups();
  // Serialize attributes, not ExtrudeGeometry's construction parameters.
  return new T.BufferGeometry().copy(g);
}
const lid=mergeGeometries([body(3.56,3.56,.135,.13,.16),body(3.56,3.56,.095,.025,.16,3.07),body(1.84,1.48,.012,.1124,.04)]);
// The laser marking belongs to the nickel surface, not a floating decal.
const position=lid.getAttribute('position'),normal=lid.getAttribute('normal'),uv=lid.getAttribute('uv');
for(let i=0;i<position.count;i++){
  if(position.getY(i)>.25&&normal.getY(i)>.5)uv.setXY(i,(position.getX(i)+1.78)/3.56,1-(position.getZ(i)+1.78)/3.56);
  else uv.setXY(i,.02+position.getX(i)*.001,.02+position.getZ(i)*.001);
}
const geometries={lid,substrate:body(4.06,4.06,.032,-.016,.085),die:body(1.78,1.42,.052,.038,.025),thermal:body(1.74,1.38,.005,.1038,.025),routing:body(3.99,3.99,.005,-.034,.075)};
const json=JSON.stringify(Object.fromEntries(Object.entries(geometries).map(([k,g])=>[k,g.toJSON()])),(_key,value)=>typeof value==='number'?Math.round(value*100000)/100000:value);
await fs.writeFile(`${out}/geometry.json.gz`,gzipSync(json,{level:9}));
const png=async(name,svg)=>sharp(Buffer.from(svg)).resize(name==='mark'||name==='shadow'?512:1024).png().toFile(`${out}/${name}.png`);
const svg=content=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${content}</svg>`;
await png('mark',svg('<text x="512" y="548" text-anchor="middle" font-family="Arial,sans-serif" font-size="132" font-weight="600" letter-spacing="12" fill="#343b37">C2C</text>'));
let circuits='<rect width="1024" height="1024" fill="#56604d"/>';
for(let side=0;side<4;side++)for(let i=0;i<28;i++){
  const x=105+i*30;circuits+=`<g transform="rotate(${side*90} 512 512)" fill="none" stroke="#c3ad78" stroke-opacity=".52" stroke-width="2"><path d="M${x} 45V${130+i%4*14}L${x+18} ${148+i%4*14}V${250+i%5*25}L${390+i%8*30} ${330+i%5*12}"/><circle cx="${x}" cy="45" r="4"/></g>`;
}
await png('routing',svg(circuits));
let die='<rect width="1024" height="1024" fill="#303936"/><rect x="12" y="12" width="1000" height="1000" fill="none" stroke="#a8aa8f" stroke-width="4"/>';
// Representative floorplan: paired logic regions, narrow cache banks and I/O.
for(let row=0;row<4;row++)for(let side=0;side<2;side++){
  const x=30+side*548,y=30+row*218;
  die+=`<g><rect x="${x}" y="${y}" width="416" height="204" fill="#576354" stroke="#969e85" stroke-width="2"/><rect x="${x+8}" y="${y+8}" width="252" height="143" fill="#3d4b40"/><rect x="${x+270}" y="${y+8}" width="136" height="188" fill="#6c705a"/>`;
  for(let j=0;j<22;j++)die+=`<path d="M${x+275} ${y+12+j*8}h124" stroke="#b0b29a" stroke-opacity=".48" stroke-width="2"/>`;
  for(let j=0;j<24;j++)die+=`<path d="M${x+12+j*10} ${y+12}v130" stroke="#acb09a" stroke-opacity=".3" stroke-width="1.5"/>`;
  for(let j=0;j<12;j++)die+=`<path d="M${x+12} ${y+14+j*11}h240" stroke="#a0a58c" stroke-opacity=".3" stroke-width="1.5"/>`;
  for(let j=0;j<4;j++)die+=`<rect x="${x+8+j*64}" y="${y+160}" width="56" height="35" fill="#87907a" stroke="#303e34" stroke-width="2"/>`;
  die+='</g>';
}
die+='<rect x="460" y="30" width="104" height="860" fill="#747b65"/><rect x="30" y="916" width="964" height="78" fill="#626e5d"/>';
for(let j=0;j<42;j++)die+=`<path d="M470 ${40+j*20}h84" stroke="#c5c4a5" stroke-opacity=".5" stroke-width="3"/>`;
for(let j=0;j<54;j++)die+=`<path d="M${40+j*18} 922v66" stroke="#aeb69a" stroke-width="3" stroke-opacity=".5"/>`;
await png('silicon',svg(die));
// A subtle, deterministic directional microfinish, not per-frame noise.
const finish=Buffer.alloc(512*512);let seed=42;
for(let y=0;y<512;y++){seed=(seed*1664525+1013904223)>>>0;const grain=174+(seed%24);for(let x=0;x<512;x++)finish[y*512+x]=grain;}
await sharp(finish,{raw:{width:512,height:512,channels:1}}).png().toFile(`${out}/brushed.png`);
await png('shadow',svg('<defs><radialGradient id="s"><stop stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="1024" height="1024" fill="url(#s)"/>'));
// Provenance is maintained in the committed README alongside the assets.
console.log('Baked processor geometry and restrained PBR surface maps.');
