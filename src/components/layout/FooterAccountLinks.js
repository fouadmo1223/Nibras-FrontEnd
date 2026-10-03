'use client';

import { useSession } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';

/** Account links depend on the session, so they render on the client. */
export default function FooterAccountLinks({ className, linkClassName }) {
  const { t } = useI18n();
  const session = useSession();
  const links = session.data
    ? [{ href: '/account', label: t('nav.account') }]
    : [
        { href: '/login', label: t('nav.signIn') },
        { href: '/register', label: t('nav.getStarted') },
      ];
  return (
    <ul className={className}>
      {links.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={linkClassName}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
