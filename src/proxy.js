import { NextResponse } from 'next/server';
import { isLocale, LOCALE_COOKIE, negotiateLocale } from '@/i18n/config';

/**
 * Language routing: every page lives under /{locale}. Locale-less URLs redirect to the
 * remembered language (cookie), else the browser's Accept-Language, else English.
 *
 * This used to also do "optimistic auth routing" (redirect /account <-> /login server-side
 * based on a non-sensitive `nb_session=1` hint cookie set alongside the real auth cookies).
 * That hint cookie no longer exists — auth is entirely token-transport now (see
 * token-storage.js for why: the website, dashboard and API are three separate origins with
 * no shared parent domain, so cookie auth can't work here at all), with no server-readable
 * signal of sign-in state at all. RequireSession / AccountView already handle this client-side
 * (redirect once the real session is known), and the API independently enforces real auth
 * regardless — so this was always a UX nicety, never the actual security boundary, and middleware
 * unconditionally treating every visitor as signed-out would just break access to /account.
 */
const YEAR = 60 * 60 * 24 * 365;

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const [, segment] = pathname.split('/');

  if (!isLocale(segment)) {
    const remembered = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(remembered) ? remembered : negotiateLocale(request.headers.get('accept-language'));
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  const locale = segment;
  const response = NextResponse.next();

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
