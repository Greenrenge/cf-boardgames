// i18n Type Definitions for Multi-Language Support

export type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';
export type TextDirection = 'ltr' | 'rtl';
export type NamespaceKey = 'common' | 'locations' | 'roles' | 'errors' | 'gameplay';
export type PreferenceSource = 'user-selected' | 'browser-detected' | 'default';

export interface Locale {
  code: LocaleCode;
  name: string;
  direction: TextDirection;
  nativeName: string;
  flag: string;
}

export interface TranslationNamespace {
  key: NamespaceKey;
  loadStrategy: 'preload' | 'lazy';
  estimatedSize: number;
}

export interface Translation {
  key: string;
  value: string;
  locale: LocaleCode;
  parameters?: string[];
}

export interface LocationTranslation {
  locationId: string;
  name: string;
  locale: LocaleCode;
}

export interface RoleTranslation {
  locationId: string;
  roles: [string, string, string, string, string, string, string];
  locale: LocaleCode;
}

export interface UserLanguagePreference {
  locale: LocaleCode;
  source: PreferenceSource;
  timestamp: number;
}

// Translation file structures (JSON schemas)
export interface CommonTranslations {
  button: Record<string, string>;
  label: Record<string, string>;
  heading: Record<string, string>;
  message: Record<string, string>;
}

export interface LocationsTranslations {
  [locationId: string]: {
    name: string;
  };
}

export interface RolesTranslations {
  [locationId: string]: {
    roles: [string, string, string, string, string, string, string];
  };
}

export interface ErrorsTranslations {
  room: Record<string, string>;
  player: Record<string, string>;
  game: Record<string, string>;
  network: Record<string, string>;
}

export interface GameplayTranslations {
  spy: Record<string, string>;
  nonSpy: Record<string, string>;
  voting: Record<string, string>;
  results: Record<string, string>;
}
