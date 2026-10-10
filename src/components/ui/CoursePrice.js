import { cn } from '@/lib/cn';

/** Percent off, rounded, or null when the course isn't on sale (no compare-at price, or it isn't higher). */
export function discountPercent(priceCents, compareAtPriceCents) {
  if (!compareAtPriceCents || compareAtPriceCents <= priceCents) return null;
  return Math.round(((compareAtPriceCents - priceCents) / compareAtPriceCents) * 100);
}

/**
 * Current price, and — when on sale — the old price struck through plus a "-N%" badge.
 * Shared by the course card grid and the course detail page so the sale treatment matches.
 */
export default function CoursePrice({ priceCents, compareAtPriceCents, format, t, size = 'sm', className }) {
  const percent = discountPercent(priceCents, compareAtPriceCents);
  const current = priceCents === 0 ? t('courses.card.free') : format.currency(priceCents / 100);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className={cn('font-semibold text-foreground', size === 'lg' ? 'font-display text-3xl font-normal tracking-tight' : 'text-sm')}>
        {current}
      </span>
      {percent ? (
        <>
          <span className={cn('text-foreground-subtle line-through', size === 'lg' ? 'text-lg' : 'text-sm')}>
            {format.currency(compareAtPriceCents / 100)}
          </span>
          <span className="inline-flex items-center rounded-md bg-error-soft px-1.5 py-0.5 text-xs font-semibold text-error">
            {t('courses.card.off', { percent })}
          </span>
        </>
      ) : null}
    </div>
  );
}
