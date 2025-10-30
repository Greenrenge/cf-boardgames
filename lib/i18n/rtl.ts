// RTL (Right-to-Left) Utility Functions for Arabic Language Support

import type { LocaleCode } from './types';
import { getLocaleDirection } from './config';

/**
 * Check if a locale uses RTL (right-to-left) text direction
 */
export function isRTL(locale: LocaleCode): boolean {
  return getLocaleDirection(locale) === 'rtl';
}

/**
 * Get direction attribute value for HTML elements
 */
export function getDirectionAttr(locale: LocaleCode): 'ltr' | 'rtl' {
  return getLocaleDirection(locale);
}

/**
 * Get Tailwind CSS direction classes for RTL support
 * These classes work with the tailwindcss-rtl plugin
 */
export function getRTLClass(locale: LocaleCode, baseClass: string): string {
  if (!isRTL(locale)) return baseClass;

  // Common Tailwind class conversions for RTL
  const rtlMappings: Record<string, string> = {
    // Margins
    'ml-': 'me-',
    'mr-': 'ms-',
    // Padding
    'pl-': 'pe-',
    'pr-': 'ps-',
    // Text alignment
    'text-left': 'text-start',
    'text-right': 'text-end',
    // Flex
    'justify-start': 'justify-end',
    'justify-end': 'justify-start',
    // Positioning
    'left-': 'start-',
    'right-': 'end-',
  };

  let rtlClass = baseClass;

  for (const [ltr, rtl] of Object.entries(rtlMappings)) {
    if (baseClass.includes(ltr)) {
      rtlClass = rtlClass.replace(ltr, rtl);
    }
  }

  return rtlClass;
}

/**
 * Get CSS transform for RTL mirroring
 * Useful for icons and images that need to be flipped
 */
export function getRTLTransform(locale: LocaleCode): string {
  return isRTL(locale) ? 'scaleX(-1)' : 'none';
}

/**
 * Get flex direction for RTL
 */
export function getFlexDirection(locale: LocaleCode, isRow = true): string {
  if (!isRow) return 'flex-col';
  return isRTL(locale) ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Helper to conditionally apply RTL styles
 */
export function rtlStyle(locale: LocaleCode, ltrStyle: string, rtlStyle: string): string {
  return isRTL(locale) ? rtlStyle : ltrStyle;
}
