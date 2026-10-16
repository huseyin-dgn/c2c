import test from 'node:test';
import assert from 'node:assert/strict';
import { demoFrame } from '../lib/camera-demo';
import { hardware, hardwarePosition } from '../lib/hardware';

test('counting changes only after each tracked centre crosses the same line',()=>{
  for(let i=0;i<=1000;i++){
    const frame=demoFrame('counting',i/1000);
    assert.equal(frame.people,Number(frame.personX>=450));
    assert.equal(frame.vehicles,Number(frame.vehicleX>=450));
  }
  assert.deepEqual(demoFrame('counting',.3),demoFrame('counting',.3));
  assert.equal(demoFrame('counting',1).people,1);
  assert.equal(demoFrame('counting',1).vehicles,1);
});

test('intrusion and defect events stay aligned with the depicted geometry in both directions',()=>{
  for(const p of [0,.2,.4,.6,.8,1,.8,.6,.4,.2,0]){
    const intrusion=demoFrame('intrusion',p),quality=demoFrame('quality',p);
    assert.equal(intrusion.event,intrusion.personX>=475);
    // The marked product is index 2, starting at 35 + 2 * 130; its centre is +42.
    assert.equal(quality.defectX,35+2*130+p*360);
    assert.equal(quality.event,quality.defectX+42>=450);
  }
  assert.deepEqual(demoFrame('intrusion',NaN),demoFrame('intrusion',0));
  assert.deepEqual(demoFrame('quality',2),demoFrame('quality',1));
});

test('exploded assembly preserves socket alignment and returns every component to its base',()=>{
  assert.equal(new Set(hardware.map(part=>part.id)).size,7);
  for(const part of hardware){
    const base=hardwarePosition(part.id,0),end=hardwarePosition(part.id,1);
    assert.deepEqual(base,[...part.position]);
    assert.equal(end[0],base[0]);assert.equal(end[2],base[2]);
    assert.ok(end[1]>=base[1]);
    assert.deepEqual(hardwarePosition(part.id,-1),base);
  }
  assert.equal(hardwarePosition('cpu',1)[0],hardwarePosition('cooling',1)[0]);
  assert.equal(hardwarePosition('cpu',1)[2],hardwarePosition('cooling',1)[2]);
  assert.ok(hardwarePosition('cooling',1)[1]>hardwarePosition('cpu',1)[1]);
});
