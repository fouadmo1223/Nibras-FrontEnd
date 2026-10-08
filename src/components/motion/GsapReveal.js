'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/**
 * Wraps a list/grid and reveals its direct `[data-reveal]` children with a GSAP
 * ScrollTrigger-driven fade + rise, staggered as the group enters the viewport.
 * Reduce Motion (and no-JS/SSR) renders children in their final, visible state.
 */
export default function GsapReveal({ as: Tag = 'div', stagger = 0.08, y = 28, className, children, ...props }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = root.querySelectorAll('[data-reveal]');
    if (reduce || targets.length === 0) return undefined;

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [stagger, y]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
