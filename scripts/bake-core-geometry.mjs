// Original C2C geometry, baked with Three.js to avoid runtime triangulation.
import * as THREE from 'three';
import fs from 'node:fs/promises';
function makePlate() {
  const shape = new THREE.Shape(),
    w = 1.45,
    h = 1.13,
    r = 0.09;
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.26, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  for (const x of [-1.23, 1.23]) for (const z of [-0.9, 0.9]) {
    const mountingHole = new THREE.Path();
    mountingHole.absarc(x, z, 0.075, 0, Math.PI * 2, true);
    shape.holes.push(mountingHole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.13,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.045,
    bevelThickness: 0.035,
    curveSegments: 18,
  });
  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
const geometry=makePlate();
await fs.mkdir('public/models',{recursive:true});
const buffer=new THREE.BufferGeometry().copy(geometry);
await fs.writeFile('public/models/core-plate.json',JSON.stringify(buffer.toJSON()));
console.log('Baked original plate:',geometry.getAttribute('position').count,'vertices');
geometry.dispose();
buffer.dispose();
