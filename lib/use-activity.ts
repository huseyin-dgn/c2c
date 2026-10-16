'use client';
import { useEffect, useState, type RefObject } from 'react';
import { useMediaQuery } from './use-media-query';

export function useActivity(ref: RefObject<Element | null>) {
  const [visible, setVisible] = useState(false);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)', true);
  useEffect(() => {
    let intersects = false;
    const update = () => setVisible(intersects && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting; update(); }, { threshold: 0.05 });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [ref]);
  return { visible, reduced };
}
