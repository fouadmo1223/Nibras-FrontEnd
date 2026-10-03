'use client';

import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { localizePath } from './config';
import { useI18n } from './I18nProvider';

/** next/link that keeps the current language: `<Link href="/account">` → `/ar/account`. */
export function Link({ href, ...props }) {
  const { locale } = useI18n();
  return <NextLink href={typeof href === 'string' ? localizePath(locale, href) : href} {...props} />;
}

/** useRouter whose push/replace/prefetch localize paths the same way. */
export function useLocaleRouter() {
  const router = useRouter();
  const { locale } = useI18n();
  return useMemo(
    () => ({
      ...router,
      push: (href, ...rest) => router.push(localizePath(locale, href), ...rest),
      replace: (href, ...rest) => router.replace(localizePath(locale, href), ...rest),
      prefetch: (href, ...rest) => router.prefetch(localizePath(locale, href), ...rest),
    }),
    [router, locale],
  );
}
