import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import GsapReveal from '@/components/motion/GsapReveal';
import Card, { CardGlow } from '@/components/ui/Card';
import { getI18n } from '@/i18n/dictionaries';
import { getPublishedCategories } from '@/services/categories.service';

/** Published categories from the API, shown in the visitor's language. Empty array → empty state. */
export default async function CategoryGrid({ emptyTitle, emptyBody }) {
  const [{ locale, t }, categories] = await Promise.all([getI18n(), getPublishedCategories()]);
  if (categories.length === 0) {
    return (
      <Card variant="dashed" className="mt-8 p-10 text-center">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{emptyBody}</p>
      </Card>
    );
  }
  return (
    <GsapReveal as="ul" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const name = locale === 'ar' ? c.nameAr : c.nameEn;
        const description = locale === 'ar' ? c.descriptionAr : c.descriptionEn;
        return (
          <Card key={c.id} as="li" variant="glass" hover data-reveal className="flex flex-col">
            <CardGlow />
            {c.imageUrl ? (
              <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden rounded-t-2xl">
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 360px, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent" />
              </div>
            ) : null}
            <h3 className="relative text-lg font-semibold text-foreground">{name}</h3>
            {description ? <p className="relative mt-2 text-sm leading-6 text-foreground-muted">{description}</p> : null}
            <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              {t('home.sections.categories.browse')}
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" aria-hidden="true" />
            </span>
          </Card>
        );
      })}
    </GsapReveal>
  );
}
