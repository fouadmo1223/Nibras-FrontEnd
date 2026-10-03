import { LOCALES, localizePath } from '@/i18n/config';
import { env } from '@/lib/env';

/** Public, indexable pages in every language, cross-linked with hreflang alternates. */
const PUBLIC_PATHS = ['/'];

export default function sitemap() {
  return PUBLIC_PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: new URL(localizePath(locale, path), env.siteUrl).toString(),
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, new URL(localizePath(l, path), env.siteUrl).toString()])) },
    })),
  );
}
