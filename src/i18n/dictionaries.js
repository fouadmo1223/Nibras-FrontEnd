import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { brand } from '@/constants/brand';
import { createFormatters } from './format';
import { isLocale } from './config';
import { createTranslator } from './translator';

const dictionaries = {
  en: () => import('./messages/en.json').then((m) => m.default),
  ar: () => import('./messages/ar.json').then((m) => m.default),
};

/** Locale of the current route (the root `[lang]` segment); 404s for anything unsupported. */
export async function getLocale() {
  const locale = await lang();
  if (!isLocale(locale)) notFound();
  return locale;
}

export const getMessages = async (locale) => dictionaries[locale]();

/**
 * Server-side `t` for the current route, with brand placeholders pre-filled:
 * `const { t } = await getI18n(); t('nav.home')`.
 */
export async function getI18n() {
  const locale = await getLocale();
  const [messages, fallback] = await Promise.all([getMessages(locale), locale === 'en' ? null : getMessages('en')]);
  const base = createTranslator(locale, messages, fallback);
  const brandParams = { brand: locale === 'ar' ? brand.nameAr : brand.name, tagline: brand.tagline[locale] };
  const t = (key, params) => base(key, { ...brandParams, ...params });
  return { locale, messages, t, format: createFormatters(locale) };
}
