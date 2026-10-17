import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceVision, createVisionState, productTiming, productPose, actuatorPose, nextVisionEvent, visionScenarios, station, type VisionState, type VisionEvent } from '../lib/vision-simulation';

test('simulation outcomes are independent of refresh rate and large threshold crossings',()=>{
  const coarse=advanceVision(createVisionState(),90);
  for(const hz of [30,60,120]){
    let state=createVisionState();
    for(let i=0;i<90*hz;i++)state=advanceVision(state,1/hz);
    assert.deepEqual([state.inspected,state.passed,state.rejected,state.nextSerial],[coarse.inspected,coarse.passed,coarse.rejected,coarse.nextSerial]);
    assert.ok(Math.abs(state.time-coarse.time)<1e-8);
  }
});
test('decisions, actuator commands and terminal counts stay bound to unique product IDs',()=>{
  let state=createVisionState();const events:VisionEvent[]=[],seen=new Set<number>();
  for(let i=0;i<60*60;i++){
    state=advanceVision(state,1/60);
    for(const event of [...state.events].reverse())if(!seen.has(event.key)){seen.add(event.key);events.push(event);}
    const actuator=actuatorPose(state);
    if(actuator.productId){
      const product=state.products.find(p=>p.id===actuator.productId)!;
      assert.equal(product.defective,true);
      assert.ok(state.time>=productTiming(product).eject);
    }
    for(const product of state.products)if(!product.defective)assert.equal(productPose(product,state.time).z,0);
  }
  const outcomes=events.filter(e=>e.kind==='pass'||e.kind==='reject');
  assert.equal(new Set(outcomes.map(e=>e.productId)).size,outcomes.length,'no product is counted twice');
  assert.equal(state.passed,outcomes.filter(e=>e.kind==='pass').length);
  assert.equal(state.rejected,outcomes.filter(e=>e.kind==='reject').length);
  assert.equal(state.inspected,events.filter(e=>e.kind==='decision').length);
  for(const event of outcomes){
    const serial=Number(event.productId.slice(2));
    assert.equal(event.kind,serial%3===2?'reject':'pass');
    const decision=events.find(e=>e.productId===event.productId&&e.kind==='decision');
    assert.ok(decision&&decision.at<event.at);
    if(event.kind==='reject')assert.ok(events.find(e=>e.productId===event.productId&&e.kind==='actuate'&&e.at<event.at));
  }
  assert.ok(state.products.length<10,'active product pool remains bounded');assert.equal(state.events.length,8);
});
test('inspection count and final routing counts represent different physical stages',()=>{
  const state=advanceVision(createVisionState(),5);
  assert.ok(state.inspected>0);assert.equal(state.passed,0);assert.equal(state.rejected,0);
  const later=advanceVision(state,7);assert.ok(later.passed>0);assert.ok(later.rejected>0);
  assert.ok(later.passed+later.rejected<=later.inspected);
});
test('pusher face makes contact with the matching part and returns before the next arrival',()=>{
  let state=advanceVision(createVisionState(),4);const product=state.products.find(p=>p.defective)!;
  const timing=productTiming(product);
  for(const age of [.3,.4,.48]){
    state=advanceVision(createVisionState(),timing.eject+age);
    const actuator=actuatorPose(state),pose=productPose(product,state.time);
    assert.equal(actuator.productId,product.id);
    assert.ok(Math.abs((pose.z-.3)-(-1.1+1.7*actuator.stroke))<1e-8);
    assert.ok(Math.abs(pose.x-station.reject)<.1);
  }
  assert.equal(actuatorPose(advanceVision(createVisionState(),timing.eject+1.2)).productId,null);
});
test('all three scenarios have distinct inspection reasons and reproducible outcomes',()=>{
  for(const scenario of visionScenarios){
    let state=createVisionState(scenario.id);
    const badCapture=2.15+(station.camera-station.start)/station.speed+.3;
    state=advanceVision(state,badCapture);
    assert.equal(state.inspection?.product.scenario,scenario.id);
    assert.equal(state.inspection?.decision,'reject');assert.equal(state.inspection?.reason,scenario.failure);
    assert.deepEqual(advanceVision(createVisionState(scenario.id),badCapture),state);
  }
});
test('pause is a stable state, reset clears all data, and reduced-motion steps do not need a timer',()=>{
  let state:VisionState=createVisionState();
  for(let i=0;i<25;i++){const next=nextVisionEvent(state);assert.ok(next.time>state.time);state=next;}
  assert.ok(state.inspected>0);assert.ok(state.events.length>0);
  for(const invalid of [0,-1,NaN,Infinity])assert.equal(advanceVision(state,invalid),state);
  const reset=createVisionState('alignment');
  assert.deepEqual([reset.time,reset.inspected,reset.passed,reset.rejected,reset.events.length,reset.products.length],[0,0,0,0,0,0]);
  assert.equal(reset.nextSerial,1);assert.equal(reset.inspection,null);
});
