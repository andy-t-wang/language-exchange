import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,th;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Get base language code (e.g., "en" from "en-US")
        q: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  // Find the first matching locale
  for (const lang of languages) {
    if (locales.includes(lang.code as Locale)) {
      return lang.code as Locale;
    }
  }

  return null;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;

  let locale: Locale = defaultLocale;

  // First priority: user's saved preference in cookie
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  } else {
    // Second priority: browser's Accept-Language header
    const acceptLanguage = headerStore.get('Accept-Language');
    const detectedLocale = getLocaleFromAcceptLanguage(acceptLanguage);
    if (detectedLocale) {
      locale = detectedLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
