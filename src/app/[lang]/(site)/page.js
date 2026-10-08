import { Suspense } from 'react';
import { ArrowRight, BookOpen, GraduationCap, MessageCircleHeart, Sparkles, Tags } from 'lucide-react';
import CategoryGrid from '@/components/sections/CategoryGrid';
import GsapReveal from '@/components/motion/GsapReveal';
import HeroIllustration from '@/components/sections/HeroIllustration';
import InstructorGrid from '@/components/sections/InstructorGrid';
import Journey from '@/components/sections/Journey';
import OrbitAccent from '@/components/sections/OrbitAccent';
import TiltObjects from '@/components/sections/TiltObjects';
import HomeStats, { HomeStatsSkeleton } from '@/components/sections/HomeStats';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { languageAlternates } from '@/i18n/seo';

const TILT_ICONS = ['book', 'compass', 'flask', 'award'];

export async function generateMetadata() {
  const { locale } = await getI18n();
  return { alternates: languageAlternates(locale, '/') };
}

/**
 * Homepage (Phase 4, first slice): hero, live statistics and honest empty states for the
 * sections that need courses and categories. Those sections fill in as their modules ship.
 */
export default async function HomePage() {
  const { t } = await getI18n();
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative isolate -mt-24 flex min-h-dvh items-center overflow-hidden pb-16 pt-28">
        {/* Full-bleed cinematic backdrop: glows, a fine grid and a vignette, edge to edge. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 top-1/4 size-[60rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_28%,transparent),transparent)] blur-2xl" />
          <div className="absolute -right-40 -top-40 size-[55rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--secondary)_22%,transparent),transparent)] blur-2xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_100%)]" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10 lg:px-10">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground-muted">
              <Sparkles className="size-3.5 text-secondary" aria-hidden="true" />
              {t('home.hero.eyebrow')}
            </p>
            <h1 className="mt-6 font-display text-5xl leading-[1.04] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {t('home.hero.titleStart')} <em className="text-primary">{t('home.hero.titleEmphasis')}</em> {t('home.hero.titleEnd')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-foreground-muted">{t('home.hero.body')}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground shadow-elevation-2 transition-all duration-200 hover:scale-[1.03] hover:bg-primary-hover hover:shadow-elevation-3 active:scale-[0.98]"
              >
                {t('home.hero.primaryCta')}
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-lg border border-border-strong bg-surface/60 px-6 font-medium text-foreground backdrop-blur-sm transition-all duration-200 hover:scale-[1.03] hover:bg-surface-muted active:scale-[0.98]"
              >
                {t('home.hero.secondaryCta')}
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-up">
            {/* Glowing halo behind the illustration. */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 m-auto size-[min(34rem,100%)] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_30%,transparent),transparent_72%)] blur-3xl" />
            <div className="glass rounded-3xl border p-6 shadow-elevation-3 sm:p-9">
              <HeroIllustration />
              <div className="mt-2 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold text-foreground">{t('home.hero.panelTitle')}</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground-muted">{t('home.hero.panelBody')}</p>
              <div className="mt-7 border-t border-border pt-7">
                <Suspense fallback={<HomeStatsSkeleton />}>
                  <HomeStats />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="tilt-heading" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-10">
        <h2 id="tilt-heading" className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
          {t('home.tilt.title')}
        </h2>
        <div className="mt-12">
          <TiltObjects items={[0, 1, 2, 3].map((i) => ({ icon: TILT_ICONS[i], title: t(`home.tilt.items.${i}.title`), body: t(`home.tilt.items.${i}.body`) }))} />
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
        <h2 id="categories-heading" className="font-display text-3xl tracking-tight text-foreground">
          {t('home.sections.categories.title')}
        </h2>
        <Suspense fallback={<div className="mt-8 h-32 animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />}>
          <CategoryGrid emptyTitle={t('home.sections.categories.emptyTitle')} emptyBody={t('home.sections.categories.emptyBody')} />
        </Suspense>
      </section>

      <section aria-labelledby="courses-heading" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
        <h2 id="courses-heading" className="font-display text-3xl tracking-tight text-foreground">
          {t('home.sections.courses.title')}
        </h2>
        <EmptyState icon={BookOpen} title={t('home.sections.courses.emptyTitle')} body={t('home.sections.courses.emptyBody')} />
      </section>

      <Journey
        title={t('home.journey.title')}
        subtitle={t('home.journey.subtitle')}
        steps={[0, 1, 2].map((i) => ({ title: t(`home.journey.steps.${i}.title`), body: t(`home.journey.steps.${i}.body`) }))}
      />

      <section aria-labelledby="instructors-heading" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
        <h2 id="instructors-heading" className="font-display text-3xl tracking-tight text-foreground">
          {t('home.sections.instructors.title')}
        </h2>
        <Suspense fallback={<div className="mt-8 h-32 animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />}>
          <InstructorGrid emptyTitle={t('home.sections.instructors.emptyTitle')} emptyBody={t('home.sections.instructors.emptyBody')} limit={3} />
        </Suspense>
        <div className="mt-6 text-center">
          <Link href="/instructors" className="text-sm font-medium text-primary hover:underline">
            {t('home.sections.instructors.viewAll')}
          </Link>
        </div>
      </section>

      <section aria-labelledby="testimonials-heading" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
        <h2 id="testimonials-heading" className="font-display text-3xl tracking-tight text-foreground">
          {t('home.sections.testimonials.title')}
        </h2>
        <EmptyState icon={MessageCircleHeart} title={t('home.sections.testimonials.emptyTitle')} body={t('home.sections.testimonials.emptyBody')} />
      </section>

      <section aria-labelledby="pricing-heading" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-10">
        <h2 id="pricing-heading" className="font-display text-3xl tracking-tight text-foreground">
          {t('home.sections.pricing.title')}
        </h2>
        <EmptyState icon={Tags} title={t('home.sections.pricing.emptyTitle')} body={t('home.sections.pricing.emptyBody')} />
      </section>

      <GsapReveal
        as="section"
        aria-labelledby="cta-heading"
        className="mx-auto w-full max-w-6xl px-4 pb-28 sm:px-6 lg:px-10"
      >
        <div
          data-reveal
          className="group relative isolate overflow-hidden rounded-3xl border border-border bg-surface/80 px-6 py-16 text-center shadow-elevation-3 backdrop-blur-sm transition-shadow duration-500 hover:shadow-elevation-4 sm:px-12"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)] transition-opacity duration-500 group-hover:opacity-80" />
          <div className="mx-auto -mt-6 mb-2">
            <OrbitAccent centerIcon="gem" size={128} />
          </div>
          <h2 id="cta-heading" className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            {t('home.cta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-foreground-muted">{t('home.cta.body')}</p>
          <Link
            href="/register"
            className="mt-9 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-7 font-medium text-primary-foreground shadow-elevation-2 transition-all duration-200 hover:scale-[1.03] hover:bg-primary-hover hover:shadow-elevation-3 active:scale-[0.98]"
          >
            {t('home.cta.button')}
            <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </div>
      </GsapReveal>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border-strong bg-surface/70 p-10 text-center backdrop-blur-sm transition-colors duration-300 hover:border-primary/40">
      {Icon ? (
        <span className="mb-4 grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <p className="font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{body}</p>
    </div>
  );
}
