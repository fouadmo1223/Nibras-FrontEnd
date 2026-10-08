'use client';

import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Orchestrates the hero's one-time entrance: text pieces (pill, title, body, CTAs) fade/rise
 * in sequence, then the image panel grows open top-to-bottom, then the floating accent cards
 * fade in last. Children are marked with `data-hero="pill|title|body|ctas|image|accent"`.
 * Reduce Motion (and no-JS) renders the finished state via the CSS in globals.css.
 */
export default function HeroEntrance({ as: Tag = 'div', className, children, ...props }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const textItems = ['pill', 'title', 'body', 'ctas']
        .map((name) => root.querySelector(`[data-hero="${name}"]`))
        .filter(Boolean);
      const image = root.querySelector('[data-hero="image"]');
      const accents = root.querySelectorAll('[data-hero="accent"]');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(textItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 0.1);
      if (image) {
        tl.to(image, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' }, '-=0.25');
      }
      if (accents.length) {
        tl.to(accents, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.35');
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <Tag ref={ref} className={className ? `hero-entrance ${className}` : 'hero-entrance'} {...props}>
      {children}
    </Tag>
  );
}
