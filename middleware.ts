// Next.js Middleware for i18n Locale Routing

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALE_CODES, DEFAULT_LOCALE } from './lib/i18n/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = LOCALE_CODES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect to default locale if no locale in pathname
  // Try to detect locale from cookie or Accept-Language header
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const acceptLanguage = request.headers.get('accept-language');

  let locale = DEFAULT_LOCALE;

  // Check cookie first
  if (cookieLocale && (LOCALE_CODES as readonly string[]).includes(cookieLocale)) {
    locale = cookieLocale as typeof DEFAULT_LOCALE;
  }
  // Then check Accept-Language header
  else if (acceptLanguage) {
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();

    if ((LOCALE_CODES as readonly string[]).includes(preferredLang)) {
      locale = preferredLang as typeof DEFAULT_LOCALE;
    }
  }

  // Redirect to localized path
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Match all pathnames except:
    // - api routes
    // - _next (Next.js internals)
    // - static files
    '/((?!api|_next|.*\\..*).*)',
  ],
};
