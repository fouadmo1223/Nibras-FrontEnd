import { Compass } from 'lucide-react';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.1] [background-image:radial-gradient(color-mix(in_oklab,var(--foreground)_70%,transparent)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_75%)]"
      />
      <title>{t('meta.notFound')}</title>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Compass className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 font-mono text-sm text-foreground-subtle">404</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground">{t('notFound.title')}</h1>
        <p className="mt-3 text-foreground-muted">{t('notFound.body')}</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground hover:bg-primary-hover"
        >
          {t('notFound.home')}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
