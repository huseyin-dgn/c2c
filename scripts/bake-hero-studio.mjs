// Original neutral product-studio reflection, prefiltered offline. Hero only.
import http from 'node:http';
import fs from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {chromium} from 'playwright';
const modules={'/three.js':'node_modules/three/build/three.module.js','/three.core.js':'node_modules/three/build/three.core.js'};
const server=http.createServer(async(req,res)=>{
  if(modules[req.url]){res.setHeader('Content-Type','text/javascript');res.end(await fs.readFile(modules[req.url]));}
  else res.end('<script type="importmap">{"imports":{"three":"/three.js"}}</script>');
});
await new Promise(resolve=>server.listen(3102,'127.0.0.1',resolve));
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:3102');
  const result=await page.evaluate(async()=>{
    const T=await import('/three.js'),renderer=new T.WebGLRenderer(),scene=new T.Scene();
    scene.background=new T.Color(.055,.058,.05);
    const softbox=(position,w,h,power)=>{
      for(let i=0;i<5;i++){
        const inset=i*.09,mesh=new T.Mesh(new T.PlaneGeometry(w*(1-inset),h*(1-inset)),new T.MeshBasicMaterial({color:new T.Color(power*(.25+i*.15),power*(.248+i*.149),power*(.24+i*.146))}));
        mesh.position.set(...position).multiplyScalar(1-i*.0005);mesh.lookAt(0,0,0);scene.add(mesh);
      }
    };
    softbox([-3,5,-5],7,4,4); // Broad key reflected in the nickel top.
    softbox([5,2,2],3,5,1.8); // Controlled vertical fill.
    softbox([-6,1,3],1.2,5,3); // Narrow edge reflection, no neon hue.
    const generator=new T.PMREMGenerator(renderer),target=generator.fromScene(scene,.025,.1,100,{size:64}),{width,height}=target;
    const data=new Uint16Array(width*height*4);renderer.readRenderTargetPixels(target,0,0,width,height,data);
    const bytes=new Uint8Array(data.buffer);let binary='';
    for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    target.dispose();generator.dispose();scene.traverse(n=>{if(n.isMesh){n.geometry.dispose();n.material.dispose();}});renderer.dispose();
    return {width,height,base64:btoa(binary)};
  });
  const raw=Buffer.from(result.base64,'base64'),compressed=gzipSync(raw,{level:9}),dir='public/models/processor';
  await fs.writeFile(`${dir}/studio-env.bin.gz`,compressed);
  await fs.writeFile(`${dir}/studio-env.json`,JSON.stringify({width:result.width,height:result.height,bytes:raw.length,compressedBytes:compressed.length,source:'Original neutral three-softbox studio, offline PMREM size64'},null,2)+'\n');
  console.log({bytes:raw.length,compressedBytes:compressed.length});
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
