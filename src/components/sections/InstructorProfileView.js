import { notFound } from 'next/navigation';
import { Globe, GraduationCap, Link as LinkIcon, X as XIcon } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
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
  const [{ t, locale }, profile] = await Promise.all([getI18n(), getInstructorProfile(id)]);
  if (!profile) notFound();

  const headline = locale === 'ar' ? profile.headlineAr : profile.headlineEn;
  const bio = locale === 'ar' ? profile.bioAr : profile.bioEn;
  const links = LINKS.filter((l) => profile[l.key]);

  return (
    <>
      <Card variant="glass" className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-7 sm:p-10 sm:text-start">
        <div className="relative shrink-0">
          <div aria-hidden="true" className="absolute inset-0 -z-10 m-auto size-28 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--secondary)_35%,transparent),transparent_75%)] blur-xl" />
          <Avatar user={profile.user} size="xl" />
          <span className="absolute -bottom-1 -end-1 grid size-7 place-items-center rounded-full border-2 border-surface bg-primary text-primary-foreground">
            <GraduationCap className="size-3.5" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-5 sm:mt-0">
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">{profile.user.name}</h1>
          {headline ? <p className="mt-2 text-lg text-foreground-muted">{headline}</p> : null}
          {links.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
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
        </div>
      </Card>

      {bio ? (
        <Card variant="default" className="mt-6">
          <p className="whitespace-pre-line leading-8 text-foreground-muted">{bio}</p>
        </Card>
      ) : null}
    </>
  );
}
