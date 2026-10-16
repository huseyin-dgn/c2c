import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const output = 'artifacts/creative/recording';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference', recordVideo: { dir: output, size: { width: 1440, height: 900 } } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas[data-model="industrial-modular-assembly"]');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(700);
  await page.evaluate(async () => {
    const move = (to, duration) => new Promise(resolve => {
      const from = scrollY, start = performance.now();
      const frame = now => {
        const p = Math.min(1, (now - start) / duration);
        const eased = p * p * (3 - 2 * p);
        scrollTo({ top: from + (to - from) * eased, behavior: 'instant' });
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    const pause = duration => new Promise(resolve => setTimeout(resolve, duration));
    const absoluteTop = selector => document.querySelector(selector).getBoundingClientRect().top + scrollY;
    const story = document.querySelector('.story');
    await move(story.offsetHeight - innerHeight, 8000);
    await pause(700);
    await move(absoluteTop('.about-editorial') + 80, 4000);
    await move(absoluteTop('.capability-vision') + 80, 3800);
    await move(absoluteTop('.capability-industrial') + 80, 3800);
    await move(absoluteTop('.capability-software') + 80, 3800);
    await pause(1000);
  });
  assert.deepEqual(errors, []);
  const video = page.video();
  await context.close();
  await video.saveAs(`${output}/c2c-creative-scroll.webm`);
  await video.delete();
  console.log(`Saved real hero/about/solution motion recording at ${base}: ${output}/c2c-creative-scroll.webm`);
} finally {
  await browser.close();
}
