#!/usr/bin/env ts-node
/**
 * Sync Translation Files from API Data
 *
 * This script generates locales/{locale}/locations.json and roles.json
 * for all 7 supported languages by extracting translations from the
 * prepare-api-data.ts migration script (single source of truth).
 *
 * Run: npx ts-node scripts/sync-translations-from-api-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Type definitions
type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';

interface LocalizedNames {
  en: string;
  th: string;
  zh: string;
  hi: string;
  es: string;
  fr: string;
  ar: string;
}

interface Role {
  id: string;
  names: LocalizedNames;
}

interface Location {
  id: string;
  names: LocalizedNames;
  roles: Role[];
  imageUrl?: string;
}

interface APIResponse {
  version: string;
  timestamp: string;
  locations: Location[];
}

const LOCALES: LocaleCode[] = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'];
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Load API-ready data (output from prepare-api-data.ts)
 */
function loadApiData(): Location[] {
  const apiDataPath = path.join(PROJECT_ROOT, 'data/migration/locations-api-ready.json');

  if (!fs.existsSync(apiDataPath)) {
    console.error('❌ Error: locations-api-ready.json not found');
    console.error('   Run: npx ts-node data/migration/prepare-api-data.ts');
    process.exit(1);
  }

  const content = fs.readFileSync(apiDataPath, 'utf-8');
  const apiResponse: APIResponse = JSON.parse(content);
  return apiResponse.locations;
}

/**
 * Extract location translations for a specific locale
 */
function extractLocationTranslations(
  locations: Location[],
  locale: LocaleCode
): Record<string, string> {
  const translations: Record<string, string> = {};

  locations.forEach((location) => {
    translations[location.id] = location.names[locale];
  });

  return translations;
}

/**
 * Extract role translations for a specific locale
 */
function extractRoleTranslations(
  locations: Location[],
  locale: LocaleCode
): Record<string, string> {
  const translations: Record<string, string> = {};

  locations.forEach((location) => {
    location.roles.forEach((role) => {
      translations[role.id] = role.names[locale];
    });
  });

  return translations;
}

/**
 * Ensure locale directory exists
 */
function ensureLocaleDir(locale: LocaleCode): string {
  const localeDir = path.join(PROJECT_ROOT, `locales/${locale}`);

  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
    console.log(`📁 Created directory: locales/${locale}/`);
  }

  return localeDir;
}

/**
 * Write translations to JSON file
 */
function writeTranslations(
  locale: LocaleCode,
  type: 'locations' | 'roles',
  translations: Record<string, string>
): void {
  const localeDir = ensureLocaleDir(locale);
  const filePath = path.join(localeDir, `${type}.json`);

  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n', 'utf-8');

  const count = Object.keys(translations).length;
  console.log(`✓ locales/${locale}/${type}.json (${count} entries)`);
}

/**
 * Validate that all locales have consistent keys
 */
function validateConsistency(
  localeTranslations: Map<LocaleCode, Record<string, string>>,
  type: 'locations' | 'roles'
): boolean {
  const locales = Array.from(localeTranslations.keys());
  const referenceKeys = Object.keys(localeTranslations.get(locales[0])!).sort();

  let hasErrors = false;

  for (let i = 1; i < locales.length; i++) {
    const currentKeys = Object.keys(localeTranslations.get(locales[i])!).sort();

    if (JSON.stringify(referenceKeys) !== JSON.stringify(currentKeys)) {
      console.error(`\n⚠️  Warning: ${type} key mismatch between ${locales[0]} and ${locales[i]}`);

      const missing = referenceKeys.filter((k) => !currentKeys.includes(k));
      const extra = currentKeys.filter((k) => !referenceKeys.includes(k));

      if (missing.length > 0) {
        console.error(
          `   Missing in ${locales[i]}: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`
        );
      }
      if (extra.length > 0) {
        console.error(
          `   Extra in ${locales[i]}: ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? '...' : ''}`
        );
      }

      hasErrors = true;
    }
  }

  return !hasErrors;
}

/**
 * Main sync function
 */
function syncTranslations(): void {
  console.log('🚀 Syncing translations from API data...\n');

  // Load source data
  console.log('📂 Loading API-ready data...');
  const locations = loadApiData();
  console.log(`✓ Loaded ${locations.length} locations\n`);

  // Extract translations for all locales
  const locationTranslations = new Map<LocaleCode, Record<string, string>>();
  const roleTranslations = new Map<LocaleCode, Record<string, string>>();

  LOCALES.forEach((locale) => {
    locationTranslations.set(locale, extractLocationTranslations(locations, locale));
    roleTranslations.set(locale, extractRoleTranslations(locations, locale));
  });

  // Validate consistency
  console.log('🔍 Validating key consistency...');
  const locationsValid = validateConsistency(locationTranslations, 'locations');
  const rolesValid = validateConsistency(roleTranslations, 'roles');

  if (locationsValid && rolesValid) {
    console.log('✓ All locales have consistent keys\n');
  } else {
    console.log('\n⚠️  Proceeding despite validation warnings...\n');
  }

  // Write location translations
  console.log('💾 Writing location translations...');
  LOCALES.forEach((locale) => {
    writeTranslations(locale, 'locations', locationTranslations.get(locale)!);
  });

  // Write role translations
  console.log('\n💾 Writing role translations...');
  LOCALES.forEach((locale) => {
    writeTranslations(locale, 'roles', roleTranslations.get(locale)!);
  });

  // Summary
  const totalLocations = Object.keys(locationTranslations.get('en')!).length;
  const totalRoles = Object.keys(roleTranslations.get('en')!).length;

  console.log('\n✅ Sync complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  - Languages: ${LOCALES.length} (${LOCALES.join(', ')})`);
  console.log(`  - Locations: ${totalLocations} per language`);
  console.log(`  - Roles: ${totalRoles} per language`);
  console.log(
    `  - Files generated: ${LOCALES.length * 2} (${LOCALES.length} × locations.json + ${LOCALES.length} × roles.json)`
  );
  console.log(`\n💡 Next steps:`);
  console.log(`  1. Review generated files in locales/{locale}/`);
  console.log(`  2. Verify translations are correct`);
  console.log(`  3. Commit changes to git`);
}

// Run sync
if (require.main === module) {
  try {
    syncTranslations();
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

export { syncTranslations };
