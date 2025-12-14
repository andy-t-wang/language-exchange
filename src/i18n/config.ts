export const locales = ['en', 'th', 'es', 'fr', 'ja', 'ko', 'zh', 'pt', 'id'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  ko: '한국어',
  zh: '简体中文',
  pt: 'Português',
  id: 'Bahasa Indonesia',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  th: '🇹🇭',
  es: '🇪🇸',
  fr: '🇫🇷',
  ja: '🇯🇵',
  ko: '🇰🇷',
  zh: '🇨🇳',
  pt: '🇧🇷',
  id: '🇮🇩',
};
