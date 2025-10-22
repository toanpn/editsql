export const locales = ['en', 'zh', 'ru', 'vi', 'de'] as const;
export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  ru: '🇷🇺',
  vi: '🇻🇳',
  de: '🇩🇪',
};

export const defaultLocale: Locale = 'en';

