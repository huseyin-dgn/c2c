import test from 'node:test';
import assert from 'node:assert/strict';
import {coreMotion} from '../lib/core-motion';
import {heroMotion,heroTiming,heroClosureProgress,heroPullbackProgress} from '../lib/hero-sequence';

const distance=(p:number)=>{const {pose}=heroMotion(p);return Math.hypot(pose.cameraX,pose.cameraY,pose.cameraZ);};
test('assembly keeps its original poses and absolute scroll durations',()=>{
  for(let i=0;i<=1000;i++){
    const originalProgress=i/1000,heroProgress=originalProgress/heroTiming.total;
    const actual=heroMotion(heroProgress);
    for(const key of ['separation','processing','integration','rotation','cameraX','cameraY','cameraZ'] as const)
      assert.ok(Math.abs(actual.pose[key]-coreMotion(originalProgress)[key])<1e-12);
    assert.ok(Math.abs(heroProgress*(4*heroTiming.total)-originalProgress*4)<1e-12);
  }
});
test('pullback waits until the entire original closure and seated hold have finished',()=>{
  assert.ok(heroPullbackProgress>heroClosureProgress);
  for(let i=0;i<=1000;i++){
    const p=i/1000,m=heroMotion(p);
    if(m.assemblyProgress<1)assert.equal(m.pullback,0);
    if(m.pullback>0){assert.equal(m.assemblyProgress,1);assert.equal(m.pose.separation,0);}
  }
  assert.equal(heroMotion(heroPullbackProgress).pullback,0);
  const initial=coreMotion(0),final=heroMotion(1).pose;
  for(const key of ['cameraX','cameraY','cameraZ','rotation'] as const)assert.equal(final[key],initial[key]);
});
test('camera approaches once, holds through closure, then retreats once',()=>{
  let previous=Infinity;
  for(let i=0;i<=250;i++){const p=i/1000/heroTiming.total,d=distance(p);assert.ok(d<=previous+1e-12);previous=d;}
  for(let i=0;i<=1000;i++){
    const p=.25/heroTiming.total+(heroPullbackProgress-.25/heroTiming.total)*i/1000;
    assert.ok(Math.abs(distance(p)-previous)<1e-12);
  }
  for(let i=0;i<=1000;i++){const d=distance(heroPullbackProgress+(1-heroPullbackProgress)*i/1000);assert.ok(d>=previous-1e-12);previous=d;}
});
test('final dolly eases in/out and scroll reversal has no history',()=>{
  const eps=1e-6;
  assert.ok(Math.abs(distance(heroPullbackProgress+eps)-distance(heroPullbackProgress))/eps<.01);
  assert.ok(Math.abs(distance(1)-distance(1-eps))/eps<.01);
  const steps=Array.from({length:101},(_,i)=>i/100);
  assert.deepEqual(steps.map(heroMotion),steps.toReversed().map(heroMotion).reverse());
  assert.deepEqual(heroMotion(NaN),heroMotion(0));assert.deepEqual(heroMotion(2),heroMotion(1));
});
