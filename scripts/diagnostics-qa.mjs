import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const production = process.env.TEST_PRODUCTION === '1';
const output = process.env.TEST_ARTIFACT_DIR || (production ? 'artifacts/interactive/production-debug' : 'artifacts/interactive/diagnostics');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
const page = await context.newPage();
const report = { base, production, browser: browser.version(), personalSession: false, errors: [], sockets: [], stages: [], checks: [], passed: false };
page.on('pageerror', error => report.errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
page.on('websocket', socket => {
  const entry = { url: socket.url(), frames: 0, errors: [] };
  report.sockets.push(entry);
  socket.on('framereceived', () => entry.frames++);
  socket.on('socketerror', error => entry.errors.push(error));
});
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.scene-debug').count(), 0);
  report.checks.push('normal URL: panel absent');
  await page.goto(`${base}/?debug=1`, { waitUntil: 'networkidle' });
  if (production) {
    assert.equal(await page.locator('.scene-debug').count(), 0);
    report.checks.push('production debug=1: panel absent');
  } else {
    await page.waitForSelector('canvas[data-camera]');
    await page.waitForFunction(() => document.querySelector('[data-debug="webgl"]')?.textContent === 'Active');
    assert.match(await page.locator('[data-debug="canvas"]').innerText(), /Mounted/);
    assert.match(await page.locator('[data-debug="trigger"]').innerText(), /^Active/);
    assert.equal(await page.locator('.pin-spacer:has(> .story-stage)').count(), 1);
    report.renderer = await page.locator('[data-debug="renderer"]').innerText();
    assert.notEqual(report.renderer, 'Erişilemiyor');
    await page.getByRole('button', { name: 'Animasyonu Test Et', exact: true }).click();
    for (const progress of [0, 25, 50, 75, 100]) {
      await page.waitForFunction(value => Math.abs(Number(document.querySelector('.story')?.dataset.progress) * 100 - value) < 0.15, progress);
      await page.waitForFunction(value => Math.abs(parseFloat(document.querySelector('[data-debug="pose"]').textContent) - value) < 0.15, progress);
      const state = await page.evaluate(() => ({
        progress: Number(document.querySelector('.story').dataset.progress) * 100,
        panel: document.querySelector('[data-debug="progress"]').textContent,
        chapter: document.querySelector('[data-debug="chapter"]').textContent,
        camera: document.querySelector('.story canvas').dataset.camera,
        separation: document.querySelector('.story canvas').dataset.separation,
        integration: document.querySelector('.story canvas').dataset.integration,
        top: document.querySelector('.story-stage').getBoundingClientRect().top,
      }));
      assert.ok(Math.abs(state.top) < 2);
      report.stages.push(state);
      await page.screenshot({ path: `${output}/stage-${progress}.png` });
    }
    await page.getByRole('button', { name: 'Animasyonu Test Et', exact: true }).waitFor();
    assert.notEqual(report.stages[0].camera,report.stages[1].camera,'real approach');
    assert.equal(report.stages[1].camera,report.stages.at(-1).camera,'near shot retained after closure');
    for (const progress of [75, 50, 25, 0]) {
      await page.evaluate(value => {
        const root = document.querySelector('.story');
        scrollTo({ top: root.getBoundingClientRect().top + scrollY + (root.offsetHeight - innerHeight) * value / 100, behavior: 'instant' });
      }, progress);
      await page.waitForFunction(value => Math.abs(Number(document.querySelector('.story').dataset.progress) * 100 - value) < 0.15, progress);
      await page.waitForTimeout(250);
      assert.equal(await page.locator('.story canvas').getAttribute('data-camera'), report.stages.find(stage => Math.abs(stage.progress - progress) < .15).camera);
    }
    report.checks.push('real button: five test stages, dolly/cutaway/focus, close-up closure, pin and reverse playback');
    await page.getByRole('button', { name: 'Animasyonu Test Et', exact: true }).click();
    await page.getByRole('button', { name: 'Testi Durdur', exact: true }).click();
    assert.match(await page.locator('.debug-message').innerText(), /durduruldu/);
    report.checks.push('test cancellation');
    const reduced = await browser.newPage({ reducedMotion: 'reduce' });
    await reduced.goto(`${base}/?debug=1`, { waitUntil: 'networkidle' });
    await reduced.waitForFunction(() => document.querySelector('[data-debug="reduced"]')?.textContent === 'On');
    assert.equal(await reduced.locator('canvas').count(), 0);
    assert.equal(await reduced.locator('.pin-spacer').count(), 0);
    assert.equal(await reduced.getByRole('button', { name: 'Animasyonu Test Et' }).isDisabled(), true);
    assert.match(await reduced.locator('[data-debug="trigger"]').innerText(), /^Inactive/);
    await reduced.screenshot({ path: `${output}/reduced-motion.png` });
    await reduced.close();
    report.checks.push('reduced motion: accurate status, no pin/canvas, test disabled');

    const failureBrowser = await chromium.launch({ channel: 'chrome', headless: true });
    const failed = await failureBrowser.newPage({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });
    await failed.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        return type === 'webgl' || type === 'webgl2' ? null : original.call(this, type, ...args);
      };
    });
    await failed.goto(`${base}/?debug=1`, { waitUntil: 'networkidle' });
    await failed.waitForTimeout(1500);
    await failed.waitForFunction(() => document.querySelector('[data-debug="webgl"]')?.textContent === 'Failed').catch(async error => {
      report.failedState = await failed.evaluate(() => ({ panel: document.querySelector('.scene-debug')?.innerText, renderer: document.querySelector('.story')?.dataset.renderer, visibility: document.visibilityState }));
      await failed.screenshot({ path: `${output}/failed-state.png` });
      throw error;
    });
    assert.equal(await failed.locator('.core-fallback').count(), 1);
    assert.match(await failed.locator('[data-debug="errors"]').innerText(), /Error creating WebGL context/);
    await failed.screenshot({ path: `${output}/webgl-failed.png` });
    await failed.close();
    await failureBrowser.close();
    report.checks.push('WebGL denied: real failure and startup error, visible real-scene poster fallback');
    await page.evaluate(() => dispatchEvent(new ErrorEvent('error', { message: 'QA diagnostic JavaScript error' })));
    await page.waitForFunction(() => document.querySelector('[data-debug="errors"]').textContent.includes('QA diagnostic JavaScript error'));
    report.checks.push('actual window error event displayed');
    await page.evaluate(() => document.querySelector('.story canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
    await page.waitForFunction(() => document.querySelector('[data-debug="webgl"]').textContent === 'Failed');
    assert.match(await page.locator('[data-debug="errors"]').innerText(), /context kaybedildi/);
    report.checks.push('context loss: actual event captured and fallback displayed');
    assert.ok(report.sockets.some(socket => socket.frames > 0 && socket.errors.length === 0), 'live HMR socket');
  }
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) {
  report.error = error.stack;
  process.exitCode = 1;
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {});
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
