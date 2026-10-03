/** Supported languages. Every route lives under /{locale}/… (see proxy.js). */
export const LOCALES = ['en', 'ar'];
export const DEFAULT_LOCALE = 'en';
/** Remembers an explicit language choice across visits (set by the proxy and the language switcher). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_META = {
  en: { label: 'English', short: 'EN', dir: 'ltr', ogLocale: 'en_US' },
  ar: { label: 'العربية', short: 'ع', dir: 'rtl', ogLocale: 'ar_AR' },
};

export const isLocale = (value) => LOCALES.includes(value);
export const dirOf = (locale) => LOCALE_META[locale]?.dir ?? 'ltr';

/**
 * Best supported locale from an Accept-Language header (q-values respected,
 * regional tags fall back to their language: ar-EG → ar).
 */
export function negotiateLocale(header) {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const quality = q ? Number(q.slice(2)) : 1;
      return { language: tag.split('-')[0], quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  return ranked.find((entry) => isLocale(entry.language))?.language ?? DEFAULT_LOCALE;
}

/** `/account` → `/ar/account`; external and already-localized paths pass through. */
export function localizePath(locale, path = '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const [first] = path.split(/[/?#]/).filter(Boolean);
  if (isLocale(first)) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/** `/ar/account?x=1` → `{ locale: 'ar', path: '/account?x=1' }` */
export function splitLocale(pathname) {
  const match = /^\/([^/?#]+)(.*)$/.exec(pathname);
  if (match && isLocale(match[1])) return { locale: match[1], path: match[2] || '/' };
  return { locale: null, path: pathname };
}

/** Same page in another language: `/en/account?x=1` → `/ar/account?x=1`. */
export const switchLocalePath = (pathname, locale) => localizePath(locale, splitLocale(pathname).path);
