import { measurementUrl, preserveMeasurementNavigation } from './measurement-url.mjs';
/* global window, document, MutationObserver, getComputedStyle, requestAnimationFrame, scrollTo, scrollY */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://localhost:3100';
const output = process.env.TEST_ARTIFACT_DIR || path.join(os.tmpdir(), 'c2c-general-performance');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = process.env.AUDIT_RESUME === '1' ? JSON.parse(await fs.readFile(path.join(output, 'audit.json'), 'utf8')) :
  { environment: 'Production; Chromium headless; no CPU/network throttling; one sample per scenario', home: [], pages: [], errors: [] };
async function initialize(page) {
  await preserveMeasurementNavigation(page);
  page.on('pageerror', error => report.errors.push(error.message));
  await page.addInitScript(() => {
    const data = window.__audit = { lcp: null, shifts: [], tasks: [], pin: null, ready: null, intent: null };
    new PerformanceObserver(list => { for (const e of list.getEntries()) data.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) data.shifts.push({ at: e.startTime, value: e.value }); }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) data.tasks.push({ at: e.startTime, ms: e.duration }); }).observe({ type: 'longtask', buffered: true });
    new MutationObserver(() => {
      if (data.pin === null && document.querySelector('.story .pin-spacer')) data.pin = performance.now();
      const c = document.querySelector('.story canvas');
      if (data.ready === null && c?.dataset.sceneReady === 'true' && getComputedStyle(c).visibility === 'visible') data.ready = performance.now();
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-scene-ready', 'style'] });
  });
}
async function metrics(page) {
  return page.evaluate(() => {
    const a = window.__audit;
    let cls = 0, sum = 0, first = 0, last = 0;
    for (const shift of a.shifts) {
      if (shift.at - last > 1000 || shift.at - first > 5000) { sum = 0; first = shift.at; }
      sum += shift.value; cls = Math.max(cls, sum); last = shift.at;
    }
    const c = document.querySelector('.story canvas');
    const gl = c?.getContext('webgl2'), ext = gl?.getExtension('WEBGL_debug_renderer_info');
    return { ...a, cls, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
      longTaskTotal: a.tasks.reduce((sum, t) => sum + t.ms, 0), maxTask: Math.max(0, ...a.tasks.map(t => t.ms)),
      prepareMs: c?.dataset.prepareMs ?? null, gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null,
      transferKiB: performance.getEntriesByType('resource').reduce((sum, r) => sum + r.transferSize, 0) / 1024,
      navigation: performance.getEntriesByType('navigation')[0]?.toJSON(), at: performance.now() };
  });
}
const frames = page => page.evaluate(() => [...document.querySelectorAll('canvas')].filter(c => c.dataset.frames || c.dataset.hardwareFrame || c.dataset.visionFrame).map(c => {
  const r = c.getBoundingClientRect();
  return { scene: c.closest('.story') ? 'hero' : c.closest('#donanim') ? 'hardware' : 'industrial',
    frame: Number(c.dataset.frames || c.dataset.hardwareFrame || c.dataset.visionFrame),
    visible: r.bottom > 0 && r.top < window.innerHeight && getComputedStyle(c).visibility === 'visible' };
}));
const focus = (page, selector) => page.locator(selector).evaluate(e => scrollTo({ top: e.getBoundingClientRect().top + scrollY - 150, behavior: 'instant' }));
const ready = page => page.waitForFunction(() => window.__audit.ready !== null, null, { timeout: 30000 });
const settle = page => page.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
try {
  for (const width of [1440, 393]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width === 393 });
    const p = await context.newPage(); await initialize(p);
    for (const mode of ['first', 'reload']) {
      if (report.home.some(row => row.width === width && row.mode === mode)) continue;
      if (mode === 'first') await p.goto(measurementUrl(base), { waitUntil: 'domcontentloaded' }); else await p.reload({ waitUntil: 'domcontentloaded' });
      await p.waitForSelector('.story .pin-spacer');
      // A mobile user starts touching the Hero; GPU readiness remains mandatory.
      if (width === 393) await p.locator('.story').dispatchEvent('pointerdown', { pointerType: 'touch' });
      if (width === 393) await p.evaluate(() => { window.__audit.intent = performance.now(); scrollTo({ top: 120, behavior: 'instant' }); });
      await ready(p);
      const initial = await metrics(p);
      const animation = await p.evaluate(async () => {
        const deltas = []; let last = performance.now();
        for (let i = 0; i < 24; i++) { await new Promise(requestAnimationFrame); const now = performance.now(); deltas.push(now - last); last = now; scrollTo({ top: 150 + i * 65, behavior: 'instant' }); }
        return { deltas, progress: Number(document.querySelector('.story').dataset.progress), at: performance.now() };
      });
      await p.waitForFunction(() => Number(document.querySelector('.story canvas').dataset.assemblyProgress) > .3);
      const afterScroll = await metrics(p);
      await p.locator('header .brand').click();
      await p.waitForFunction(() => scrollY === 0 && Number(document.querySelector('.story canvas').dataset.assemblyProgress) < .001);
      const row = { width, mode, initial, animation, scrollTasks: afterScroll.tasks.filter(t => t.at >= initial.at), logo: true };
      report.home.push(row);
      console.log(JSON.stringify({ width, mode, lcp: initial.lcp, cls: initial.cls, ready: initial.ready, prepare: initial.prepareMs, scrollMax: Math.max(...animation.deltas), logo: true }));
    }
    const row = report.home.filter(row => row.width === width).at(-1);
    if (p.url() === 'about:blank') await p.goto(measurementUrl(base), { waitUntil: 'networkidle' });
    const hardwareStart = await p.evaluate(() => performance.now());
    await focus(p, '.hardware-viewport');
    await p.waitForFunction(() => document.querySelector('.hardware-viewport canvas')?.dataset.sceneReady === 'true', null, { timeout: 30000 });
    row.hardwareReadyMs = await p.evaluate(start => performance.now() - start, hardwareStart);
    await p.locator('[data-hardware-button=gpu]').click();
    assert.equal(await p.locator('#donanim').getAttribute('data-hardware-selected'), 'gpu');
    await p.locator('.hardware-controls button').first().click();
    await p.waitForFunction(() => Number(document.querySelector('.hardware-viewport canvas').dataset.explosion) > .99);
    await p.locator('.hardware-controls button').nth(1).click();
    await focus(p, '#problemden-cozume');
    await p.locator('.safety-scene image[href]').first().waitFor({ state: 'attached' });
    row.camera = { visible: await p.locator('.safety-scene').isVisible(), webgl: false };
    await p.locator('.pipeline-navigation button').nth(3).click();
    await p.waitForFunction(() => document.querySelector('.safety-scene')?.dataset.safetyAlert === 'true', null, { timeout: 5000 });
    await focus(p, '#vision-station');
    await p.waitForFunction(() => document.querySelector('#vision-station canvas')?.dataset.visionFrame);
    await p.locator('.vision-start').click();
    await p.waitForFunction(() => Number(document.querySelector('#vision-station canvas').dataset.visionTime) > .2);
    row.scenesBefore = await frames(p);
    await p.waitForTimeout(250);
    row.scenesAfter = await frames(p);
    await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await settle(p); await p.waitForTimeout(800);
    row.hiddenBefore = await frames(p); await p.waitForTimeout(250); row.hiddenAfter = await frames(p);
    await p.locator('.header-cta').click(); await p.waitForURL(measurementUrl(base + '/iletisim'));
    assert.ok(Math.abs(await p.evaluate(() => scrollY)) < 2);
    await p.locator('header .brand').click(); await p.waitForURL(measurementUrl(base + '/'));
    await p.waitForFunction(() => scrollY === 0 && Number(document.querySelector('.story').dataset.progress) < .001);
    row.navigation = true;
    console.log('scene interactions and navigation PASS', width);
    await context.close();
    for (const route of ['/hakkimizda', '/projeler', '/urunlerimiz', '/cozumler', '/yaklasim', '/iletisim', '/kvkk']) {
      const page = await browser.newPage({ viewport: { width, height: 900 } }); await initialize(page);
      const response = await page.goto(measurementUrl(base + route), { waitUntil: 'networkidle' }); await settle(page);
      report.pages.push({ width, route, status: response.status(), ...(await metrics(page)) });
      await page.close();
    }
    console.log('first visits to 7 pages complete', width);
  }
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'audit.json'), JSON.stringify(report, null, 2));
}
console.log('Saved', path.join(output, 'audit.json'));
