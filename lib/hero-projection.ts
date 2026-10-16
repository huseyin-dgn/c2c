import * as THREE from 'three';

/** QA-only projection of actual mesh bounds, independent of exploded-view gaps. */
export function publishHeroProjection(canvas:HTMLCanvasElement,camera:THREE.Camera,footprint:THREE.Mesh,die:THREE.Mesh,assembly:THREE.Group,target:THREE.Vector3){
  const rect=canvas.getBoundingClientRect();
  const bounds=(mesh:THREE.Mesh)=>{
    if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
    const box=mesh.geometry.boundingBox!;
    const points=[];
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
      const v=new THREE.Vector3(x,y,z).applyMatrix4(mesh.matrixWorld).project(camera);
      points.push({x:rect.left+(v.x+1)*rect.width/2,y:rect.top+(1-v.y)*rect.height/2});
    }
    const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y));
    return{left,right,top,bottom,width:right-left,height:bottom-top,centerX:(left+right)/2,centerY:(top+bottom)/2,area:(right-left)*(bottom-top)};
  };
  const cpu=footprint.getWorldPosition(new THREE.Vector3());
  const perspective=camera as THREE.PerspectiveCamera;
  canvas.dataset.projection=JSON.stringify({footprint:bounds(footprint),die:bounds(die),distance:camera.position.distanceTo(cpu),cpu:cpu.toArray(),target:target.toArray(),camera:camera.position.toArray(),fov:perspective.fov,zoom:perspective.zoom,aspect:perspective.aspect,modelScale:assembly.getWorldScale(new THREE.Vector3()).toArray(),rotation:assembly.rotation.toArray().slice(0,3),canvas:{left:rect.left,top:rect.top,width:rect.width,height:rect.height}});
}
