'use client';

import { motion, useReducedMotion } from 'motion/react';

const CX = 200;
const CY = 165;
const RING_R = 58;
const RING_C = 2 * Math.PI * RING_R;
const PROGRESS = 0.67;

/** Floating education badges: position, icon path set, and float timing. */
const BADGES = [
  { id: 'cap', x: 62, y: 84, delay: 0.5, tone: 'primary', d: 'M4 9l8-4 8 4-8 4-8-4zM8 11v4c0 1 2 2 4 2s4-1 4-2v-4M20 9v5' },
  { id: 'pencil', x: 308, y: 70, delay: 0.7, tone: 'secondary', d: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3' },
  { id: 'flask', x: 78, y: 230, delay: 0.9, tone: 'primary', d: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3' },
  { id: 'award', x: 316, y: 226, delay: 1.1, tone: 'secondary', d: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 13.5L7 22l5-3 5 3-1.5-8.5' },
];

const SPARKLES = [
  [120, 40],
  [282, 124],
  [40, 150],
  [352, 176],
  [200, 18],
];

const toneClass = {
  primary: 'text-primary bg-primary-soft',
  secondary: 'text-secondary bg-secondary-soft',
};

/**
 * Animated hero illustration: drawn orbits and connectors, a book that draws itself, a
 * progress ring, floating course badges and twinkling sparks. Decorative (aria-hidden).
 * Under Reduce Motion everything renders in its final state with no loops.
 */
export default function HeroIllustration() {
  const reduce = useReducedMotion();
  const draw = (delay = 0, duration = 1.2) =>
    reduce ? { pathLength: 1 } : { pathLength: [0, 1], transition: { duration, delay, ease: [0.45, 0, 0.55, 1] } };

  return (
    <svg viewBox="0 0 400 330" className="h-auto w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--secondary)" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow behind the hero object */}
      <circle cx={CX} cy={CY} r="120" fill="url(#hero-glow)" />

      {/* Two drawn orbits */}
      <motion.ellipse
        cx={CX}
        cy={CY}
        rx="150"
        ry="96"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="1.2"
        strokeDasharray="4 6"
        initial={{ pathLength: 0 }}
        animate={draw(0.1, 1.6)}
      />
      <motion.ellipse
        cx={CX}
        cy={CY}
        rx="118"
        ry="150"
        fill="none"
        stroke="var(--primary)"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        initial={{ pathLength: 0 }}
        animate={draw(0.3, 1.8)}
        transform={`rotate(-18 ${CX} ${CY})`}
      />

      {/* Connectors from the centre to each badge, drawn after the orbits */}
      {BADGES.map((b) => (
        <motion.path
          key={`link-${b.id}`}
          d={`M${CX} ${CY} Q ${(CX + b.x) / 2} ${(CY + b.y) / 2 - 24} ${b.x} ${b.y}`}
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.5"
          strokeWidth="1.4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={draw(0.8 + b.delay * 0.4, 0.9)}
        />
      ))}

      {/* Progress ring around the book */}
      <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="var(--surface-muted)" strokeWidth="6" />
      <motion.circle
        cx={CX}
        cy={CY}
        r={RING_R}
        fill="none"
        stroke="url(#hero-ring)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={RING_C}
        transform={`rotate(-90 ${CX} ${CY})`}
        initial={{ strokeDashoffset: RING_C }}
        animate={{ strokeDashoffset: RING_C * (1 - PROGRESS) }}
        transition={{ duration: reduce ? 0 : 1.6, delay: 0.6, ease: [0.2, 0, 0, 1] }}
      />

      {/* The book draws itself */}
      <motion.g
        initial={reduce ? false : { y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
      >
        <motion.path
          d={`M${CX} ${CY - 26} C ${CX - 14} ${CY - 34} ${CX - 40} ${CY - 34} ${CX - 52} ${CY - 26} L ${CX - 52} ${CY + 24} C ${CX - 40} ${CY + 16} ${CX - 14} ${CY + 16} ${CX} ${CY + 24} Z`}
          fill="var(--primary-soft)"
          stroke="var(--primary)"
          strokeWidth="2.2"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={draw(0.2, 1.1)}
        />
        <motion.path
          d={`M${CX} ${CY - 26} C ${CX + 14} ${CY - 34} ${CX + 40} ${CY - 34} ${CX + 52} ${CY - 26} L ${CX + 52} ${CY + 24} C ${CX + 40} ${CY + 16} ${CX + 14} ${CY + 16} ${CX} ${CY + 24} Z`}
          fill="var(--primary-soft)"
          stroke="var(--primary)"
          strokeWidth="2.2"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={draw(0.4, 1.1)}
        />
        {/* A flame over the spine, flickering */}
        <motion.path
          d={`M${CX} ${CY - 44} C ${CX + 8} ${CY - 36} ${CX + 6} ${CY - 28} ${CX} ${CY - 26} C ${CX - 6} ${CY - 28} ${CX - 8} ${CY - 36} ${CX} ${CY - 44} Z`}
          fill="var(--secondary)"
          animate={reduce ? undefined : { scale: [1, 1.12, 0.96, 1], opacity: [1, 0.85, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${CX}px ${CY - 26}px` }}
        />
      </motion.g>

      {/* Floating badges */}
      {BADGES.map((b) => (
        <motion.g
          key={b.id}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: b.delay, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <motion.g animate={reduce ? undefined : { y: [0, -7, 0] }} transition={{ duration: 4 + b.delay, repeat: Infinity, ease: 'easeInOut' }}>
            <foreignObject x={b.x - 22} y={b.y - 22} width="44" height="44">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className={`grid size-11 place-items-center rounded-2xl border border-border bg-surface shadow-elevation-2 ${toneClass[b.tone]}`}
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.d} />
                </svg>
              </div>
            </foreignObject>
          </motion.g>
        </motion.g>
      ))}

      {/* Sparks */}
      {SPARKLES.map(([x, y], i) => (
        <motion.path
          key={`spark-${i}`}
          d={`M${x} ${y - 5} L${x} ${y + 5} M${x - 5} ${y} L${x + 5} ${y}`}
          stroke="var(--secondary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0.8 } : { opacity: [0, 1, 0] }}
          transition={{ duration: 2.4, delay: 1.2 + i * 0.35, repeat: Infinity, repeatDelay: 1.6 }}
        />
      ))}
    </svg>
  );
}
