import { notFound } from 'next/navigation';
import { Globe, Link as LinkIcon, X as XIcon } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
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
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-6 sm:text-start">
        <Avatar user={profile.user} size="xl" />
        <div className="mt-5 sm:mt-0">
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">{profile.user.name}</h1>
          {headline ? <p className="mt-2 text-lg text-foreground-muted">{headline}</p> : null}
          {links.length > 0 ? (
            <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
              {links.map(({ key, icon: Icon, labelKey }) => (
                <a
                  key={key}
                  href={profile[key]}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={t(labelKey)}
                  className="grid size-10 place-items-center rounded-lg border border-border text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground"
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {bio ? (
        <div className="mt-10 border-t border-border pt-8">
          <p className="whitespace-pre-line leading-8 text-foreground-muted">{bio}</p>
        </div>
      ) : null}
    </>
  );
}
