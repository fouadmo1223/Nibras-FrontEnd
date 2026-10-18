import { Suspense } from 'react';
import MobileTabBar from '@/components/layout/MobileTabBar';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

/**
 * Pages with the site chrome: a fixed, faint dot grid across the whole background, the
 * floating header, content, and the footer. The grid is decorative and sits behind everything.
 */
export default function SiteLayout({ children }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.1] [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_70%,transparent)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_75%)]"
      />
      {/* SiteHeader reads usePathname; wrapped so routes with dynamic, unlisted params (e.g.
          /instructors/[id] before it's prerendered) can still build a static shell around it. */}
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col pt-24 pb-20 outline-none lg:pb-0">
        {children}
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
      <Suspense fallback={null}>
        <MobileTabBar />
      </Suspense>
    </>
  );
}
