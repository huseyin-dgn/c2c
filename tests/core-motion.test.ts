import test from 'node:test';
import assert from 'node:assert/strict';
import { coreMotion, coreKeyframes } from '../lib/core-motion';
test('five scroll checkpoints follow the authored camera path', () => {
  for (let i = 0; i < 5; i++) assert.deepEqual(coreMotion(i / 4), coreKeyframes[i]);
});
test('middle stage is fully disassembled and processing, final stage has a closed chassis', () => {
  assert.equal(coreMotion(0.5).separation, 1);
  assert.equal(coreMotion(0.5).processing, 1);
  assert.equal(coreMotion(1).separation, 0);
  assert.equal(coreMotion(1).integration, 1);
  assert.notEqual(coreMotion(0).rotation, coreMotion(1).rotation);
  assert.ok(coreMotion(0.75).cameraY < coreMotion(0).cameraY);
});
test('the entire camera and structure state reverses without history or elapsed time', () => {
  const stops = Array.from({ length: 101 }, (_, i) => i / 100);
  assert.deepEqual(stops.map(coreMotion), stops.toReversed().map(coreMotion).reverse());
  assert.deepEqual(coreMotion(-1), coreMotion(0));
  assert.deepEqual(coreMotion(2), coreMotion(1));
  assert.deepEqual(coreMotion(NaN), coreMotion(0));
});

test('camera velocity stays continuous through chapter boundaries', () => {
  const epsilon = 0.00001;
  for (const progress of [0.25, 0.5, 0.75]) {
    for (const key of ['cameraX', 'cameraY', 'cameraZ', 'rotation'] as const) {
      const pose = coreMotion(progress)[key];
      const before = (pose - coreMotion(progress - epsilon)[key]) / epsilon;
      const after = (coreMotion(progress + epsilon)[key] - pose) / epsilon;
      assert.ok(Math.abs(before - after) < 0.02, `${key} has no velocity jump at ${progress}`);
    }
  }
});

test('mechanical travel stays bounded and camera stays outside the assembly', () => {
  for (let i = 0; i <= 1000; i++) {
    const pose = coreMotion(i / 1000);
    for (const key of ['separation', 'processing', 'integration'] as const)
      assert.ok(pose[key] >= 0 && pose[key] <= 1);
    assert.ok(Math.hypot(pose.cameraX, pose.cameraY, pose.cameraZ) > 7);
  }
});
