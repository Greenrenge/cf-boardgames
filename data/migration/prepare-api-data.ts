/**
 * Migration Script: Prepare Location Data for API
 *
 * This script combines location data from data/locations.json and translation files
 * from locales/{lang}/locations.json and locales/{lang}/roles.json into a single
 * API-ready format with embedded translations.
 *
 * Run: npx ts-node data/migration/prepare-api-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Type definitions
type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';
type LocalizedNames = Record<LocaleCode, string>;

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

// Legacy types
interface LegacyLocation {
  id: string;
  nameTh: string;
  difficulty: string;
  roles: string[];
  imageUrl: string;
}

const LOCALES: LocaleCode[] = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'];
const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Load translation JSON file
 */
function loadTranslations(locale: LocaleCode, type: 'locations' | 'roles'): Record<string, string> {
  const filePath = path.join(PROJECT_ROOT, `locales/${locale}/${type}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (_error) {
    console.warn(`Warning: Could not load ${locale}/${type}.json`);
    return {};
  }
}

/**
 * Find role key by searching in reverse (Thai value -> key)
 */
function findRoleKeyByThaiValue(roleTh: string): string {
  // Load Thai roles to find the key
  const thRoles = loadTranslations('th', 'roles');

  // Search for matching Thai value
  for (const [key, value] of Object.entries(thRoles)) {
    if (value === roleTh) {
      return key;
    }
  }

  // If not found, create a kebab-case ID from Thai text
  return `role-${roleTh
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

/**
 * Build role translation object
 */
function buildRoleTranslations(roleKey: string): LocalizedNames {
  const names: Partial<LocalizedNames> = {};

  // Load translations for all locales
  LOCALES.forEach((locale) => {
    const roleTranslations = loadTranslations(locale, 'roles');

    // Try to find translation by key
    if (roleTranslations[roleKey]) {
      names[locale] = roleTranslations[roleKey];
    } else {
      // Fallback: use role key formatted as English
      names[locale] = roleKey
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  });

  return names as LocalizedNames;
}

/**
 * Build location name translations
 */
function buildLocationTranslations(locationId: string, nameTh: string): LocalizedNames {
  const names: Partial<LocalizedNames> = {
    th: nameTh,
  };

  // Load translations for other locales
  LOCALES.forEach((locale) => {
    if (locale === 'th') return;

    const locationTranslations = loadTranslations(locale, 'locations');

    if (locationTranslations[locationId]) {
      names[locale] = locationTranslations[locationId];
    } else {
      // Fallback
      if (locale === 'en') {
        names[locale] = locationId
          .replace('loc-', '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } else {
        names[locale] = nameTh;
      }
    }
  });

  return names as LocalizedNames;
}

/**
 * Transform legacy location to new API format
 */
function transformLocation(legacy: LegacyLocation): Location {
  const locationNames = buildLocationTranslations(legacy.id, legacy.nameTh);

  const roles: Role[] = legacy.roles.map((roleTh, index) => {
    const roleKey = findRoleKeyByThaiValue(roleTh);
    const roleId = `${legacy.id}-role-${index + 1}`;

    return {
      id: roleId,
      names: buildRoleTranslations(roleKey),
    };
  });

  return {
    id: legacy.id,
    names: locationNames,
    roles,
    imageUrl: legacy.imageUrl,
  };
}

/**
 * Main migration function
 */
function migrateLocationData(): void {
  console.log('🚀 Starting location data migration...\n');

  // Load source location data
  const sourcePath = path.join(PROJECT_ROOT, 'data/locations.json');
  console.log(`📂 Loading source data from: ${sourcePath}`);

  const sourceContent = fs.readFileSync(sourcePath, 'utf-8');
  const legacyLocations: LegacyLocation[] = JSON.parse(sourceContent);
  console.log(`✓ Loaded ${legacyLocations.length} locations\n`);

  // Transform locations
  console.log('🔄 Transforming locations...');
  const transformedLocations = legacyLocations.map((legacy, index) => {
    console.log(`  ${index + 1}/${legacyLocations.length} ${legacy.id}`);
    return transformLocation(legacy);
  });
  console.log(`✓ Transformed ${transformedLocations.length} locations\n`);

  // Create API response
  const apiResponse: APIResponse = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    locations: transformedLocations,
  };

  // Save to output file
  const outputPath = path.join(PROJECT_ROOT, 'data/migration/locations-api-ready.json');
  console.log(`💾 Saving API-ready data to: ${outputPath}`);

  fs.writeFileSync(outputPath, JSON.stringify(apiResponse, null, 2), 'utf-8');

  console.log(`✓ Migration complete!`);
  console.log(`\n📊 Summary:`);
  console.log(`  - Locations: ${apiResponse.locations.length}`);
  console.log(
    `  - Total roles: ${apiResponse.locations.reduce((sum, loc) => sum + loc.roles.length, 0)}`
  );
  console.log(`  - Languages: ${LOCALES.join(', ')}`);
  console.log(`  - Output: ${outputPath}`);
}

// Run migration
if (require.main === module) {
  try {
    migrateLocationData();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

export { migrateLocationData };
