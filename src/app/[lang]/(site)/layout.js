import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

/** Pages with the site chrome: sticky header, content, footer. */
export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
