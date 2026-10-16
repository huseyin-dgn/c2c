import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const output = path.resolve(process.env.TEST_ARTIFACT_DIR || 'artifacts/final/visual');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHROME_PATH ? undefined : 'chrome',
  executablePath: process.env.PLAYWRIGHT_CHROME_PATH || undefined,
});
const report = {
  base,
  generated: new Date().toISOString(),
  browser: browser.version(),
  viewports: [],
  interactions: [],
  consoleErrors: [],
  performance: {},
  passed: false,
};
const context = await browser.newContext({ reducedMotion: 'no-preference' });
const page = await context.newPage();
page.on('pageerror', (error) => report.consoleErrors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') report.consoleErrors.push(message.text());
});
async function ready() {
  await page.waitForFunction(
    () => document.querySelector('.story')?.dataset.renderer === 'webgl',
    {},
    { timeout: 30000 },
  );
  await page.waitForSelector('canvas[data-camera]');
  await page.evaluate(() => document.fonts.ready);
}
async function seek(progress) {
  await page.evaluate((value) => {
    const root = document.querySelector('.story');
    const start = root.getBoundingClientRect().top + scrollY;
    window.scrollTo({
      top: start + (root.offsetHeight - innerHeight) * value,
      behavior: 'instant',
    });
  }, progress);
  await page.waitForFunction(
    (value) => Math.abs(Number(document.querySelector('.story')?.dataset.progress) - value) < 0.002,
    progress,
  );
  await page.waitForTimeout(180);
}
async function difference(a, b) {
  const first = await sharp(a).removeAlpha().raw().toBuffer();
  const second = await sharp(b).removeAlpha().raw().toBuffer();
  let different = 0;
  for (let i = 0; i < first.length; i += 3) {
    if (
      Math.abs(first[i] - second[i]) +
        Math.abs(first[i + 1] - second[i + 1]) +
        Math.abs(first[i + 2] - second[i + 2]) >
      45
    )
      different++;
  }
  return different / (first.length / 3);
}
try {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(base, { waitUntil: 'networkidle' });
    await ready();
    await page.getByRole('button', { name: 'Veri akışını duraklat' }).click();
    await page.mouse.move(0, 0);
    const result = { ...viewport, stages: [], reverse: [], differences: [] };
    const images = [];
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      await seek(progress);
      const state = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        return {
          progress: Number(document.querySelector('.story').dataset.progress),
          renderer: document.querySelector('.story').dataset.renderer,
          pinTop: document.querySelector('.story-stage').getBoundingClientRect().top,
          overflow: document.documentElement.scrollWidth - innerWidth,
          camera: canvas.dataset.camera,
          separation: Number(canvas.dataset.separation),
          integration: Number(canvas.dataset.integration),
          drawCalls: Number(canvas.dataset.drawCalls),
          triangles: Number(canvas.dataset.triangles),
          activeText: [...document.querySelectorAll('.story-chapter')]
            .filter((el) => el.getAttribute('aria-hidden') === 'false')
            .map((el) => el.querySelector('h1,h2')?.innerText)
            .join(' '),
        };
      });
      assert.ok(Math.abs(state.pinTop) < 2, 'scene remains pinned');
      assert.ok(state.overflow <= 1, `${viewport.width}: no horizontal overflow`);
      assert.equal(state.renderer, 'webgl');
      const file = path.join(output, `${viewport.width}-stage-${progress * 100}.png`);
      images.push(await page.screenshot({ path: file }));
      result.stages.push(state);
    }
    assert.equal(result.stages[2].separation, 1);
    assert.equal(result.stages[4].integration, 1);
    for (let i = 1; i < images.length; i++) {
      const delta = await difference(images[i - 1], images[i]);
      assert.ok(delta > 0.015, `stage ${i}: visible pixel difference`);
      result.differences.push(delta);
    }
    for (const progress of [0.75, 0.5, 0.25, 0]) {
      await seek(progress);
      const state = await page.locator('canvas').evaluate((canvas) => ({
        camera: canvas.dataset.camera,
        separation: Number(canvas.dataset.separation),
        integration: Number(canvas.dataset.integration),
      }));
      const forward = result.stages.find((stage) => Math.abs(stage.progress - progress) < 0.002);
      assert.equal(state.camera, forward.camera);
      assert.equal(state.separation, forward.separation);
      assert.equal(state.integration, forward.integration);
      result.reverse.push({ progress, ...state });
    }
    const reverseImage = await page.screenshot({
      path: path.join(output, `${viewport.width}-reverse-0.png`),
    });
    result.reversePixelDifference = await difference(images[0], reverseImage);
    assert.ok(result.reversePixelDifference < 0.015, 'reverse restores opening composition');
    // Full-page captures release the pin first, preserving its ordinary document space.
    await page.screenshot({
      path: path.join(output, `${viewport.width}-full-page.png`),
      fullPage: true,
    });
    report.viewports.push(result);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base);
  await ready();
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  assert.equal(
    await page.getByRole('button', { name: 'Menüyü kapat' }).getAttribute('aria-expanded'),
    'true',
  );
  await page.keyboard.press('Escape');
  assert.equal(
    await page.getByRole('button', { name: 'Menüyü aç' }).getAttribute('aria-expanded'),
    'false',
  );
  report.interactions.push('mobile menu and Escape');
  await page.goto(`${base}/yaklasim`, { waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: /01 İhtiyaç analizi/ }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(
    await page.getByRole('tab', { name: /02 Çözüm tasarımı/ }).getAttribute('aria-selected'),
    'true',
  );
  report.interactions.push('timeline keyboard controls');
  for (const width of [375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/cozumler',
      '/projeler',
      '/projeler/motionfighter',
      '/projeler/hyso',
      '/projeler/co2-emission',
      '/yaklasim',
      '/hakkimizda',
      '/iletisim',
      '/kvkk',
    ]) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${route} at ${width}: overflow`,
      );
      if (width === 375 || width === 1440)
        await page.screenshot({
          path: path.join(output, `${width}-${route.slice(1).replaceAll('/', '-')}.png`),
        });
      if ((width === 375 || width === 1440) && route === '/iletisim')
        await page
          .locator('.contact-form-wrap')
          .screenshot({ path: path.join(output, `${width}-iletisim-form.png`),style:'.skip-link:not(:focus){visibility:hidden!important}' });
    }
  }
  await page.goto(`${base}/iletisim?alan=otomasyon`);
  assert.equal(await page.locator('#area').inputValue(), 'otomasyon');
  assert.ok(await page.getByRole('button', { name: 'Proje Talebini Gönder' }).isDisabled());
  report.interactions.push('query-selected solution and disabled delivery');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base);
  await ready();
  await seek(0.5);
  report.performance = await page.evaluate(async () => {
    const intervals = [];
    const canvas = document.querySelector('canvas');
    const firstRenderedFrame = Number(canvas.dataset.frames);
    let last = performance.now();
    await new Promise((resolve) => {
      const start = last;
      function frame(now) {
        intervals.push(now - last);
        last = now;
        if (now - start < 3000) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    const gl = document.querySelector('canvas').getContext('webgl2'),
      debug = gl?.getExtension('WEBGL_debug_renderer_info');
    return {
      sampleMilliseconds: 3000,
      averageRafFps: 1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length),
      averageWebglFps: (Number(canvas.dataset.frames) - firstRenderedFrame) / 3,
      slowFrames: intervals.filter((v) => v > 34).length,
      renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'not disclosed',
      note: 'Headless desktop laboratory sample, not a physical mobile FPS claim.',
    };
  });
  await page.getByRole('button', { name: 'Veri akışını duraklat' }).click();
  const camera = await page.locator('canvas').getAttribute('data-camera');
  await page.waitForTimeout(600);
  assert.equal(await page.locator('canvas').getAttribute('data-camera'), camera);
  report.interactions.push('scroll pose stays fixed while idle');
  await page.getByRole('link', { name: 'Projenizi Anlatın', exact: true }).first().click();
  await page.waitForURL('**/iletisim');
  assert.equal(await page.locator('.pin-spacer').count(), 0);
  await page.goBack();
  await ready();
  assert.equal(await page.locator('.pin-spacer').count(), 1);
  report.interactions.push('navigation cleanup and return: exactly one pin');
  const reducedPage = await browser.newPage({
    viewport: { width: 375, height: 812 },
    reducedMotion: 'reduce',
  });
  await reducedPage.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await reducedPage.locator('canvas').count(), 0);
  assert.equal(await reducedPage.locator('.pin-spacer').count(), 0);
  assert.equal(await reducedPage.locator('.reduced-narrative article').count(), 3);
  await reducedPage.screenshot({
    path: path.join(output, '375-reduced-motion.png'),
    fullPage: true,
  });
  await reducedPage.close();
  report.interactions.push('reduced motion: no canvas or pin, all chapters available');
  const fallbackPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
  });
  await fallbackPage.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl' || type === 'webgl2' ? null : original.call(this, type, ...args);
    };
  });
  await fallbackPage.goto(base, { waitUntil: 'networkidle' });
  await fallbackPage.waitForFunction(
    () => document.querySelector('.story')?.dataset.renderer === 'fallback',
  );
  assert.equal(await fallbackPage.locator('.scene-shell > .core-fallback').count(), 1);
  await fallbackPage.screenshot({ path: path.join(output, '1440-webgl-fallback.png') });
  await fallbackPage.close();
  report.interactions.push('forced WebGL failure: visible static fallback');
  assert.deepEqual(report.consoleErrors, [], 'production console has no application errors');
  report.passed = true;
} catch (error) {
  report.error = { message: error.message, stack: error.stack };
  report.failureState = await page.evaluate(() => ({
    url: location.href, ready: document.readyState, renderer: document.querySelector('.story')?.dataset.renderer,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, pins: document.querySelectorAll('.pin-spacer').length,
    canvases: document.querySelectorAll('canvas').length, scripts: [...document.scripts].map(script => script.src).filter(Boolean),
  })).catch(() => null);
  await page.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
  process.exitCode = 1;
} finally {
  await fs.writeFile(path.join(output, 'browser-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        viewports: report.viewports.length,
        interactions: report.interactions,
        performance: report.performance,
        error: report.error?.message,
      },
      null,
      2,
    ),
  );
}
