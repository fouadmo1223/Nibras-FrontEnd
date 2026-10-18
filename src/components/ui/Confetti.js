'use client';

import { useState } from 'react';
import { motion } from 'motion/react';

const COLORS = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

/** A one-shot confetti burst from the top center — lightweight (no canvas, no dependency), CSS/motion only. */
export default function Confetti({ count = 32 }) {
  // Randomized once per mount (lazy initializer, not during render) — this component is keyed to
  // remount for each new celebration, so a fresh layout each time is the intended behavior.
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 340,
      rotate: (Math.random() - 0.5) * 540,
      delay: Math.random() * 0.2,
      duration: 1.1 + Math.random() * 0.6,
      color: COLORS[i % COLORS.length],
      width: 5 + Math.random() * 4,
      height: 10 + Math.random() * 6,
    })),
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: -16, rotate: 0 }}
          animate={{ opacity: [1, 1, 0], x: p.x, y: 260, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.6, 0.3, 1] }}
          style={{
            position: 'absolute',
            top: '6%',
            left: '50%',
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
