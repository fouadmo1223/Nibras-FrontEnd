import { ArrowRight, GraduationCap } from 'lucide-react';
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
            <Card
              as={Link}
              href={`/instructors/${profile.id}`}
              variant="glass"
              hover
              className="flex h-full flex-col items-center p-7 text-center"
            >
              <CardGlow tone="secondary" />
              <div className="relative shrink-0">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 m-auto size-20 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--secondary)_38%,transparent),transparent_75%)] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="inline-block transition-transform duration-300 group-hover:scale-105">
                  <Avatar user={profile.user} size="xl" />
                </span>
                <span className="absolute -bottom-1 -end-1 grid size-6 place-items-center rounded-full border-2 border-surface bg-primary text-primary-foreground">
                  <GraduationCap className="size-3" aria-hidden="true" />
                </span>
              </div>
              <h3 className="relative mt-4 truncate text-lg font-semibold text-foreground">{profile.user.name}</h3>
              <p className="relative mt-1.5 line-clamp-2 text-sm leading-6 text-foreground-muted">{headline}</p>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {t('instructors.profile.view')}
                <ArrowRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
              </span>
            </Card>
          </li>
        );
      })}
    </GsapReveal>
  );
}
