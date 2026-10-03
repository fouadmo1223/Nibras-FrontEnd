import { DEFAULT_LOCALE, LOCALES, localizePath } from './config';

/**
 * Canonical URL plus hreflang links for an indexable page, e.g.
 * languageAlternates('ar', '/courses') → canonical /ar/courses, en + ar + x-default.
 */
export function languageAlternates(locale, path) {
  return {
    canonical: localizePath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, path)])),
      'x-default': localizePath(DEFAULT_LOCALE, path),
    },
  };
}
