import { measurementUrl } from './measurement-url.mjs';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const output = 'artifacts/final/recording';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference',
  recordVideo: { dir: output, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(measurementUrl(base), { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas[data-camera]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${output}/hero.png` });
  await page.evaluate(async () => {
    const root = document.querySelector('.story');
    const start = root.getBoundingClientRect().top + scrollY;
    const distance = root.offsetHeight - innerHeight;
    const move = (from, to) => new Promise(resolve => {
      const begin = performance.now();
      const frame = now => {
        const t = Math.min(1, (now - begin) / 9000);
        scrollTo({ top: start + distance * (from + (to - from) * t), behavior: 'instant' });
        if (t < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    await move(0, 1);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await move(1, 0);
  });
  await page.waitForTimeout(1500);
  assert.deepEqual(errors, []);
  const video = page.video();
  await context.close();
  await video.saveAs(`${output}/c2c-scroll.webm`);
  const stills = await browser.newPage({ reducedMotion: 'no-preference' });
  for (const width of [375, 1440]) {
    await stills.setViewportSize({ width, height: 900 });
    await stills.goto(measurementUrl(base), { waitUntil: 'networkidle' });
    await stills.waitForSelector('canvas[data-camera]');
    await stills.screenshot({ path: `${output}/${width}-hero.png` });
    for (const [name, selector] of Object.entries({ solutions: '.solutions-section', applications: '.usecases', approach: '.technical', team: '.team-section' })) {
      await stills.locator(selector).screenshot({
        path: `${output}/${width}-${name}.png`,
        // Chromium's expanded section capture can paint a translated, offscreen
        // fixed skip link inside the image. Keep genuinely focused links visible.
        style: '.skip-link:not(:focus){visibility:hidden!important}',
      });
    }
  }
  await stills.close();
  console.log(`Recorded real forward/reverse scroll at ${base}: ${output}/c2c-scroll.webm`);
} finally {
  await browser.close();
}
