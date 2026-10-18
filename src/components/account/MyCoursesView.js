'use client';

import { BookOpen } from 'lucide-react';
import MyCoursesGrid from '@/components/account/MyCoursesGrid';
import RequireSession from '@/components/account/RequireSession';
import { useI18n } from '@/i18n/I18nProvider';

/** Standalone `/my-courses` page: every enrolled course as a card (image + progress pie, title, price, progress bar). */
export default function MyCoursesView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <BookOpen className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">{t('account.myCourses.title')}</h1>
          <p className="mt-1 text-foreground-muted">{t('account.myCourses.description')}</p>
        </div>
      </div>
      <div className="mt-8">
        <RequireSession next="/my-courses" loadingLabel={t('account.myCourses.loading')}>
          {() => <MyCoursesGrid />}
        </RequireSession>
      </div>
    </div>
  );
}
