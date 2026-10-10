'use client';

import { Component } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * Catches a render/fetch failure in one section of a page and shows a local, recoverable
 * fallback instead of letting it bubble up to the route's `error.js` and blank the whole
 * page. React only supports error boundaries as classes (no hook equivalent exists), so
 * this class defers its (translated) fallback UI to `SectionErrorFallback` below. Wrap it
 * around a section's `<Suspense>`, not inside it — an error thrown while that Suspense
 * boundary streams in still propagates up to the nearest ancestor error boundary.
 */
export default class SectionErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    // Next.js implements notFound()/redirect() as thrown errors carrying a special `digest`
    // (e.g. "NEXT_NOT_FOUND", "NEXT_REDIRECT;..."). Those aren't real failures — rethrowing
    // lets Next's own routing catch them and render the real not-found/redirect, instead of
    // this boundary swallowing them into a generic "section failed to load" fallback.
    if (typeof error?.digest === 'string' && (error.digest === 'NEXT_NOT_FOUND' || error.digest.startsWith('NEXT_REDIRECT'))) {
      throw error;
    }
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) return <SectionErrorFallback />;
    return this.props.children;
  }
}

function SectionErrorFallback() {
  const { t } = useI18n();
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border-strong bg-surface/70 p-10 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-error-soft text-error">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium text-foreground">{t('errorPage.sectionTitle')}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted">{t('errorPage.sectionBody')}</p>
    </div>
  );
}
