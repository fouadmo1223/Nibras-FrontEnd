import { Suspense } from 'react';
import CertificateVerifyView from '@/components/sections/CertificateVerifyView';
import SectionErrorBoundary from '@/components/ui/SectionErrorBoundary';

function VerifySkeleton() {
  return <div className="mx-auto h-64 max-w-lg animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />;
}

// Await `params` inside the Suspense boundary (not here), so the shared layout's shell
// (header, footer) can still prerender around this dynamic page — see ADR-025.
export default function VerifyPage({ params }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-10">
      <SectionErrorBoundary>
        <Suspense fallback={<VerifySkeleton />}>
          <CertificateVerifyView params={params} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
