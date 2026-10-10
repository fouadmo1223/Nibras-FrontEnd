import { getI18n } from '@/i18n/dictionaries';
import { getHomeStats } from '@/services/home.service';

/** Live counters from the API. Shows only numbers the database actually holds. */
export default async function HomeStats() {
  const [{ t, format }, stats] = await Promise.all([getI18n(), getHomeStats()]);
  const items = [
    { key: 'learners', value: stats.learners },
    { key: 'instructors', value: stats.instructors },
    { key: 'courses', value: stats.courses },
  ];
  return (
    <dl className="grid grid-cols-3 gap-4 sm:gap-10">
      {items.map((item) => (
        <div key={item.key}>
          <dt className="text-sm text-foreground-subtle">{t(`home.stats.${item.key}`)}</dt>
          <dd className="mt-1 font-display text-3xl tracking-tight text-foreground tabular-nums sm:text-4xl">{format.number(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HomeStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-10" aria-hidden="true">
      <div className="h-14 w-20 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-14 w-20 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-14 w-20 animate-pulse rounded-md bg-surface-muted" />
    </div>
  );
}
