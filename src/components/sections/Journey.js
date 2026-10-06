'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { BookOpenCheck, Compass, Trophy } from 'lucide-react';

const ICONS = [Compass, BookOpenCheck, Trophy];

/**
 * Scroll-driven learning journey: a line draws down the page as the reader scrolls, and each
 * step lights up when it reaches the middle of the viewport. Reduce Motion shows it static.
 */
export default function Journey({ title, subtitle, steps }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} aria-labelledby="journey-heading" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        className="max-w-2xl"
      >
        <h2 id="journey-heading" className="font-display text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-foreground-muted">{subtitle}</p>
      </motion.div>

      <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
        {/* Progress line: behind the step markers on desktop, along the left edge on mobile. */}
        <div aria-hidden="true" className="absolute inset-y-0 start-[1.4rem] w-px bg-border md:inset-x-10 md:inset-y-auto md:start-0 md:top-7 md:h-px md:w-auto">
          <motion.div
            className="h-full w-full origin-top bg-gradient-to-b from-primary to-secondary md:origin-left md:bg-gradient-to-r"
            style={reduce ? { scaleY: 1, scaleX: 1 } : { scaleY: line, scaleX: line }}
          />
        </div>

        {steps.map((step, i) => {
          const Icon = ICONS[i];
          return (
            <motion.article
              key={step.title}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.2, 0, 0, 1] }}
              className="relative ps-14 md:ps-0"
            >
              <span className="absolute start-0 top-0 grid size-11 place-items-center rounded-xl border border-border bg-surface text-primary shadow-elevation-1 md:static md:mb-6">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground-subtle md:mt-0">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 leading-7 text-foreground-muted">{step.body}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
