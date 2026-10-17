/* global window, document, history, scrollTo, scrollY, innerHeight, getComputedStyle */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const base = process.env.TEST_BASE_URL || 'http://localhost:3100';
const output = process.env.TEST_ARTIFACT_DIR || path.join(os.tmpdir(), 'c2c-telemetry-mode');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { checks: [], errors: [], scenes: [] };
const fields = {
  hero: ['frames', 'camera', 'layers', 'assemblyProgress', 'separation', 'integration', 'drawCalls', 'triangles', 'programs', 'geometries', 'textures', 'contacts', 'model', 'packageLift', 'pullback', 'projection'],
  hardware: ['hardwareYaw', 'hardwarePart', 'explosion', 'flowFrame', 'hardwareFrame', 'hardwareCamera', 'hardwareFlow'],
  vision: ['visionFrame', 'visionTime', 'visionProducts', 'visionCamera', 'visionDrawCalls', 'visionTriangles', 'visionActuator', 'visionStroke', 'visionView', 'visionCaptureProduct'],
};
const focus = (page, selector) => page.locator(selector).evaluate(e => scrollTo({ top: e.getBoundingClientRect().top + scrollY - 120, behavior: 'instant' }));
const data = (page, selector) => page.locator(selector).evaluate(c => ({ ...c.dataset }));
const query = (page, search, method = 'pushState') => page.evaluate(({ search, method }) => history[method](null, '', '/' + search), { search, method });
const ready = (page, selector) => page.waitForFunction(selector => {
  const c = document.querySelector(selector);
  return c && getComputedStyle(c).visibility === 'visible' && c.dataset.sceneReady === 'true';
}, selector, { timeout: 45000 });

try {
  for (const search of ['', '?measure=0', '?measure=10', '?measure=1']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    page.on('pageerror', e => report.errors.push(e.message));
    await page.addInitScript(() => {
      window.__telemetry = { rendererTasks: 0, productSerializations: 0 };
      const enqueue = window.queueMicrotask;
      window.queueMicrotask = callback => {
        if (callback.toString().includes('.dataset.drawCalls')) window.__telemetry.rendererTasks++;
        enqueue(callback);
      };
      const stringify = JSON.stringify;
      JSON.stringify = function (value, ...args) {
        if (Array.isArray(value) && value.length && value.every(p => p && typeof p.id === 'string' && 'x' in p && 'y' in p && 'z' in p)) window.__telemetry.productSerializations++;
        return stringify.call(JSON, value, ...args);
      };
    });
    await page.goto(new URL('/' + search, base).href, { waitUntil: 'networkidle' });
    const measured = search === '?measure=1';
    await ready(page, '.story canvas');
    for (const p of [.15, .5, 0]) {
      await page.locator('.story').evaluate((e, p) => scrollTo({ top: (e.offsetHeight - innerHeight) * p, behavior: 'instant' }), p);
      await page.waitForTimeout(500);
      if (p === .5 && !search) await page.locator('.story canvas').screenshot({ path: path.join(output, 'hero-normal-exploded.png') });
    }
    const hero = await data(page, '.story canvas');
    await page.locator('.story canvas').screenshot({ path: path.join(output, measured ? 'hero-measure.png' : `hero-normal-${search.length}.png`) });
    await focus(page, '#donanim');
    await ready(page, '.hardware-viewport canvas');
    await page.locator('[data-hardware-button=gpu]').click();
    await page.locator('.hardware-controls button').first().click();
    await page.waitForTimeout(1400);
    const hardware = await data(page, '.hardware-viewport canvas');
    await page.locator('.hardware-viewport').screenshot({ path: path.join(output, measured ? 'hardware-measure.png' : `hardware-normal-${search.length}.png`) });
    await focus(page, '#kamera-deneyimi');
    await page.waitForSelector('.vision-station canvas');
    await page.locator('.vision-start').click();
    await page.waitForFunction(() => Number(document.querySelector('#kamera-deneyimi').dataset.visionTime) > .3);
    const vision = await data(page, '.vision-station canvas');
    const samples = { hero, hardware, vision };
    for (const [scene, keys] of Object.entries(fields)) {
      for (const key of keys) assert.equal(key in samples[scene], measured, `${search || '/'} ${scene}.${key}`);
    }
    const counts = await page.evaluate(() => window.__telemetry);
    assert.equal(counts.rendererTasks > 0, measured);
    assert.equal(counts.productSerializations > 0, measured);
    assert.ok(Number(hero.prepareMs) >= 0);
    assert.equal(hardware.sceneReady, 'true');
    if (measured) {
      assert.ok(Number(hero.frames) > 1);
      assert.ok(Number(hero.drawCalls) > 0);
      assert.ok(Number(hardware.explosion) > .99);
      assert.equal(hardware.hardwarePart, 'gpu');
      assert.ok(Number(vision.visionTime) > 0);
      assert.ok(JSON.parse(vision.visionProducts).length > 0);
    }
    // Query changes without a remount must take effect on the next render.
    await query(page, '?measure=1');
    await page.waitForFunction(() => Number(document.querySelector('.vision-station canvas').dataset.visionTime) > .4);
    const before = Number((await data(page, '.vision-station canvas')).visionFrame);
    await page.waitForFunction(before => Number(document.querySelector('.vision-station canvas').dataset.visionFrame) > before, before);
    await query(page, '?measure=10', 'replaceState');
    await page.waitForTimeout(100);
    const frozen = await data(page, '.vision-station canvas');
    const offCounts = await page.evaluate(() => window.__telemetry);
    await page.waitForTimeout(400);
    assert.deepEqual(await data(page, '.vision-station canvas'), frozen);
    assert.deepEqual(await page.evaluate(() => window.__telemetry), offCounts);
    const clock = await page.locator('#kamera-deneyimi').getAttribute('data-vision-time');
    await page.waitForTimeout(200);
    assert.notEqual(await page.locator('#kamera-deneyimi').getAttribute('data-vision-time'), clock, 'simulation continues without telemetry');
    await page.evaluate(() => history.back());
    if (measured) {
      await page.waitForFunction(frame => Number(document.querySelector('.vision-station canvas').dataset.visionFrame) > frame, Number(frozen.visionFrame));
    }
    report.scenes.push({ search, counts, samples });
    report.checks.push(`${search || '/'}: scene controls, readiness, strict opt-in, live query enable/disable, simulation continues`);
    await page.close();
  }
  // Readiness and fallback signals also remain available without measurement.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => report.errors.push(e.message));
  await page.goto(new URL('/?measure=1', base).href, { waitUntil: 'networkidle' });
  await ready(page, '.story canvas');
  await page.reload({ waitUntil: 'networkidle' });
  await ready(page, '.story canvas');
  assert.equal(new URL(page.url()).searchParams.get('measure'), '1');
  assert.ok(Number((await data(page, '.story canvas')).frames) > 0);
  await page.locator('.header-cta').click();
  await page.waitForURL('**/iletisim');
  await page.goBack({ waitUntil: 'networkidle' });
  await ready(page, '.story canvas');
  assert.equal(new URL(page.url()).searchParams.get('measure'), '1');
  await query(page, '');
  await focus(page, '#donanim');
  await ready(page, '.hardware-viewport canvas');
  await page.locator('.hardware-viewport canvas').evaluate(c => c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForSelector('[data-hardware-fallback]');
  await page.close();
  const fallback = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await fallback.addInitScript(() => {
    const original = window.HTMLCanvasElement.prototype.getContext;
    window.HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl' || type === 'webgl2' ? null : original.call(this, type, ...args);
    };
  });
  await fallback.goto(base, { waitUntil: 'networkidle' });
  await focus(fallback, '#donanim');
  await fallback.waitForSelector('[data-hardware-fallback]');
  assert.equal(await fallback.locator('.story').getAttribute('data-renderer'), 'fallback');
  await fallback.locator('[data-hardware-button=ssd]').click();
  assert.equal(await fallback.locator('#donanim').getAttribute('data-hardware-selected'), 'ssd');
  await fallback.close();
  const reduced = await browser.newPage({ viewport: { width: 393, height: 900 }, reducedMotion: 'reduce' });
  await reduced.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await reduced.locator('.story canvas, .hardware-viewport canvas').count(), 0);
  await reduced.close();
  report.checks.push('measurement survives reload and route back; normal mode preserves WebGL-unavailable, context-loss and reduced-motion fallbacks');
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'telemetry.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ checks: report.checks, errors: report.errors, output }, null, 2));
