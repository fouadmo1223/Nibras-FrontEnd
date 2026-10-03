import Logo from '@/components/ui/Logo';
import { LanguageMenu, ThemeMenu } from '@/components/layout/PreferenceMenus';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import AuthShowcase from './AuthShowcase';

/**
 * Two halves on desktop: the form, and an animated brand illustration that
 * stays pinned while the form scrolls. Mobile shows the form only.
 */
export default async function AuthShell({ title, subtitle, children, footer }) {
  const { t, locale } = await getI18n();
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="rounded-md" aria-label={t('common.brandHome')}>
            <Logo markClassName="size-7" wordClassName="text-xl" lang={locale} />
          </Link>
          <div className="flex items-center gap-0.5">
            <LanguageMenu />
            <ThemeMenu />
          </div>
        </div>

        <main id="main" className="animate-fade-up mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[2.15rem] leading-tight tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-foreground-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-foreground-muted">{footer}</div>}
        </main>

        <p className="text-xs text-foreground-subtle">{t('meta.title')}</p>
      </div>

      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        <AuthShowcase />
      </div>
    </div>
  );
}
