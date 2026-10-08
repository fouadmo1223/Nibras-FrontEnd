import Avatar from '@/components/ui/Avatar';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { getPublishedInstructors } from '@/services/instructors.service';

/** Published instructors, shown in the visitor's language. Empty array → empty state. */
export default async function InstructorGrid({ emptyTitle, emptyBody, limit }) {
  const [{ locale, t }, instructors] = await Promise.all([getI18n(), getPublishedInstructors()]);
  const rows = limit ? instructors.slice(0, limit) : instructors;

  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border-strong bg-surface p-10 text-center">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{emptyBody}</p>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((profile) => {
        const headline = (locale === 'ar' ? profile.headlineAr : profile.headlineEn) || t('instructors.noHeadline');
        return (
          <li key={profile.id}>
            <Link
              href={`/instructors/${profile.id}`}
              className="group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-6 shadow-elevation-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2"
            >
              <Avatar user={profile.user} size="lg" />
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground">{profile.user.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground-muted">{headline}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
