'use client';

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Award, BookOpen, Compass, FlaskConical } from 'lucide-react';

const ICONS = { book: BookOpen, compass: Compass, flask: FlaskConical, award: Award };

/**
 * Interactive 3D cards: each one tilts toward the pointer and lifts off the surface
 * (CSS 3D, no WebGL, so it costs almost nothing on phones). Pointer tilt is off for
 * touch and Reduce Motion; the cards then render flat.
 */
function TiltCard({ item, index, interactive }) {
  const Icon = ICONS[item.icon];
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [10, -10]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(x, [0, 1], [-12, 12]), { stiffness: 180, damping: 18 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.2, 0, 0, 1] }}
      style={{ perspective: 900 }}
      className="h-full"
      onPointerMove={
        interactive
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              x.set((e.clientX - r.left) / r.width);
              y.set((e.clientY - r.top) / r.height);
            }
          : undefined
      }
      onPointerLeave={() => {
        x.set(0.5);
        y.set(0.5);
      }}
    >
      <motion.article
        style={interactive ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } : undefined}
        className="relative flex h-full flex-col rounded-2xl border border-border bg-surface p-7 shadow-elevation-2 transition-shadow duration-300 hover:shadow-elevation-3"
      >
        <span
          className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary shadow-elevation-2"
          style={interactive ? { transform: 'translateZ(40px)' } : undefined}
        >
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-lg font-semibold text-foreground" style={interactive ? { transform: 'translateZ(30px)' } : undefined}>
          {item.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-foreground-muted" style={interactive ? { transform: 'translateZ(20px)' } : undefined}>
          {item.body}
        </p>
      </motion.article>
    </motion.div>
  );
}

/**
 * Grid of tilt cards. Pointer capability comes from useMediaQuery, which reports false
 * during SSR and the first client render (then updates), so server and client markup match.
 */
export default function TiltObjects({ items }) {
  const reduce = useReducedMotion();
  const fine = useMediaQuery('(pointer: fine)');
  const interactive = !reduce && fine;
  return (
    <div className="grid auto-rows-fr items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <TiltCard key={item.icon} item={item} index={i} interactive={interactive} />
      ))}
    </div>
  );
}
