import { notFound } from 'next/navigation';
import { BookOpen, Globe, GraduationCap, Link as LinkIcon, X as XIcon } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import CourseCard from '@/components/ui/CourseCard';
import { getI18n } from '@/i18n/dictionaries';
import { getInstructorProfile } from '@/services/instructors.service';

const LINKS = [
  { key: 'websiteUrl', icon: Globe, labelKey: 'instructors.profile.website' },
  { key: 'linkedinUrl', icon: LinkIcon, labelKey: 'instructors.profile.linkedin' },
  { key: 'xUrl', icon: XIcon, labelKey: 'instructors.profile.x' },
];

/** Fetches and renders one instructor's public profile; 404s if it doesn't exist or isn't published. */
export default async function InstructorProfileView({ params }) {
  const { id } = await params;
  const [{ t, locale, format }, profile] = await Promise.all([getI18n(), getInstructorProfile(id)]);
  if (!profile) notFound();

  const headline = locale === 'ar' ? profile.headlineAr : profile.headlineEn;
  const bio = locale === 'ar' ? profile.bioAr : profile.bioEn;
  const links = LINKS.filter((l) => profile[l.key]);

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr] lg:items-start">
      <Card variant="glass" className="flex flex-col items-center p-8 text-center lg:sticky lg:top-24 lg:p-9">
        <div className="relative shrink-0">
          <div aria-hidden="true" className="absolute inset-0 -z-10 m-auto size-32 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--secondary)_35%,transparent),transparent_75%)] blur-xl" />
          <Avatar user={profile.user} size="xl" />
          <span className="absolute -bottom-1 -end-1 grid size-7 place-items-center rounded-full border-2 border-surface bg-primary text-primary-foreground">
            <GraduationCap className="size-3.5" aria-hidden="true" />
          </span>
        </div>
        <h1 className="mt-5 font-display text-2xl tracking-tight text-foreground sm:text-3xl">{profile.user.name}</h1>
        {headline ? <p className="mt-2 text-base text-foreground-muted">{headline}</p> : null}

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
          <BookOpen className="size-3.5" aria-hidden="true" />
          {t('instructors.profile.courseCount', { count: profile.courses.length })}
        </span>

        {links.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {links.map(({ key, icon: Icon, labelKey }) => (
              <a
                key={key}
                href={profile[key]}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={t(labelKey)}
                className="grid size-10 place-items-center rounded-xl border border-border bg-surface text-foreground-muted shadow-elevation-1 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-elevation-2"
              >
                <Icon className="size-[18px]" aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : null}

        {bio ? (
          <p className="mt-7 whitespace-pre-line text-start text-sm leading-7 text-foreground-muted">{bio}</p>
        ) : null}
      </Card>

      <section>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{t('instructors.profile.coursesTitle', { name: profile.user.name })}</h2>
        {profile.courses.length === 0 ? (
          <Card variant="dashed" className="mt-5 p-8 text-center text-sm text-foreground-muted">
            {t('instructors.profile.coursesEmpty')}
          </Card>
        ) : (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2">
            {profile.courses.map((course) => (
              <CourseCard key={course.id} course={course} locale={locale} t={t} format={format} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
