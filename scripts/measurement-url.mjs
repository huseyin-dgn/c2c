/* global window */
// Preserve existing query parameters and hashes when opting QA into telemetry.
export function measurementUrl(value) {
  const url = new URL(value);
  url.searchParams.set('measure', '1');
  return url.href;
}

// The logo deliberately clears queries. Keep QA's opt-in across client routes
// without changing production links or replacing navigation with a page reload.
export async function preserveMeasurementNavigation(page) {
  await page.addInitScript(() => {
    for (const method of ['pushState', 'replaceState']) {
      const original = window.history[method];
      window.history[method] = function (state, unused, value) {
        if (value != null) {
          const url = new URL(value, window.location.href);
          url.searchParams.set('measure', '1');
          value = url.href;
        }
        return original.call(this, state, unused, value);
      };
    }
  });
}
