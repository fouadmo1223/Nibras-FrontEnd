import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { localizePath, negotiateLocale, splitLocale, switchLocalePath } from './config';
import { createFormatters } from './format';
import ar from './messages/ar.json';
import en from './messages/en.json';
import { createTranslator } from './translator';

/** Leaf keys of a message catalog ("nav.home", …). */
const keys = (node, prefix = '') =>
  Object.entries(node).flatMap(([k, v]) => (typeof v === 'string' ? [`${prefix}${k}`] : keys(v, `${prefix}${k}.`)));

describe('locale helpers', () => {
  it.each([
    [null, 'en'],
    ['ar-EG,ar;q=0.9,en;q=0.8', 'ar'],
    ['fr-FR, ar;q=0.5', 'ar'],
    ['de-DE', 'en'],
  ])('negotiates %s → %s', (header, expected) => expect(negotiateLocale(header)).toBe(expected));

  it('localizes, splits and switches paths', () => {
    expect(localizePath('ar', '/')).toBe('/ar');
    expect(localizePath('ar', '/account?x=1')).toBe('/ar/account?x=1');
    expect(localizePath('ar', '/en/account')).toBe('/en/account');
    expect(localizePath('ar', 'https://example.com')).toBe('https://example.com');
    expect(splitLocale('/ar/login')).toEqual({ locale: 'ar', path: '/login' });
    expect(switchLocalePath('/en/account?welcome=1', 'ar')).toBe('/ar/account?welcome=1');
    expect(switchLocalePath('/en', 'ar')).toBe('/ar');
  });
});

describe('messages', () => {
  it('has the same keys in English and Arabic', () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });

  it('fills placeholders and falls back to English', () => {
    const t = createTranslator('ar', { greeting: 'مرحبًا {name}' }, { greeting: 'Hi {name}', only: 'English only' });
    expect(t('greeting', { name: 'ليلى' })).toBe('مرحبًا ليلى');
    expect(t('only')).toBe('English only');
    expect(t('missing.key')).toBe('missing.key');
  });

  it('picks Arabic plural forms', () => {
    const t = createTranslator('ar', { n: { one: 'درس واحد', two: 'درسان', few: '{count} دروس', many: '{count} درسًا', other: '{count} درس' } });
    expect([1, 2, 3, 11, 100].map((count) => t('n', { count }))).toEqual(['درس واحد', 'درسان', '3 دروس', '11 درسًا', '100 درس']);
  });

  it('formats numbers and currency with Western digits in Arabic', () => {
    const f = createFormatters('ar');
    expect(f.number(1234.5)).toBe('1,234.5');
    expect(f.currency(10, 'USD')).toMatch(/10\.00/);
  });
});

describe('proxy', () => {
  const run = (path, { cookie, language } = {}) => {
    const headers = new Headers();
    if (cookie) headers.set('cookie', cookie);
    if (language) headers.set('accept-language', language);
    return proxy(new NextRequest(new URL(path, 'http://localhost:3000'), { headers }));
  };

  it('redirects locale-less URLs to the remembered or preferred language', () => {
    expect(run('/', { language: 'ar,en;q=0.5' }).headers.get('location')).toBe('http://localhost:3000/ar');
    expect(run('/login?next=x', { cookie: 'NEXT_LOCALE=en', language: 'ar' }).headers.get('location')).toBe(
      'http://localhost:3000/en/login?next=x',
    );
  });

  it('remembers the language being visited', () => {
    expect(run('/ar').cookies.get('NEXT_LOCALE')?.value).toBe('ar');
  });
});
