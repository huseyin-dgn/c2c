import test from 'node:test';
import assert from 'node:assert/strict';
import { pointInSafetyZone, securityFrame } from '../lib/security-scenario';

test('detection outside the region is not an intrusion; alert waits for rule evaluation', () => {
  const acquisition = securityFrame(.1), detected = securityFrame(.3), crossing = securityFrame(.5), decision = securityFrame(.7), record = securityFrame(.9);
  assert.equal(acquisition.detected, false);
  assert.equal(detected.detected, true);
  assert.equal(detected.inside, false);
  assert.equal(detected.condition, false);
  assert.equal(detected.alert, false);
  assert.equal(crossing.inside, true);
  assert.equal(crossing.condition, true);
  assert.equal(crossing.alert, false);
  assert.equal(decision.alert, true);
  assert.equal(decision.recorded, false);
  assert.equal(record.recorded, true);
});
test('all positions, region tests and notifications reverse deterministically', () => {
  for (let i=0;i<=1000;i++) {
    const f=securityFrame(i/1000);
    assert.equal(f.inside,pointInSafetyZone(f.x,f.y));
    if(f.phase<2)assert.equal(f.inside,false);
    if(f.alert)assert.ok(f.inside&&f.detected&&f.phase>=3);
    assert.deepEqual(securityFrame(i/1000),f);
  }
  assert.deepEqual(securityFrame(-1),securityFrame(0));
  assert.deepEqual(securityFrame(NaN),securityFrame(0));
  assert.deepEqual(securityFrame(2),securityFrame(1));
});
