import { NextResponse } from 'next/server';

/**
 * Optimistic routing only: the API sets a non-sensitive `nb_session=1` hint
 * cookie alongside the HttpOnly auth cookies. Its presence decides redirects;
 * real authorization is always enforced by the API.
 */
const SESSION_HINT = 'nb_session';
const PROTECTED = ['/account'];
const GUEST_ONLY = ['/login', '/register'];

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const signedIn = request.cookies.get(SESSION_HINT)?.value === '1';

  if (!signedIn && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  if (signedIn && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL('/account', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/login', '/register'],
};
