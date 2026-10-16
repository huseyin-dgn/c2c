// Bake our existing Three.js RoomEnvironment once, instead of compiling and
// rendering its PMREM passes on every visitor's main thread. No external media.
import http from 'node:http';
import fs from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';
const modules={
  '/three.js':'node_modules/three/build/three.module.js',
  '/three.core.js':'node_modules/three/build/three.core.js',
  '/room.js':'node_modules/three/examples/jsm/environments/RoomEnvironment.js',
};
const server=http.createServer(async(req,res)=>{
  if(modules[req.url]){res.setHeader('Content-Type','text/javascript');res.end(await fs.readFile(modules[req.url]));}
  else{res.setHeader('Content-Type','text/html');res.end('<script type="importmap">{"imports":{"three":"/three.js"}}</script>');}
});
await new Promise(resolve=>server.listen(3102,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:3102');
  const result=await page.evaluate(async()=>{
    const THREE=await import('/three.js'),{RoomEnvironment}=await import('/room.js');
    const renderer=new THREE.WebGLRenderer({antialias:false});
    const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer);
    const target=generator.fromScene(room,.04,.1,100,{size:64});
    const {width,height}=target;
    const data=new Uint16Array(width*height*4);
    renderer.readRenderTargetPixels(target,0,0,width,height,data);
    if(!data.some(value=>value>0))throw new Error('Empty environment readback');
    const bytes=new Uint8Array(data.buffer);let binary='';
    for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    const result={width,height,base64:btoa(binary)};
    target.dispose();generator.dispose();room.dispose();renderer.dispose();return result;
  });
  await fs.mkdir('public/models',{recursive:true});
  const raw=Buffer.from(result.base64,'base64');const compressed=gzipSync(raw,{level:9});
  await fs.writeFile('public/models/studio-env.bin.gz',compressed);
  await fs.writeFile('public/models/studio-env.json',JSON.stringify({width:result.width,height:result.height,format:'RGBA HalfFloat CubeUV',bytes:raw.length,compressedBytes:compressed.length,source:'Three.js RoomEnvironment / PMREMGenerator, sigma 0.04'},null,2)+'\n');
  console.log(JSON.stringify({width:result.width,height:result.height,bytes:raw.length,compressedBytes:compressed.length}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
