import { Suspense } from 'react';
import ApiStatus, { ApiStatusSkeleton } from '@/components/sections/ApiStatus';
import AuthNav from '@/components/layout/AuthNav';
import Logo from '@/components/ui/Logo';

const SWATCHES = [
  { name: 'Primary', className: 'bg-primary' },
  { name: 'Secondary', className: 'bg-secondary' },
  { name: 'Success', className: 'bg-success' },
  { name: 'Warning', className: 'bg-warning' },
  { name: 'Error', className: 'bg-error' },
  { name: 'Surface', className: 'bg-surface-muted' },
];

/**
 * Phase 1 foundation page: verifies the design tokens render and that the
 * website can reach the NestJS API. Replaced by the real homepage in Phase 4.
 */
export default function FoundationPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20">
      <div className="mb-12 flex items-center justify-between gap-4">
        <Logo />
        <AuthNav />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground-subtle">Phase 1 · Foundation</p>
      <h1 className="mt-5 max-w-3xl font-display text-5xl text-foreground sm:text-6xl">
        Learning, <em className="text-primary">crafted</em> with care.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-foreground-muted">
        The website, dashboard, mobile app and API are bootstrapped on a shared design system. This page
        confirms the tokens and the API connection before feature work begins.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <section
          aria-labelledby="status-heading"
          className="rounded-xl border border-border bg-surface p-6 shadow-elevation-1"
        >
          <h2 id="status-heading" className="text-sm font-medium text-foreground">
            NestJS API
          </h2>
          <div className="mt-5">
            <Suspense fallback={<ApiStatusSkeleton />}>
              <ApiStatus />
            </Suspense>
          </div>
        </section>

        <section
          aria-labelledby="tokens-heading"
          className="rounded-xl border border-border bg-surface p-6 shadow-elevation-1"
        >
          <h2 id="tokens-heading" className="text-sm font-medium text-foreground">
            Design tokens
          </h2>
          <ul className="mt-5 grid grid-cols-3 gap-3">
            {SWATCHES.map((s) => (
              <li key={s.name}>
                <span className={`block h-12 rounded-md border border-border ${s.className}`} />
                <span className="mt-1.5 block text-xs text-foreground-muted">{s.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
