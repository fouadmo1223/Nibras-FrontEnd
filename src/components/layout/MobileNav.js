'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu as MenuIcon, X } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';
import { splitLocale } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { LanguageSegmented, ThemeSegmented } from './PreferenceMenus';
import { isActivePath, NAV_ITEMS } from './nav-items';

/**
 * Small-screen navigation: a side sheet on the native <dialog> (focus trap, Esc,
 * inert page). It slides in from the inline-end edge, so it mirrors in Arabic.
 */
export default function MobileNav({ session }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const current = splitLocale(pathname).path;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Close after navigating (including a language switch, which changes the path).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const user = session?.user;
  const linkClass = (active) =>
    cn(
      'flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors',
      active ? 'bg-primary-soft text-primary' : 'text-foreground hover:bg-surface-muted',
    );
  const accountActive = isActivePath(current, '/account');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('common.openMenu')}
        aria-expanded={open}
        className="inline-grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-surface-muted lg:hidden"
      >
        <MenuIcon className="size-5" aria-hidden="true" />
      </button>

      <dialog
        ref={ref}
        aria-label={t('nav.main')}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClick={(event) => event.target === ref.current && setOpen(false)}
        className="fixed inset-y-0 start-auto end-0 m-0 h-dvh max-h-dvh w-[min(22rem,88vw)] max-w-none bg-surface p-0 text-foreground shadow-elevation-3 backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-sheet-in rtl:open:animate-sheet-in-rtl"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Logo markClassName="size-7" wordClassName="text-xl" lang={locale} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('common.closeMenu')}
              className="inline-grid size-10 place-items-center rounded-full text-foreground-muted hover:bg-surface-muted hover:text-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label={t('nav.main')} className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
                const active = isActivePath(current, href);
                return (
                  <li key={key}>
                    <Link href={href} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                      <Icon className="size-5" aria-hidden="true" />
                      {t(`nav.${key}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 border-t border-border pt-4">
              {user ? (
                <Link href="/account" aria-current={accountActive ? 'page' : undefined} className={linkClass(accountActive)}>
                  <Avatar user={user} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-sm font-normal text-foreground-subtle">{t('nav.account')}</span>
                  </span>
                </Link>
              ) : (
                <div className="grid gap-2 px-1">
                  <Link
                    href="/register"
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground hover:bg-primary-hover"
                  >
                    {t('nav.getStarted')}
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-border-strong px-4 font-medium text-foreground hover:bg-surface-muted"
                  >
                    {t('nav.signIn')}
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <div className="space-y-4 border-t border-border px-5 py-5">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground-subtle">{t('language.label')}</p>
              <LanguageSegmented />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground-subtle">{t('theme.label')}</p>
              <ThemeSegmented />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
