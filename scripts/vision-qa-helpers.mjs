/* global window, document, getComputedStyle */

export async function focusVision(page) {
  await page.locator('#kamera-deneyimi').evaluate(e => window.scrollTo({
    top: e.getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant',
  }));
  await page.waitForFunction(() => {
    const section = document.querySelector('#kamera-deneyimi');
    const canvas = section?.querySelector('canvas[data-vision-frame]');
    if (!canvas) return false;
    const root = section.getBoundingClientRect(), scene = canvas.getBoundingClientRect();
    return Math.abs(root.top - 120) < 2 && scene.bottom > 0 && scene.top < window.innerHeight &&
      getComputedStyle(canvas).visibility === 'visible';
  });
}

export async function resizeVisionViewport(page, viewport) {
  if (viewport.width !== page.viewportSize().width) throw new Error('Vision capture must preserve viewport width');
  await page.setViewportSize(viewport);
  await page.waitForFunction(async viewport => {
    if (window.innerWidth !== viewport.width || window.innerHeight !== viewport.height) return false;
    await document.fonts.ready;
    return new Promise(resolve => {
      let last = '', stableSince = performance.now();
      const sample = now => {
        const root = document.querySelector('#kamera-deneyimi').getBoundingClientRect();
        const pins = [...document.querySelectorAll('.pin-spacer')].map(e => [e.offsetHeight, e.style.cssText]);
        const layout = JSON.stringify([root.top + window.scrollY, root.height, window.scrollY, pins]);
        if (layout !== last) { last = layout; stableSince = now; }
        // Installed GSAP debounces resize by 200 ms. Require 300 ms of stable
        // geometry, also allowing its intentional mobile resize suppression.
        if (now - stableSince >= 300) resolve(true);
        else window.requestAnimationFrame(sample);
      };
      window.requestAnimationFrame(sample);
    });
  }, viewport);
  await focusVision(page);
}
