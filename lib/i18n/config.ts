// Locale Configuration for Multi-Language Support

import type { Locale, LocaleCode } from './types';

export const SUPPORTED_LOCALES: Locale[] = [
  {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'th',
    name: 'Thai',
    direction: 'ltr',
    nativeName: 'ไทย',
    flag: '🇹🇭',
  },
  {
    code: 'zh',
    name: 'Chinese',
    direction: 'ltr',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  {
    code: 'hi',
    name: 'Hindi',
    direction: 'ltr',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
  },
  {
    code: 'es',
    name: 'Spanish',
    direction: 'ltr',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
  {
    code: 'fr',
    name: 'French',
    direction: 'ltr',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'ar',
    name: 'Arabic',
    direction: 'rtl',
    nativeName: 'العربية',
    flag: '🇸🇦',
  },
];

export const DEFAULT_LOCALE: LocaleCode = 'th'; // Thai as default per spec
export const FALLBACK_LOCALE: LocaleCode = 'en'; // English as fallback

export const LOCALE_CODES = SUPPORTED_LOCALES.map((locale) => locale.code);

export function isValidLocale(code: string): code is LocaleCode {
  return LOCALE_CODES.includes(code as LocaleCode);
}

export function getLocaleByCode(code: LocaleCode): Locale | undefined {
  return SUPPORTED_LOCALES.find((locale) => locale.code === code);
}

export function getLocaleDirection(code: LocaleCode): 'ltr' | 'rtl' {
  const locale = getLocaleByCode(code);
  return locale?.direction || 'ltr';
}
