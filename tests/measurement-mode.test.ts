import test from 'node:test';
import assert from 'node:assert/strict';
import { isMeasurementMode } from '../lib/measurement-mode';

test('measurement mode is exact, cached, SSR safe and follows live query changes', () => {
  assert.equal(isMeasurementMode(), false);
  const originalParams = globalThis.URLSearchParams;
  let parses = 0;
  globalThis.URLSearchParams = class extends originalParams {
    constructor(...args: ConstructorParameters<typeof URLSearchParams>) { super(...args); parses++; }
  };
  const location = { search: '' };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location } });
  try {
    for (const [search, expected] of [
      ['', false], ['?measure=0', false], ['?measure=10', false],
      ['?other=measure=1', false], ['?measure=1', true],
      ['?measure=01', false], ['?measure=1extra', false],
      ['?debug=1&measure=1', true], ['', false],
    ] as const) {
      location.search = search;
      const before = parses;
      for (let frame = 0; frame < 100; frame++) assert.equal(isMeasurementMode(), expected, search);
      assert.equal(parses, before + 1, 'parse only once per changed query');
    }
  } finally {
    Reflect.deleteProperty(globalThis, 'window');
    globalThis.URLSearchParams = originalParams;
  }
});
