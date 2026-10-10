import { Suspense } from 'react';
import CourseDetailView from '@/components/sections/CourseDetailView';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';
import { getCourseBySlug } from '@/services/courses.service';

// No generateStaticParams: Cache Components needs at least one real param to prerender, and
// which courses are published changes constantly. Every visit renders on request for now —
// revisit once there's a stable catalog worth prerendering.

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return { title: course.titleEn, description: course.subtitleEn || course.descriptionEn || undefined };
}

function CourseSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]" aria-hidden="true">
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-12 animate-pulse rounded-md bg-surface-muted" />
        <div className="aspect-[16/9] animate-pulse rounded-2xl bg-surface-muted" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  );
}

// Await `params` inside the Suspense boundary (not here), so the shared layout's shell
// (header, footer) can still prerender around this dynamic page.
export default function CourseDetailPage({ params }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
      <SectionErrorBoundary>
        <Suspense fallback={<CourseSkeleton />}>
          <CourseDetailView params={params} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
