// Original material maps. These depict representative macro interconnect regions,
// passivation and package finishes, never individually visible transistors.
import sharp from 'sharp';
const dir='public/models/processor',N=1024;
const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}">${body}</svg>`;
const rgba=async body=>sharp(Buffer.from(svg(body))).ensureAlpha().raw().toBuffer();
const color=async(name,data,size=N)=>sharp(data,{raw:{width:N,height:N,channels:4}}).resize(size).webp({quality:92,alphaQuality:100}).toFile(`${dir}/${name}.webp`);
function random(seed){let s=seed;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
async function maps(name,source,{roughness=.5,grain=.012,normal=.3,size=256,stamp}={}){
  const pixels=await sharp(source,{raw:{width:N,height:N,channels:4}}).resize(size).raw().toBuffer();
  const stampPixels=stamp?await sharp(stamp,{raw:{width:N,height:N,channels:4}}).resize(size).extractChannel(3).raw().toBuffer():null;
  const surface=Buffer.alloc(size*size*3),height=new Float32Array(size*size),normalMap=Buffer.alloc(size*size*3),noise=random(712);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=y*size+x,j=i*4,luma=(pixels[j]+pixels[j+1]+pixels[j+2])/765,n=noise()-.5;
    height[i]=luma*.14+n*grain+Math.sin(y*2.27)*grain;
    surface[i*3]=255;surface[i*3+1]=Math.round(255*Math.min(.95,Math.max(.05,roughness+(luma-.4)*.17+n*grain*2+(stampPixels?.[i]||0)/255*.065)));surface[i*3+2]=Math.round(180+luma*65);
  }
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=y*size+x,dx=(height[y*size+Math.min(size-1,x+1)]-height[y*size+Math.max(0,x-1)])*normal,dy=(height[Math.min(size-1,y+1)*size+x]-height[Math.max(0,y-1)*size+x])*normal;
    const length=Math.sqrt(dx*dx+dy*dy+1);normalMap[i*3]=Math.round(128-dx/length*127);normalMap[i*3+1]=Math.round(128+dy/length*127);normalMap[i*3+2]=Math.round(128+127/length);
  }
  await sharp(surface,{raw:{width:size,height:size,channels:3}}).png({palette:true,colours:64,dither:0}).toFile(`${dir}/${name}-surface.png`);
  await sharp(normalMap,{raw:{width:size,height:size,channels:3}}).png({palette:true,colours:32,dither:0}).toFile(`${dir}/${name}-normal.png`);
}

// Satin titanium-silver: directional microfinish and a subdued laser tone.
let metal='<rect width="1024" height="1024" fill="#b8bdc0"/>';
const noise=random(46);
for(let y=0;y<N;y++)metal+=`<path d="M0 ${y}h1024" stroke="${y%3?'#697276':'#e1e4e5'}" stroke-opacity="${.012+noise()*.018}" stroke-width=".55"/>`;
// Original small etched brand field; no copied commercial CPU insignia.
const badge='<rect x="408" y="408" width="208" height="208" rx="2"';
const lettering='<text x="512" y="538" text-anchor="middle" font-family="Arial,sans-serif" font-size="70" font-weight="500" letter-spacing="5"';
metal+=`${badge} fill="#7c878d" fill-opacity=".055" stroke="#5f6c72" stroke-opacity=".28" stroke-width="1.4"/>${lettering} fill="#59656b" fill-opacity=".42">C2C</text>`;
// Locally matte ink/laser finish: the small mark must not catch a bright gloss.
const stamp=await rgba(`${badge} fill="white" fill-opacity=".08" stroke="white" stroke-opacity=".3" stroke-width="1.4"/>${lettering} fill="white">C2C</text>`);
const metalPixels=await rgba(metal);await color('metal-color',metalPixels);await maps('metal',metalPixels,{roughness:.5,grain:.012,normal:1.6,stamp});
// An isolated material tweak must not regenerate the die or motherboard maps.
if(process.argv.includes('--metal-only'))process.exit(0);

// Asymmetric representative heterogeneous floorplan: compute clusters, shared
// SRAM, dense logic and peripheral interfaces, not a decorative checkerboard.
let die='<rect width="1024" height="1024" fill="#343e37"/><rect x="13" y="13" width="998" height="998" rx="3" fill="none" stroke="#939780" stroke-width="3"/><rect x="22" y="22" width="980" height="980" fill="none" stroke="#525c4b" stroke-width="5"/>';
const trace=(x,y,w,h,mode)=>{
  let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${mode==='memory'?'#777969':mode==='io'?'#666b5d':'#4d5a4e'}"/>`;
  if(mode==='memory'){
    for(let row=3;row<h-2;row+=3)s+=`<path d="M${x+3} ${y+row}h${w-6}" stroke="#c6c4a8" stroke-opacity=".4" stroke-width="1"/>`;
    for(let col=12;col<w-3;col+=19)s+=`<path d="M${x+col} ${y+2}v${h-4}" stroke="#252f29" stroke-opacity=".42" stroke-width="2"/>`;
  }else{
    for(let row=4;row<h-4;row+=5){const offset=(row%15)*.4;s+=`<path d="M${x+4} ${y+row}h${w*.34+offset}v2h${w*.23}v-2h${w*.33-offset-8}" stroke="#b5baa0" stroke-opacity=".38" stroke-width="1"/>`;}
    for(let col=7;col<w-4;col+=11)s+=`<path d="M${x+col} ${y+3}v${h-6}" stroke="#87927b" stroke-opacity=".2" stroke-width="1"/>`;
    // Unequal standard-cell placement/routing regions within the logic fabric.
    for(let row=12;row<h-20;row+=31)for(let col=10;col<w-22;col+=37){
      const inset=(row+col)%3*3;
      s+=`<path d="M${x+col} ${y+row}h${17+inset}v${9+inset}h-${8+inset}v5h-9Z" fill="#87917b" fill-opacity=".3"/>`;
    }
  }return s;
};
// Deliberate macro placement: left compute complex, central shared cache,
// right mixed logic / interface complex, bottom PHY banks. No device claim.
const regions=[
  [46,46,242,184,'logic'],[300,46,173,106,'memory'],[300,164,173,138,'logic'],
  [46,242,242,156,'logic'],[300,314,173,84,'memory'],[46,410,427,95,'memory'],
  [46,517,164,226,'logic'],[222,517,251,132,'logic'],[222,661,251,82,'memory'],
  [46,755,427,105,'logic'],[488,46,99,814,'memory'],
  [604,46,210,261,'logic'],[826,46,147,116,'memory'],[826,174,147,133,'io'],
  [604,319,369,90,'memory'],[604,421,142,289,'logic'],[758,421,215,178,'logic'],
  [758,611,215,99,'memory'],[604,722,369,138,'io'],
];
for(const region of regions)die+=trace(...region);
for(let i=0;i<18;i++){
  die+=`<path d="M${592+i*.45} 44V${120+i*39}l8 8V${870+i*.7}H${52+i*47}" stroke="#b8b49a" stroke-opacity=".38" stroke-width=".8" fill="none"/>`;
}
for(let i=0;i<8;i++)die+=trace(46+i*117,900,104,72,i%3===0?'memory':'io');
// Peripheral test/connection areas stay minute relative to the die.
for(let i=0;i<70;i++)for(const edge of [0,1,2,3])die+=`<g transform="rotate(${edge*90} 512 512)"><rect x="${39+i*13.55}" y="29" width="5" height="7" fill="#92957c" opacity=".55"/></g>`;
const diePixels=await rgba(die);await color('silicon-color',diePixels);await maps('silicon',diePixels,{roughness:.37,grain:.004,normal:.65});

// Organic substrate: solder-mask routing and a defined flip-chip landing field.
let substrate='<rect width="1024" height="1024" fill="#183722"/>';
for(let edge=0;edge<4;edge++)for(let i=0;i<48;i++){
  const x=48+i*19.7,y=90+(i%6)*8;
  substrate+=`<g transform="rotate(${edge*90} 512 512)" fill="none"><path d="M${x} 35V${y}l${i<24?28:-28} 28V${290+(i%7)*11}L${410+(i%12)*17} 440" stroke="#657450" stroke-opacity=".45" stroke-width="1.1"/><circle cx="${x}" cy="35" r="2.2" stroke="#9d9870" stroke-width="1.2"/></g>`;
}
for(let y=0;y<25;y++)for(let x=0;x<31;x++)substrate+=`<rect x="${294+x*14.4}" y="${337+y*14.3}" width="4.5" height="4.5" rx="1" fill="#c0ac75" opacity=".72"/>`;
const substratePixels=await rgba(substrate);await color('substrate-color',substratePixels);await maps('substrate',substratePixels,{roughness:.7,grain:.015,normal:1.1});

// Shared component finish maps, sampled through pre-baked UVs in the GLB.
let board='<rect width="1024" height="1024" fill="#85877d"/>';
for(let i=0;i<1024;i+=2)board+=`<path d="M0 ${i}h1024M${i} 0v1024" stroke="#a1a393" stroke-opacity=".035" stroke-width="1"/>`;
const boardPixels=await rgba(board);await maps('board',boardPixels,{roughness:.67,grain:.018,normal:1.2});
console.log('Baked original metal, silicon, substrate and component finish maps.');
