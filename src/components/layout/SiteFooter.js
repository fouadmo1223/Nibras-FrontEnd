import { cacheLife } from 'next/cache';
import Logo from '@/components/ui/Logo';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';
import { LanguageSegmented, ThemeSegmented } from './PreferenceMenus';
import FooterAccountLinks from './FooterAccountLinks';
import { NAV_ITEMS } from './nav-items';

async function currentYear() {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

export default async function SiteFooter() {
  const { t, locale } = await getI18n();
  const year = await currentYear();
  const heading = 'text-xs font-medium uppercase tracking-wider text-foreground-subtle';
  const link = 'text-sm text-foreground-muted transition-colors hover:text-foreground';

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:px-10">
        <div>
          <Logo markClassName="size-7" wordClassName="text-xl" lang={locale} />
          <p className="mt-4 max-w-xs text-sm leading-6 text-foreground-muted">{t('footer.about')}</p>
        </div>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className={heading}>
            {t('footer.explore')}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_ITEMS.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className={link}>
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-account">
          <h2 id="footer-account" className={heading}>
            {t('footer.account')}
          </h2>
          <FooterAccountLinks className="mt-4 space-y-2.5" linkClassName={link} />
        </nav>

        <div>
          <h2 className={heading}>{t('footer.preferences')}</h2>
          <div className="mt-4 flex flex-col items-start gap-3">
            <LanguageSegmented />
            <ThemeSegmented />
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-foreground-subtle sm:px-6 lg:px-10">
          {t('footer.rights', { year })}
        </p>
      </div>
    </footer>
  );
}
