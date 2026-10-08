import { Suspense } from 'react';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

/**
 * Pages with the site chrome: a fixed, faint grid across the whole background, the floating
 * header, content, and the footer. The grid is decorative and sits behind everything.
 */
export default function SiteLayout({ children }) {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_80%)]" />
      {/* SiteHeader reads usePathname; wrapped so routes with dynamic, unlisted params (e.g.
          /instructors/[id] before it's prerendered) can still build a static shell around it. */}
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col pt-24 outline-none">
        {children}
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  );
}
