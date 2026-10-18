'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Menu from '@/components/ui/Menu';
import { useLocaleRouter } from '@/i18n/navigation';
import { useI18n } from '@/i18n/I18nProvider';

/** One custom dropdown filter, built on the shared accessible `Menu` (not a native `<select>`). */
function FilterSelect({ label, value, options, onChange }) {
  const current = options.find((o) => o.value === value);
  return (
    <Menu
      className="w-full"
      label={label}
      align="start"
      menuClassName="w-full"
      triggerClassName="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface px-3.5 text-sm text-foreground transition-colors hover:bg-surface-muted aria-expanded:border-primary"
      triggerContent={
        <>
          <span className="truncate">{current?.label ?? label}</span>
          <ChevronDown className="size-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
        </>
      }
      items={options.map((o) => ({ id: o.value || '__all__', label: o.label, selected: o.value === value, onSelect: () => onChange(o.value) }))}
    />
  );
}

/**
 * Category/instructor/price/level filters, each a custom dropdown. Every change rewrites the
 * URL's search params (and resets `page` to 1), so results stay server-rendered and shareable —
 * only the filtering interaction itself needs client JS.
 */
export default function CourseFilterBar({ categories, instructors }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useLocaleRouter();

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <FilterSelect
        label={t('courses.directory.category')}
        value={searchParams.get('category') ?? ''}
        onChange={(v) => setParam('category', v)}
        options={[
          { value: '', label: t('courses.directory.allCategories') },
          ...categories.map((c) => ({ value: c.slug, label: locale === 'ar' ? c.nameAr : c.nameEn })),
        ]}
      />

      <FilterSelect
        label={t('courses.directory.instructor')}
        value={searchParams.get('instructor') ?? ''}
        onChange={(v) => setParam('instructor', v)}
        options={[
          { value: '', label: t('courses.directory.allInstructors') },
          ...instructors.map((i) => ({ value: i.id, label: i.user.name })),
        ]}
      />

      <FilterSelect
        label={t('courses.directory.price')}
        value={searchParams.get('price') ?? ''}
        onChange={(v) => setParam('price', v)}
        options={[
          { value: '', label: t('courses.directory.priceAll') },
          { value: 'free', label: t('courses.directory.priceFree') },
          { value: 'paid', label: t('courses.directory.pricePaid') },
        ]}
      />

      <FilterSelect
        label={t('courses.directory.level')}
        value={searchParams.get('level') ?? ''}
        onChange={(v) => setParam('level', v)}
        options={[
          { value: '', label: t('courses.directory.levelAll') },
          { value: 'BEGINNER', label: t('courses.level.BEGINNER') },
          { value: 'INTERMEDIATE', label: t('courses.level.INTERMEDIATE') },
          { value: 'ADVANCED', label: t('courses.level.ADVANCED') },
        ]}
      />
    </div>
  );
}
