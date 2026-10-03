'use client';

import { createContext, use, useMemo } from 'react';
import { brand } from '@/constants/brand';
import { dirOf } from './config';
import { createFormatters } from './format';
import { createTranslator } from './translator';

const I18nContext = createContext(null);

/** Makes the route's dictionary, `t` and formatters available to client components. */
export default function I18nProvider({ locale, messages, fallback, children }) {
  const value = useMemo(() => {
    const base = createTranslator(locale, messages, fallback);
    const brandParams = { brand: locale === 'ar' ? brand.nameAr : brand.name, tagline: brand.tagline[locale] };
    return {
      locale,
      dir: dirOf(locale),
      t: (key, params) => base(key, { ...brandParams, ...params }),
      format: createFormatters(locale),
    };
  }, [locale, messages, fallback]);
  return <I18nContext value={value}>{children}</I18nContext>;
}

/** `{ locale, dir, t, format }` for the current page. */
export function useI18n() {
  const value = use(I18nContext);
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>');
  return value;
}
