/* global window, document, location, history, scrollY, scrollTo, requestAnimationFrame, getComputedStyle */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const base = process.env.TEST_BASE_URL || 'http://localhost:3100';
const output = process.env.TEST_ARTIFACT_DIR || path.join(os.tmpdir(), 'c2c-navigation-qa');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { checks: [], errors: [] };
const routes = process.env.BASIC_QA === '1' ? ['/hakkimizda', '/projeler'] : ['/hakkimizda', '/projeler', '/urunlerimiz', '/cozumler', '/yaklasim', '/iletisim'];
const y = page => page.evaluate(() => scrollY);
const at = async (page, top) => {
  try { await page.waitForFunction(top => Math.abs(scrollY - top) < 2, top, { timeout: 10000 }); }
  catch (error) {
    console.log('scroll mismatch', page.url(), { expected: top, actual: await y(page) });
    console.log(await page.evaluate(() => window.__navigationTrace));
    throw error;
  }
};
async function scroll(page, top) {
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), top);
  await at(page, top);
}
async function layoutSettled(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function menu(page, route, width) {
  if (width < 1024) {
    await page.locator('.menu-toggle').click();
    await page.locator(`#mobile-menu a[href="${route}"]`).click();
  } else await page.locator(`.desktop-nav a[href="${route}"], .header-cta[href="${route}"]`).click();
  await page.waitForURL(base + route);
  await layoutSettled(page);
  await at(page, 0);
}
async function homeStart(page) {
  await at(page, 0);
  await page.waitForFunction(() => Number(document.querySelector('.story')?.dataset.progress) < .0001);
  assert.equal(await page.locator('.hero-copy').getAttribute('aria-hidden'), 'false');
}
try {
  for (const width of (process.env.TEST_WIDTHS || '1440,393,320').split(',').map(Number)) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 1024 });
    page.on('pageerror', error => report.errors.push(error.message));
    if (process.env.TEST_TRACE === '1') await page.addInitScript(() => {
      const trace = window.__navigationTrace = [];
      const record = value => { trace.push([Math.round(performance.now()), value, scrollY]); if (trace.length > 50) trace.shift(); };
      const original = window.scrollTo;
      window.scrollTo = function (...args) { record(['scrollTo', args]); return original.apply(this, args); };
      for (const type of ['DOMContentLoaded', 'load', 'pageshow', 'wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll']) {
        window.addEventListener(type, () => record(type), { passive: true });
      }
      let finish;
      Object.defineProperty(window, '__c2cFinishInitialScroll', { configurable: true,
        get: () => finish,
        set: callback => { finish = () => { const result = callback(); record(['finishInitial', result]); return result; }; },
      });
    });
    try {
      await page.goto(base, { waitUntil: 'networkidle' });
      await homeStart(page);
      await scroll(page, 1600);
      await page.waitForFunction(() => Number(document.querySelector('.story')?.dataset.progress) > .2);
      await page.waitForFunction(() => document.querySelector('.story canvas')?.dataset.sceneReady === 'true');
      await page.locator('.story canvas').evaluate(canvas => { window.__navigationCanvas = canvas; });
      await page.locator('header .brand').click();
      await homeStart(page);
      assert.equal(await page.locator('.story canvas').evaluate(canvas => canvas === window.__navigationCanvas), true);
      await scroll(page, 450);
      await layoutSettled(page);
      assert.equal(await y(page), 450, 'normal user scroll must remain untouched');

      for (const route of routes) {
        await scroll(page, 600);
        await menu(page, route, width);
        await scroll(page, 600);
        await page.reload({ waitUntil: 'networkidle' });
        await layoutSettled(page);
        await at(page, 0);
        console.log('route and reload', width, route);
      }
      await page.locator('header .brand').click();
      await page.waitForURL(base + '/');
      await homeStart(page);
      await scroll(page, 1800);
      await page.reload({ waitUntil: 'networkidle' });
      await homeStart(page);

      await menu(page, '/hakkimizda', width);
      await scroll(page, 700);
      await menu(page, '/projeler', width);
      await scroll(page, 900);
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForURL(base + '/hakkimizda');
      await at(page, 700);
      await page.goForward({ waitUntil: 'networkidle' });
      await page.waitForURL(base + '/projeler');
      await at(page, 900);

      await page.locator('header .brand').click();
      await page.waitForURL(base + '/');
      await homeStart(page);
      await scroll(page, 1200);
      await menu(page, '/hakkimizda', width);
      await scroll(page, 600);
      await page.goBack({ waitUntil: 'networkidle' });
      await page.waitForURL(base + '/');
      await at(page, 1200);
      await page.goForward({ waitUntil: 'networkidle' });
      await page.waitForURL(base + '/hakkimizda');
      await at(page, 600);
      await page.locator('header .brand').click();
      await page.waitForURL(base + '/');
      await homeStart(page);
      // Existing real section link, not a synthetic test-only anchor.
      await page.locator('.scroll-cue').click();
      await page.waitForURL('**/#bizi-taniyin');
      const targetVisible = () => {
        const element = document.getElementById('bizi-taniyin');
        const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + parseFloat(getComputedStyle(element).scrollMarginTop);
        return Math.abs(element.getBoundingClientRect().top - offset) < 3;
      };
      await page.waitForFunction(targetVisible);
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForFunction(targetVisible);
      assert.equal(await page.evaluate(() => location.hash), '#bizi-taniyin');
      await page.locator('header .brand').click();
      await page.waitForURL(base + '/');
      await homeStart(page);
      assert.equal(await page.evaluate(() => history.scrollRestoration), 'auto');
      await page.screenshot({ path: path.join(output, `home-${width}.png`) });
      report.checks.push({ width, menuRoutes: routes.length, reloadRoutes: routes.length + 1, samePageLogo: true, canvasPreserved: true,
        homeReturn: true, historyPositions: [700, 900], sectionLinkAndReload: true, normalScroll: true });
      console.log('PASS', width);
    } finally { await page.close(); }
  }
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'navigation.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
