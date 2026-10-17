'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { scrollToPageStart } from '@/lib/navigation-scroll';
import { requestScrollRefresh } from '@/lib/use-scroll-layout';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function createScrollKey() {
  // Unlike randomUUID, getRandomValues also works on non-secure LAN HTTP.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Run after the page's layout effects (including GSAP pin creation). */
export default function NavigationScroll() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const historyTarget = useRef<{ href: string; top?: number } | null>(null);
  const initialDocument = useRef(true);
  const entryKey = useRef('');
  const positions = useRef(new Map<string, number>());
  const navigating = useRef(false);

  useLayoutEffect(() => {
    const save = () => {
      if (entryKey.current && !navigating.current) positions.current.set(entryKey.current, scrollY);
    };
    const onClick = (event: MouseEvent) => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const destination = new URL(link.href);
      if (destination.origin !== location.origin || destination.pathname === location.pathname) return;
      // Save before GSAP removes pins, not after the outgoing DOM changed.
      save();
      navigating.current = true;
    };
    const onPopState = (event: PopStateEvent) => {
      save();
      if (location.pathname === previousPath.current) return; // Native hash traversal.
      historyTarget.current = { href: location.href, top: positions.current.get(event.state?.c2cScrollKey) };
      navigating.current = true;
    };
    window.addEventListener('scroll', save, { passive: true });
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState, true);
    return () => {
      window.removeEventListener('scroll', save);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState, true);
    };
  }, []);

  useLayoutEffect(() => {
    // GSAP can capture the bootstrap's temporary "manual" setting at register
    // time and reapply it on every refresh. Reset its saved policy as well.
    void requestScrollRefresh().then(() => {
      if (ScrollTrigger.getAll().length) ScrollTrigger.clearScrollMemory('auto');
      history.scrollRestoration = 'auto';
    });
    const target = historyTarget.current;
    const restoringHistory = target?.href === location.href;
    if (!entryKey.current || previousPath.current !== pathname) {
      const key = (restoringHistory || initialDocument.current) && history.state?.c2cScrollKey || createScrollKey();
      history.replaceState({ ...history.state, c2cScrollKey: key }, '');
      entryKey.current = key;
      navigating.current = false;
    }
    // Complete a reload after page layout effects; a pin refresh can otherwise
    // reapply a position captured before DOMContentLoaded reset the document.
    const initial = window as Window & { __c2cFinishInitialScroll?: () => boolean };
    const finishInitialScroll = initial.__c2cFinishInitialScroll;
    delete initial.__c2cFinishInitialScroll;
    if (finishInitialScroll?.() && !location.hash) scrollToPageStart();
    if (initialDocument.current) {
      initialDocument.current = false;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (location.hash && navigation?.type !== 'back_forward') {
        // The native hash jump precedes font loading and the first pin refresh.
        // Complete that one navigation after resources/layout are ready, unless
        // the user has already started interacting or changed the destination.
        const destination = location.href;
        const controller = new AbortController();
        let interrupted = false;
        for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
          window.addEventListener(type, () => { interrupted = true; }, { passive: true, signal: controller.signal });
        }
        const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>(resolve => {
          window.addEventListener('load', () => resolve(), { once: true, signal: controller.signal });
        });
        void Promise.all([document.fonts.ready, loaded]).then(requestScrollRefresh).then(() => {
          if (!controller.signal.aborted && !interrupted && location.href === destination) {
            let id = location.hash.slice(1);
            try { id = decodeURIComponent(id); } catch { /* Keep malformed fragments literal. */ }
            const target = id === 'top' ? document.body : document.getElementById(id) ?? document.getElementsByName(id)[0];
            target?.scrollIntoView({ behavior: 'instant', block: 'start' });
          }
          controller.abort();
        });
        return () => controller.abort();
      }
    }
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    historyTarget.current = null;
    // Let the browser restore history entries and Next resolve real hash links.
    if (!restoringHistory && !location.hash) scrollToPageStart();
    if (restoringHistory && target.top !== undefined && !location.hash) {
      const controller = new AbortController();
      for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        window.addEventListener(type, () => controller.abort(), { passive: true, signal: controller.signal });
      }
      void requestScrollRefresh().then(() => {
        if (!controller.signal.aborted && location.href === target.href) {
          window.scrollTo({ top: target.top, left: 0, behavior: 'instant' });
        }
        controller.abort();
      });
      return () => controller.abort();
    }
  }, [pathname]);

  return null;
}
