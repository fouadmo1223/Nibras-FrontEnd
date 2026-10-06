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
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const name = locale === 'ar' ? c.nameAr : c.nameEn;
        const description = locale === 'ar' ? c.descriptionAr : c.descriptionEn;
        return (
          <li key={c.id} className="group rounded-2xl border border-border bg-surface p-6 shadow-elevation-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2">
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            {description ? <p className="mt-2 text-sm leading-6 text-foreground-muted">{description}</p> : null}
            <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">{t('home.sections.categories.browse')}</span>
          </li>
        );
      })}
    </ul>
  );
}
