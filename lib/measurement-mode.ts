// Read the live query so pushState, replaceState and back/forward are respected.
// Cache parsing across scenes and frames; no subscriptions or render-state changes.
let cachedSearch: string | undefined;
let enabled = false;

export function isMeasurementMode(): boolean {
  if (typeof window === 'undefined') return false;
  const search = window.location.search;
  if (search !== cachedSearch) {
    cachedSearch = search;
    enabled = new URLSearchParams(search).get('measure') === '1';
  }
  return enabled;
}
