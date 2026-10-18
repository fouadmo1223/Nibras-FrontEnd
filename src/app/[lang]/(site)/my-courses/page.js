import { Suspense } from 'react';
import MyCoursesView from '@/components/account/MyCoursesView';
import { getI18n } from '@/i18n/dictionaries';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.myCourses'), robots: { index: false } };
}

export default function MyCoursesPage() {
  return (
    <Suspense>
      <MyCoursesView />
    </Suspense>
  );
}
