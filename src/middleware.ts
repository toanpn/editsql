import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  let locale = defaultLocale;
  const hasLocale = locales.some(
    (loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`
  );

  if (!hasLocale) {
    try {
      const detectedLocale = await detectLocaleFromIP(request);
      if (detectedLocale && locales.includes(detectedLocale as any)) {
        locale = detectedLocale as any;
      }
    } catch (error) {
      console.error('Failed to detect locale from IP:', error);
    }

    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && locales.includes(cookieLocale as any)) {
      locale = cookieLocale as any;
    }
  }

  const response = intlMiddleware(request);
  
  if (response) {
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 365 * 24 * 60 * 60,
      path: '/'
    });
  }
  
  return response;
}

async function detectLocaleFromIP(request: NextRequest): Promise<string> {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIP || '';

  if (!ip || ip === '127.0.0.1' || ip === '::1') {
    return defaultLocale;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(2000)
    });
    
    if (!response.ok) {
      return defaultLocale;
    }

    const data = await response.json();
    const countryCode = data.countryCode?.toLowerCase();

    const countryToLocale: Record<string, string> = {
      'cn': 'zh',
      'tw': 'zh',
      'hk': 'zh',
      'ru': 'ru',
      'by': 'ru',
      'kz': 'ru',
      'ua': 'ru',
      'vn': 'vi',
      'de': 'de',
      'at': 'de',
      'ch': 'de',
    };

    return countryToLocale[countryCode] || defaultLocale;
  } catch (error) {
    return defaultLocale;
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)']
};

