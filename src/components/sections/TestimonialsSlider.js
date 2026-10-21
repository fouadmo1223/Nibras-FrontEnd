'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/** A testimonial card, sized so exactly 3 fit per "page" on large screens, 2 on tablet, 1 on mobile. */
function TestimonialCard({ review, locale }) {
  const title = locale === 'ar' ? review.course.titleAr : review.course.titleEn;
  return (
    <li
      data-reveal
      className="w-full shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
    >
      <Card variant="glass" className="flex h-full flex-col p-6">
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={n <= review.rating ? 'size-4 fill-warning text-warning' : 'size-4 fill-transparent text-foreground-subtle'} />
          ))}
        </div>
        <p className="mt-3 flex-1 text-sm leading-6 text-foreground-muted">“{review.comment}”</p>
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
          <Avatar user={review.user} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{review.user.name}</p>
            <Link href={`/courses/${review.course.slug}`} className="block truncate text-xs text-foreground-subtle hover:text-primary">
              {title}
            </Link>
          </div>
        </div>
      </Card>
    </li>
  );
}

/** Horizontal scroll-snap slider, 3 cards per page on desktop, with prev/next controls. */
export default function TestimonialsSlider({ reviews, locale }) {
  const { t } = useI18n();
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos <= 4);
    setAtEnd(pos >= max - 4);
  };

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, []);

  const scrollByPage = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="relative mt-8">
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <TestimonialCard key={review.id} review={review} locale={locale} />
        ))}
      </ul>

      {reviews.length > 3 ? (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label={t('home.sections.testimonials.previous')}
            className={cn(
              'grid size-10 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-surface-muted',
              atStart && 'pointer-events-none opacity-40',
            )}
          >
            <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label={t('home.sections.testimonials.next')}
            className={cn(
              'grid size-10 place-items-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-surface-muted',
              atEnd && 'pointer-events-none opacity-40',
            )}
          >
            <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
