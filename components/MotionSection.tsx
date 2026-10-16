'use client';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Server-rendered content stays visible without JS. Motion is scoped and reversible. */
export default function MotionSection({ children, className, motionKey, id }: {
  children: ReactNode;
  className?: string;
  motionKey: string;
  id?: string;
}) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const element = root.current!;
    media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, (context) => {
      if (context.conditions?.reduced) {
        element.dataset.motionState = 'reduced';
        element.dataset.motionProgress = '1';
        return;
      }
      element.dataset.motionState = 'active';
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          id: `editorial-${motionKey}`, trigger: element,
          start: 'top 85%', end: 'top 12%', scrub: 0.65,
          invalidateOnRefresh: true,
        },
        onUpdate: () => { element.dataset.motionProgress = timeline.progress().toFixed(4); },
      });
      const select = gsap.utils.selector(element);
      const headings = select('[data-motion="heading"]');
      const copy = select('[data-motion="copy"]');
      const visuals = select('[data-motion="visual"]');
      const mechanisms = select('[data-mechanism]');
      if (headings.length) timeline.fromTo(headings,
        { y: 55, clipPath: 'inset(0% 0% 100% 0%)' },
        { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 }, 0);
      if (copy.length) timeline.fromTo(copy,
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.055 }, 0.16);
      if (visuals.length) timeline.fromTo(visuals,
        { x: 45, clipPath: 'inset(0% 0% 0% 100%)' },
        { x: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power2.inOut' }, 0.03);
      if (mechanisms.length) timeline.fromTo(mechanisms,
        { y: 26, rotation: -2, transformOrigin: '50% 50%' },
        { y: 0, rotation: 0, duration: 0.8, stagger: 0.06 }, 0.15);
      element.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach((path, index) => {
        const length = path.getTotalLength();
        timeline.fromTo(path, { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.65, ease: 'none' }, 0.2 + index * 0.035);
      });
      // A fixed duration makes every region's public progress comparable.
      timeline.to({}, { duration: 0.01 }, Math.max(1, timeline.duration()));
    }, root);
    return () => media.revert();
  }, [motionKey]);
  return <section ref={root} id={id} className={className} data-motion-region={motionKey} data-motion-state="pending" data-motion-progress="0">{children}</section>;
}
