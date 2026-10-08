'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Award, BookOpen, FlaskConical, Gem, GraduationCap, PenLine } from 'lucide-react';

const ICONS = { award: Award, book: BookOpen, flask: FlaskConical, gem: Gem, cap: GraduationCap, pencil: PenLine };

const toneClass = {
  primary: 'text-primary bg-primary-soft',
  secondary: 'text-secondary bg-secondary-soft',
};

/** Default badge ring: cap, pencil, flask, award — matches the hero illustration. */
export const DEFAULT_ORBIT_BADGES = [
  { id: 'cap', icon: 'cap', tone: 'primary' },
  { id: 'pencil', icon: 'pencil', tone: 'secondary' },
  { id: 'flask', icon: 'flask', tone: 'primary' },
  { id: 'award', icon: 'award', tone: 'secondary' },
];

/**
 * Compact version of the hero's orbit illustration: drawn rings, connectors and floating
 * icon badges around a center icon. Reusable as a decorative accent above section headings.
 * Icons are passed as string keys (not component references), since this renders inside a
 * Client Component but is often composed from a Server Component page.
 * Decorative (aria-hidden); Reduce Motion renders the finished state with no loops.
 */
export default function OrbitAccent({ centerIcon = 'book', badges = DEFAULT_ORBIT_BADGES, size = 220 }) {
  const reduce = useReducedMotion();
  const CenterIcon = ICONS[centerIcon];
  const cx = size / 2;
  const cy = size / 2;
  const ringR = size * 0.2;
  const draw = (delay = 0, duration = 1.1) =>
    reduce ? { pathLength: 1 } : { pathLength: [0, 1], transition: { duration, delay, ease: [0.45, 0, 0.55, 1] } };

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} aria-hidden="true">
      <div
        className="absolute inset-0 m-auto rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_72%)] blur-2xl"
        style={{ width: size * 0.85, height: size * 0.85 }}
      />
      <svg viewBox={`0 0 ${size} ${size}`} className="relative h-full w-full" focusable="false">
        <motion.ellipse
          cx={cx}
          cy={cy}
          rx={size * 0.46}
          ry={size * 0.3}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          initial={{ pathLength: 0 }}
          animate={draw(0.1, 1.4)}
        />
        <motion.ellipse
          cx={cx}
          cy={cy}
          rx={size * 0.3}
          ry={size * 0.46}
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.35"
          strokeWidth="1.2"
          initial={{ pathLength: 0 }}
          animate={draw(0.25, 1.5)}
          transform={`rotate(-18 ${cx} ${cy})`}
        />
        <circle cx={cx} cy={cy} r={ringR} fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
        {badges.map((b, i) => {
          const angle = (i / badges.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * size * 0.42;
          const y = cy + Math.sin(angle) * size * 0.42;
          return (
            <motion.path
              key={`link-${b.id}`}
              d={`M${cx} ${cy} Q ${(cx + x) / 2} ${(cy + y) / 2 - 16} ${x} ${y}`}
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.5"
              strokeWidth="1.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={draw(0.6 + i * 0.15, 0.8)}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <CenterIcon className="size-8 text-primary" aria-hidden="true" />
      </div>
      {badges.map((b, i) => {
        const angle = (i / badges.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * size * 0.42;
        const y = cy + Math.sin(angle) * size * 0.42;
        const Icon = ICONS[b.icon];
        return (
          <motion.div
            key={b.id}
            className="absolute"
            style={{ left: x, top: y, translateX: '-50%', translateY: '-50%' }}
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 + i * 0.12, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <motion.div
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 3.6 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
              className={`grid size-9 place-items-center rounded-xl border border-border shadow-elevation-2 ${toneClass[b.tone ?? 'primary']}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
