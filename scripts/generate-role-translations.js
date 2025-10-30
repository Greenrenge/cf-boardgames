/**
 * Generate Role Translation Files
 *
 * This script creates role translation files for all 7 languages.
 * Strategy: Create a single roles.json per language with role key mappings
 */

const fs = require('fs');
const path = require('path');

// Load Thai to English mapping
const thaiToEnglishMap = require('./thai-to-english-roles');

// Load analysis
const analysisPath = path.join(__dirname, 'roles-analysis.json');
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

const uniqueRoles = analysis.uniqueRoles;

console.log(`\n📝 Generating role translation files with slug-style keys...`);
console.log(`Total unique roles to translate: ${uniqueRoles.length}`);
console.log(`Languages: 7 (en, th, zh, hi, es, fr, ar)`);
console.log(`Total translations needed: ${uniqueRoles.length * 7} = ${uniqueRoles.length * 7}\n`);

// Function to create slug from English text if not in mapping
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Create role key mapping (Thai role -> slug-style-key)
const roleKeyMap = {};
const missingTranslations = [];

uniqueRoles.forEach((role) => {
  // Use predefined English slug or create fallback
  const key = thaiToEnglishMap[role];
  if (!key) {
    missingTranslations.push(role);
    roleKeyMap[role] = createSlug(role); // Fallback
  } else {
    roleKeyMap[role] = key;
  }
});

if (missingTranslations.length > 0) {
  console.log(`⚠️  Warning: ${missingTranslations.length} roles missing English translations:`);
  missingTranslations.slice(0, 10).forEach((role) => console.log(`   - ${role}`));
  if (missingTranslations.length > 10) {
    console.log(`   ... and ${missingTranslations.length - 10} more`);
  }
  console.log('');
}

// English template (Thai -> English translations)
// For now, keep Thai as placeholder - will be translated separately
const englishRoles = {};
uniqueRoles.forEach((thaiRole) => {
  const key = roleKeyMap[thaiRole];
  // Placeholder - these need to be translated
  englishRoles[key] = thaiRole; // Will be replaced with actual English
});

// Thai roles (already have these)
const thaiRoles = {};
uniqueRoles.forEach((thaiRole) => {
  const key = roleKeyMap[thaiRole];
  thaiRoles[key] = thaiRole;
});

// Save English template
const enPath = path.join(__dirname, '../locales/en/roles-template.json');
fs.writeFileSync(enPath, JSON.stringify(englishRoles, null, 2));
console.log(`✅ Created: ${enPath}`);

// Save Thai roles
const thPath = path.join(__dirname, '../locales/th/roles.json');
fs.writeFileSync(thPath, JSON.stringify(thaiRoles, null, 2));
console.log(`✅ Created: ${thPath}`);

// Save role key mapping for reference
const mapPath = path.join(__dirname, 'role-key-mapping.json');
fs.writeFileSync(mapPath, JSON.stringify(roleKeyMap, null, 2));
console.log(`✅ Created role mapping: ${mapPath}`);

// Save list of roles for manual translation
const rolesListPath = path.join(__dirname, 'roles-for-translation.txt');
const rolesList = uniqueRoles.join('\n');
fs.writeFileSync(rolesListPath, rolesList);
console.log(`✅ Created roles list for translation: ${rolesListPath}`);

console.log(`\n✨ Next steps:`);
console.log(`1. Translate the 382 roles from Thai to other languages`);
console.log(`2. Create roles.json files for: zh, hi, es, fr, ar`);
console.log(`3. Update components to use role translations`);
