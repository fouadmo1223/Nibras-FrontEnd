import Avatar from '@/components/ui/Avatar';
import GsapReveal from '@/components/motion/GsapReveal';
import Card, { CardGlow } from '@/components/ui/Card';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { getPublishedInstructors } from '@/services/instructors.service';

/** Published instructors, shown in the visitor's language. Empty array → empty state. */
export default async function InstructorGrid({ emptyTitle, emptyBody, limit }) {
  const [{ locale, t }, instructors] = await Promise.all([getI18n(), getPublishedInstructors()]);
  const rows = limit ? instructors.slice(0, limit) : instructors;

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
      {rows.map((profile) => {
        const headline = (locale === 'ar' ? profile.headlineAr : profile.headlineEn) || t('instructors.noHeadline');
        return (
          <li key={profile.id} data-reveal>
            <Card as={Link} href={`/instructors/${profile.id}`} variant="glass" hover className="flex h-full items-center gap-4">
              <CardGlow tone="secondary" />
              <span className="relative transition-transform duration-300 group-hover:scale-105">
                <Avatar user={profile.user} size="lg" />
              </span>
              <div className="relative min-w-0">
                <h3 className="truncate text-lg font-semibold text-foreground">{profile.user.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground-muted">{headline}</p>
              </div>
            </Card>
          </li>
        );
      })}
    </GsapReveal>
  );
}
