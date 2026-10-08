import { ArrowRight } from 'lucide-react';
import GsapReveal from '@/components/motion/GsapReveal';
import { getI18n } from '@/i18n/dictionaries';
import { getPublishedCategories } from '@/services/categories.service';

/** Published categories from the API, shown in the visitor's language. Empty array → empty state. */
export default async function CategoryGrid({ emptyTitle, emptyBody }) {
  const [{ locale, t }, categories] = await Promise.all([getI18n(), getPublishedCategories()]);
  if (categories.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{emptyBody}</p>
      </div>
    );
  }
  return (
    <GsapReveal as="ul" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const name = locale === 'ar' ? c.nameAr : c.nameEn;
        const description = locale === 'ar' ? c.descriptionAr : c.descriptionEn;
        return (
          <li
            key={c.id}
            data-reveal
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface/80 p-6 shadow-elevation-1 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevation-2"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -end-10 -top-10 size-36 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            />
            <h3 className="relative text-lg font-semibold text-foreground">{name}</h3>
            {description ? <p className="relative mt-2 text-sm leading-6 text-foreground-muted">{description}</p> : null}
            <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              {t('home.sections.categories.browse')}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden="true" />
            </span>
          </li>
        );
      })}
    </GsapReveal>
  );
}
