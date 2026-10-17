export const pageStartEvent = 'c2c:page-start';

/** Explicit navigation only; never called from a scroll/render loop. */
export function scrollToPageStart() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.dispatchEvent(new Event(pageStartEvent));
}
