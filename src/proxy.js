import { NextResponse } from 'next/server';
import { isLocale, LOCALE_COOKIE, negotiateLocale } from '@/i18n/config';

/**
 * 1. Language routing: every page lives under /{locale}. Locale-less URLs redirect to
 *    the remembered language (cookie), else the browser's Accept-Language, else English.
 * 2. Optimistic auth routing: the API sets a non-sensitive `nb_session=1` hint cookie
 *    alongside the HttpOnly auth cookies. Real authorization is always enforced by the API.
 */
const SESSION_HINT = 'nb_session';
const PROTECTED = ['/account'];
const GUEST_ONLY = ['/login', '/register'];
const YEAR = 60 * 60 * 24 * 365;

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const [, segment] = pathname.split('/');

  if (!isLocale(segment)) {
    const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(remembered) ? remembered : negotiateLocale(request.headers.get('accept-language'));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = segment;
  const path = pathname.slice(locale.length + 1) || '/';
  const signedIn = request.cookies.get(SESSION_HINT)?.value === '1';

  let response;
  if (!signedIn && PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set('next', `${pathname}${search}`);
    response = NextResponse.redirect(url);
  } else if (signedIn && GUEST_ONLY.includes(path)) {
    response = NextResponse.redirect(new URL(`/${locale}/account`, request.url));
  } else {
    response = NextResponse.next();
  }

  // Visiting a language counts as choosing it.
  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: YEAR, sameSite: 'lax' });
  }
  return response;
}

export const config = {
  // Everything except Next internals, API routes and files with an extension (icons, manifest, robots…).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
