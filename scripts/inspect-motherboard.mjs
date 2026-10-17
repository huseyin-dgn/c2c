import fs from 'node:fs';
import zlib from 'node:zlib';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

const path = 'public/models/motherboard/desktop.glb.gz';
const buffer = zlib.gunzipSync(fs.readFileSync(path));

const loader = new GLTFLoader();
const gltf = await loader.parseAsync(
  buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ),
  ''
);

gltf.scene.updateMatrixWorld(true);

const bounds = new THREE.Box3().setFromObject(gltf.scene);
const size = bounds.getSize(new THREE.Vector3());
const center = bounds.getCenter(new THREE.Vector3());

console.log('MODEL ÖLÇÜLERİ');
console.log('Size:', size.toArray());
console.log('Center:', center.toArray());
console.log('Min:', bounds.min.toArray());
console.log('Max:', bounds.max.toArray());

console.log('\nMODEL PARÇALARI');

gltf.scene.traverse((object) => {
  if (object.isMesh) {
    console.log({
      name: object.name,
      material: object.material?.name,
      position: object.position.toArray()
    });
  }
});