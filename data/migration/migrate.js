/**
 * Simple Migration Script (JavaScript)
 * Generates API-ready location data with all translations
 */

const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'];
const PROJECT_ROOT = path.resolve(__dirname, '../..');

function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch (err) {
    console.warn(`Warning: Could not load ${filepath}`);
    return null;
  }
}

function findRoleKey(roleTh, thRoles) {
  for (const [key, value] of Object.entries(thRoles)) {
    if (value === roleTh) return key;
  }
  return `role-${roleTh.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
}

function main() {
  console.log('🚀 Starting migration...\n');

  // Load source locations
  const locations = loadJSON(path.join(PROJECT_ROOT, 'data/locations.json'));
  console.log(`✓ Loaded ${locations.length} locations\n`);

  // Load all translations
  const translations = {
    locations: {},
    roles: {},
  };

  LOCALES.forEach((locale) => {
    translations.locations[locale] =
      loadJSON(path.join(PROJECT_ROOT, `locales/${locale}/locations.json`)) || {};
    translations.roles[locale] =
      loadJSON(path.join(PROJECT_ROOT, `locales/${locale}/roles.json`)) || {};
  });

  // Transform locations
  const apiLocations = locations.map((loc, idx) => {
    console.log(`  ${idx + 1}/${locations.length} ${loc.id}`);

    // Build location names
    const names = {};
    LOCALES.forEach((locale) => {
      names[locale] = translations.locations[locale][loc.id] || loc.nameTh;
    });

    // Build roles
    const roles = loc.roles.map((roleTh, roleIdx) => {
      const roleKey = findRoleKey(roleTh, translations.roles.th);
      const roleNames = {};

      LOCALES.forEach((locale) => {
        roleNames[locale] = translations.roles[locale][roleKey] || roleTh;
      });

      return {
        id: `${loc.id}-role-${roleIdx + 1}`,
        names: roleNames,
      };
    });

    return {
      id: loc.id,
      names,
      roles,
      imageUrl: loc.imageUrl,
    };
  });

  // Create API response
  const apiResponse = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    locations: apiLocations,
  };

  // Save output
  const outputPath = path.join(__dirname, 'locations-api-ready.json');
  fs.writeFileSync(outputPath, JSON.stringify(apiResponse, null, 2));

  console.log(`\n✅ Migration complete!`);
  console.log(`📊 Summary:`);
  console.log(`  - Locations: ${apiLocations.length}`);
  console.log(`  - Total roles: ${apiLocations.reduce((sum, l) => sum + l.roles.length, 0)}`);
  console.log(`  - Output: ${outputPath}\n`);
}

main();
