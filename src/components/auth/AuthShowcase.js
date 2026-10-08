'use client';

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { Award, BookOpen, Play, Star } from 'lucide-react';
import { brand } from '@/constants/brand';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useI18n } from '@/i18n/I18nProvider';

const { mark, colors } = brand;
const ease = [0.45, 0, 0.55, 1];

/** Glassy card that floats on its own rhythm and shifts with pointer parallax. */
function FloatCard({ className, depth, delay, mx, my, still, children }) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div className={`absolute ${className}`} style={{ x, y }}>
      <motion.div
        initial={false}
        animate={still ? { y: 0 } : { y: [0, -10, 0] }}
        transition={still ? { duration: 0 } : { duration: 6 + depth / 10, delay, repeat: Infinity, ease }}
        className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 text-white shadow-[0_20px_60px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** The Nibras lamp: book + flickering flame, glow and rising sparks. */
function Lamp({ still }) {
  const sparks = Array.from({ length: 10 }, (_, i) => i);
  return (
    <div className="relative grid size-56 place-items-center">
      <motion.div
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgb(245_158_11/0.45),transparent_65%)] blur-2xl"
        animate={still ? undefined : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.2, repeat: Infinity, ease }}
      />
      {!still &&
        sparks.map((i) => (
          <motion.span
            key={i}
            className="absolute size-1.5 rounded-full bg-amber-300"
            style={{ left: '50%', top: '30%' }}
            initial={{ opacity: 0 }}
            animate={{ y: [0, -110 - (i % 4) * 22], x: [0, ((i % 5) - 2) * 14], opacity: [0, 1, 0], scale: [1, 0.4] }}
            transition={{ duration: 2.6 + (i % 3) * 0.6, delay: i * 0.45, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      <svg viewBox={mark.viewBox} className="relative size-40 drop-shadow-[0_18px_40px_rgb(254_90_31/0.35)]" aria-hidden="true">
        <path fill={colors.onPrimary.page} d={mark.pageLeft} />
        <path fill={colors.onPrimary.page} d={mark.pageRight} />
        <motion.g
          style={{ transformOrigin: '32px 26px', transformBox: 'view-box' }}
          animate={still ? undefined : { scaleY: [1, 1.08, 0.96, 1.05, 1], scaleX: [1, 0.97, 1.02, 0.98, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease }}
        >
          <path fill={colors.onPrimary.flame} d={mark.flame} />
          <path fill={colors.onPrimary.core} d={mark.flameCore} />
        </motion.g>
      </svg>
    </div>
  );
}

function ShowcaseScene({ animate }) {
  const { t } = useI18n();
  const still = useReducedMotion() || !animate;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const mx = useSpring(pointerX, { stiffness: 60, damping: 18 });
  const my = useSpring(pointerY, { stiffness: 60, damping: 18 });

  const onPointerMove = (event) => {
    if (still) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const shared = { mx, my, still };

  return (
    <div className="absolute inset-0" onPointerMove={onPointerMove} onPointerLeave={() => (pointerX.set(0), pointerY.set(0))}>
      {/* Drifting light. */}
      <motion.div
        className="absolute -top-24 -right-24 size-[28rem] rounded-full bg-amber-500/25 blur-3xl"
        animate={still ? undefined : { x: [0, -40, 10, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease }}
      />
      <motion.div
        className="absolute -bottom-32 -left-24 size-[32rem] rounded-full bg-white/10 blur-3xl"
        animate={still ? undefined : { x: [0, 50, -10, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease }}
      />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Lamp still={still} />
      </div>

      {/* Course progress */}
      <FloatCard className="left-[8%] top-[12%] w-60" depth={-26} delay={0.15} {...shared}>
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-white/15">
            <BookOpen className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{t('showcase.course')}</p>
            <p className="text-xs text-white/60">{t('showcase.lesson', { current: 8, total: 12 })}</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-white/70 to-amber-400"
            initial={false}
            animate={{ width: '67%' }}
          />
        </div>
      </FloatCard>

      {/* Video lesson */}
      <FloatCard className="right-[8%] top-[18%] w-56" depth={34} delay={0.35} {...shared}>
        <div className="relative grid h-24 place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,rgb(38_38_36/0.75),rgb(245_158_11/0.5))]">
          {!still && (
            <motion.span
              className="absolute size-12 rounded-full border border-white/50"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <span className="grid size-10 place-items-center rounded-full bg-white text-amber-600">
            <Play className="ms-0.5 size-4 fill-current" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full bg-white/80"
            initial={false}
            animate={still ? { width: '35%' } : { width: ['0%', '100%'] }}
            transition={still ? undefined : { duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="mt-2 text-xs text-white/60">{t('showcase.videoLesson')}</p>
      </FloatCard>

      {/* Quiz */}
      <FloatCard className="right-[10%] bottom-[10%] w-52" depth={22} delay={0.55} {...shared}>
        <p className="text-sm font-semibold">{t('showcase.quizComplete')}</p>
        <div className="mt-2 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="inline-block"
              animate={still ? undefined : { scale: [1, 1.25, 1] }}
              transition={{ duration: 0.5, delay: 1 + i * 0.12, repeat: Infinity, repeatDelay: 5 }}
            >
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            </motion.span>
          ))}
        </div>
      </FloatCard>

      {/* Certificate */}
      <FloatCard className="left-[10%] bottom-[14%] w-56" depth={-18} delay={0.75} {...shared}>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-amber-500/25 text-amber-300">
            <Award className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">{t('showcase.certificate')}</p>
            <svg viewBox="0 0 24 24" className="mt-1 size-5 text-emerald-500" aria-hidden="true">
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: 1 }}
              />
            </svg>
          </div>
        </div>
      </FloatCard>
    </div>
  );
}

/** Desktop-only illustrated half of the auth layout. */
export default function AuthShowcase() {
  // Static on the server and on small screens; loops start once a desktop browser has hydrated.
  const desktop = useMediaQuery('(min-width: 1024px)');
  const { locale } = useI18n();
  const other = locale === 'ar' ? 'en' : 'ar';

  return (
    <aside aria-hidden="true" className="relative flex h-full flex-col overflow-hidden bg-ink-950 text-white">
      {/* Scene and copy stack, so floating cards never overlap the headline at short heights. */}
      <div className="relative min-h-0 flex-1">
        <ShowcaseScene animate={desktop} />
      </div>
      <div className="pointer-events-none relative px-14 pb-14 pt-2">
        <p className={`max-w-md text-5xl leading-[1.1] tracking-tight ${locale === 'ar' ? 'font-arabic font-semibold' : 'font-display'}`}>
          {brand.tagline[locale]}
        </p>
        <p lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'} className={`mt-3 max-w-md text-2xl text-white/70 ${other === 'ar' ? 'font-arabic' : 'font-display'}`}>
          {brand.tagline[other]}
        </p>
      </div>
    </aside>
  );
}
