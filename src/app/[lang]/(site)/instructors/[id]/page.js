import { Suspense } from 'react';
import InstructorProfileView from '@/components/sections/InstructorProfileView';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';
import { getInstructorProfile } from '@/services/instructors.service';

// No generateStaticParams: no instructors are published yet, and Cache Components requires at
// least one real param to prerender. Every visit renders on request until that changes — revisit
// once instructor data exists, returning real published ids (see ADR for Cache Components rules).

export async function generateMetadata({ params }) {
  const { id } = await params;
  const profile = await getInstructorProfile(id);
  if (!profile) return {};
  return { title: profile.user.name, description: profile.headlineEn || profile.headlineAr || undefined };
}

function ProfileSkeleton() {
  return (
    <div className="glass flex flex-col items-center rounded-3xl border p-8 shadow-elevation-3 sm:flex-row sm:items-start sm:gap-6 sm:p-10" aria-hidden="true">
      <div className="size-24 animate-pulse rounded-full bg-surface-muted" />
      <div className="mt-5 w-full max-w-sm space-y-3 sm:mt-0">
        <div className="h-8 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-5 w-2/3 animate-pulse rounded-md bg-surface-muted" />
      </div>
    </div>
  );
}

// Await `params` inside the Suspense boundary (not here), so the shared layout's shell
// (header, footer) can still prerender around this dynamic page.
export default function InstructorProfilePage({ params }) {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Cinematic backdrop, matching the homepage hero. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 size-[40rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)] blur-2xl" />
        <div className="absolute -right-40 top-20 size-[36rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--secondary)_18%,transparent),transparent)] blur-2xl" />
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-10">
        <SectionErrorBoundary>
          <Suspense fallback={<ProfileSkeleton />}>
            <InstructorProfileView params={params} />
          </Suspense>
        </SectionErrorBoundary>
      </div>
    </div>
  );
}
