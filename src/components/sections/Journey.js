'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { BookOpenCheck, Compass, Trophy } from 'lucide-react';

const ICONS = [Compass, BookOpenCheck, Trophy];
const GLOW = ['from-primary/30', 'from-secondary/30', 'from-primary/30'];

/**
 * Scroll-driven journey. A glowing marker travels along the path as the reader scrolls,
 * the path itself draws in behind it, and each card rises into place. Hovering a card lifts
 * it and reveals its glow. Reduce Motion shows the finished state with no scroll effects.
 */
export default function Journey({ title, subtitle, steps }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const markerY = useTransform(drawn, [0, 1], ['0%', '100%']);
  const markerX = useTransform(drawn, [0, 1], ['0%', '100%']);

  return (
    <section ref={ref} aria-labelledby="journey-heading" className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-10">
      {/* Ambient glow that brightens as you progress. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_16%,transparent),transparent)] blur-3xl"
      />

      <motion.header
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
        className="max-w-2xl"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{String(steps.length).padStart(2, '0')} steps</p>
        <h2 id="journey-heading" className="mt-4 font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-foreground-muted">{subtitle}</p>
      </motion.header>

      <div className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
        {/* Track and travelling marker: vertical on mobile, horizontal on desktop. */}
        <div aria-hidden="true" className="absolute start-[2.1rem] top-0 h-full w-px overflow-hidden rounded-full bg-border md:start-0 md:end-0 md:top-[2.1rem] md:h-px md:w-full">
          <motion.div
            className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-primary to-secondary md:inset-y-0 md:h-full md:w-full md:origin-left md:bg-gradient-to-r"
            style={reduce ? { scaleY: 1, scaleX: 1 } : { scaleY: drawn, scaleX: drawn }}
          />
          {!reduce && (
            <>
              <motion.span
                className="absolute start-[-0.3rem] top-0 size-3 rounded-full bg-secondary shadow-[0_0_18px_4px_color-mix(in_oklab,var(--secondary)_55%,transparent)] md:hidden"
                style={{ top: markerY }}
              />
              <motion.span
                className="absolute start-0 top-[-0.3rem] hidden size-3 rounded-full bg-secondary shadow-[0_0_18px_4px_color-mix(in_oklab,var(--secondary)_55%,transparent)] md:block"
                style={{ left: markerX }}
              />
            </>
          )}
        </div>

        {steps.map((step, i) => (
          <JourneyStep key={step.title} step={step} index={i} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}

function JourneyStep({ step, index, reduce }) {
  const Icon = ICONS[index];
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 36, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.7, delay: index * 0.14, ease: [0.2, 0, 0, 1] }}
      whileHover={reduce ? undefined : { y: -6 }}
      className="group relative flex h-full flex-col ps-16 md:ps-0 md:pt-16"
    >
      <span className="absolute start-0 top-0 grid size-11 place-items-center rounded-xl border border-border bg-surface text-primary shadow-elevation-1 transition-transform duration-300 group-hover:scale-110 md:top-0">
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface/70 p-7 shadow-elevation-2 backdrop-blur-sm transition-shadow duration-300 group-hover:shadow-elevation-3">
        <div aria-hidden="true" className={`pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-gradient-to-br ${GLOW[index]} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
        <p className="font-display text-6xl leading-none text-foreground/10 tabular-nums" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="relative mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
        <p className="relative mt-2 leading-7 text-foreground-muted">{step.body}</p>
      </div>
    </motion.article>
  );
}
