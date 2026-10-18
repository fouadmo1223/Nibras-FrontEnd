import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

/** Builds `?a=1&b=2` from the current params with `page` overridden (and dropped when it's 1). */
function pageHref(params, page) {
  const next = new URLSearchParams(params);
  if (page <= 1) next.delete('page');
  else next.set('page', String(page));
  const qs = next.toString();
  return qs ? `/courses?${qs}` : '/courses';
}

/** Prev/next + "Page X of Y", server-rendered as plain links so it works without client JS. */
export default function Pagination({ page, totalPages, searchParams, t }) {
  if (totalPages <= 1) return null;
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label={t('courses.pagination.status', { page, totalPages })}>
      <Link
        href={pageHref(searchParams, page - 1)}
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : undefined}
        className={`inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-foreground transition-colors ${
          prevDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-surface-muted'
        }`}
      >
        <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        {t('courses.pagination.previous')}
      </Link>
      <span className="text-sm text-foreground-subtle">{t('courses.pagination.status', { page, totalPages })}</span>
      <Link
        href={pageHref(searchParams, page + 1)}
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
        className={`inline-flex h-10 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-foreground transition-colors ${
          nextDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-surface-muted'
        }`}
      >
        {t('courses.pagination.next')}
        <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      </Link>
    </nav>
  );
}
