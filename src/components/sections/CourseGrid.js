import Card from '@/components/ui/Card';
import CourseCard from '@/components/ui/CourseCard';
import GsapReveal from '@/components/motion/GsapReveal';
import { getI18n } from '@/i18n/dictionaries';
import { getPublishedCourses } from '@/services/courses.service';

/** Published courses from the API, shown in the visitor's language. Empty array → empty state. */
export default async function CourseGrid({ emptyTitle, emptyBody, limit, category }) {
  const [{ locale, t, format }, { items }] = await Promise.all([getI18n(), getPublishedCourses({ category, limit })]);
  const rows = limit ? items.slice(0, limit) : items;

  if (rows.length === 0) {
    return (
      <Card variant="dashed" className="mt-8 p-10 text-center">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{emptyBody}</p>
      </Card>
    );
  }

  return (
    <GsapReveal as="ul" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((course) => (
        <CourseCard key={course.id} course={course} locale={locale} t={t} format={format} reveal />
      ))}
    </GsapReveal>
  );
}
