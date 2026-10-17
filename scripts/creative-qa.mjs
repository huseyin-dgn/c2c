import { measurementUrl } from './measurement-url.mjs';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const output = process.env.TEST_ARTIFACT_DIR || 'artifacts/interactive/editorial';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ reducedMotion: 'no-preference' });
const report = { base, browser: browser.version(), errors: [], widths: [], checks: [], passed: false };
page.on('pageerror', error => report.errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
try {
  for (const width of [375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 800 ? 900 : 1000 });
    await page.goto(measurementUrl(base), { waitUntil: 'networkidle' });
    if(width<1024){await page.waitForFunction(()=>document.querySelector('.story')?.dataset.renderer==='poster');await page.evaluate(()=>scrollTo(0,12));}
    await page.waitForSelector('canvas[data-model="motherboard-processor"]');
    const sections = await page.locator('[data-motion-region]').evaluateAll(elements => elements.map(element => element.dataset.motionRegion));
    assert.deepEqual(sections, ['about']);
    assert.equal(await page.locator('.project-card').count(), 0, 'no portfolio grid on homepage');
    const result = { width, regions: [] };
    for (const key of sections) {
      const selector = `[data-motion-region="${key}"]`;
      const samples = [];
      for (const progress of [0, 0.5, 1]) {
        report.current = { width, key, progress };
        await page.evaluate(({ selector, progress }) => {
          const root = document.querySelector(selector);
          const top = root.getBoundingClientRect().top + scrollY;
          scrollTo({ top: top - innerHeight * (.85 - .73 * progress), behavior: 'instant' });
        }, { selector, progress });
        await page.waitForFunction(({ selector, progress }) => Math.abs(Number(document.querySelector(selector)?.dataset.motionProgress) - progress) < 0.015, { selector, progress });
        samples.push(await page.locator(selector).evaluate(root => {
          const visual = root.querySelector('[data-motion="visual"]');
          const path = root.querySelector('[data-draw]');
          const heading = root.querySelector('[data-motion="heading"]');
          return {
            progress: Number(root.dataset.motionProgress),
            headingTransform: heading ? getComputedStyle(heading).transform : null,
            visualClip: visual ? getComputedStyle(visual).clipPath : null,
            drawn: path ? Number.parseFloat(getComputedStyle(path).strokeDashoffset) : null,
            overflow: document.documentElement.scrollWidth - innerWidth,
          };
        }));
      }
      assert.ok(samples.every(sample => sample.overflow <= 1), `${key} ${width}: no horizontal overflow`);
      assert.notEqual(samples[0].visualClip, samples[2].visualClip, `${key}: real wipe reveal`);
      if (samples[0].headingTransform) assert.notEqual(samples[0].headingTransform, samples[2].headingTransform);
      if (samples[0].drawn !== null) assert.ok(samples[0].drawn > samples[2].drawn + 1, `${key}: diagram path is actually drawn`);
      const hiddenCopy = await page.locator(selector).evaluate(root => [...root.querySelectorAll('[data-motion="copy"]')].filter(element => Number(getComputedStyle(element).opacity) < .99).length);
      assert.equal(hiddenCopy, 0, `${key}: all copy is readable after the reveal`);
      await page.locator(selector).screenshot({ path: `${output}/${width}-${key}.png`, style: '.skip-link:not(:focus){visibility:hidden!important}' });
      // Long element screenshots temporarily enlarge the viewport. Let GSAP's
      // debounced resize refresh finish after Playwright restores its size.
      await page.waitForTimeout(450);
      result.regions.push({ key, samples });
    }
    report.widths.push(result);
  }
  await page.goto(measurementUrl(`${base}/projeler`), { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.capability-spread').count(), 3);
  assert.equal(await page.locator('.project-card').count(), 0);
  assert.match(await page.locator('.development-note').innerText(), /müşteri projeleri.*değildir/);
  await page.getByRole('link', { name: 'Bu ihtiyacı konuşalım' }).first().click();
  await page.waitForURL('**/iletisim?alan=goruntu-isleme');
  assert.equal(await page.locator('#area').inputValue(), 'goruntu-isleme');
  report.checks.push('solution areas replace portfolio; CTA preselects the real contact field');
  await page.goto(measurementUrl(base), { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas[data-camera]');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => [...document.querySelectorAll('[data-motion-region]')].every(region => region.dataset.motionState === 'reduced'));
  assert.equal(await page.locator('canvas,.pin-spacer').count(), 0);
  assert.equal(await page.locator('[data-motion="copy"]').evaluateAll(elements => elements.filter(element => getComputedStyle(element).visibility === 'hidden' || Number(getComputedStyle(element).opacity) < 1).length), 0);
  await page.locator('.about-editorial').screenshot({ path: `${output}/reduced-motion.png`, style: '.skip-link:not(:focus){visibility:hidden!important}' });
  report.checks.push('runtime reduced-motion change: all copy visible, all motion reverted, no canvas/pin');
  const nojs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  await nojs.goto(measurementUrl(base));
  assert.equal(await nojs.locator('.core-fallback').count(), 1);
  assert.equal(await nojs.locator('.solution-film').count(), 5);
  assert.ok(await nojs.locator('.solution-film h3').first().isVisible());
  assert.equal(await nojs.locator('.about-editorial').evaluate(element => getComputedStyle(element).visibility), 'visible');
  await nojs.close();
  report.checks.push('JavaScript disabled: engineering fallback and server-rendered solution content visible');
  assert.deepEqual(report.errors, []);
  report.passed = true;
  delete report.current;
} catch (error) {
  report.error = error.stack;
  report.state = await page.evaluate(() => [...document.querySelectorAll('[data-motion-region]')].map(region => ({ key: region.dataset.motionRegion, progress: region.dataset.motionProgress, top: region.getBoundingClientRect().top, height: innerHeight })));
  process.exitCode = 1;
  await page.screenshot({ path: `${output}/failure.png` }).catch(() => {});
} finally {
  await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, widths: report.widths.length, checks: report.checks, errors: report.errors, error: report.error }, null, 2));
  await browser.close();
}
