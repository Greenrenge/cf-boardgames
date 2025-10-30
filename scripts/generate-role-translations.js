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

// Create role objects for all languages
const roles = {
  en: {},
  th: {},
  zh: {},
  hi: {},
  es: {},
  fr: {},
  ar: {},
};

uniqueRoles.forEach((thaiRole) => {
  const key = roleKeyMap[thaiRole];

  // English: Use the slug key itself (capitalize and replace hyphens)
  roles.en[key] = key
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Thai: Already have these
  roles.th[key] = thaiRole;

  // Other languages: Use Thai as placeholder (to be translated)
  roles.zh[key] = thaiRole; // Chinese - placeholder
  roles.hi[key] = thaiRole; // Hindi - placeholder
  roles.es[key] = thaiRole; // Spanish - placeholder
  roles.fr[key] = thaiRole; // French - placeholder
  roles.ar[key] = thaiRole; // Arabic - placeholder
});

// Save all language files
const languages = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'];
languages.forEach((lang) => {
  const langPath = path.join(__dirname, `../locales/${lang}/roles.json`);
  fs.writeFileSync(langPath, JSON.stringify(roles[lang], null, 2));
  console.log(`✅ Created: ${langPath}`);
});

// Save role key mapping for reference
const mapPath = path.join(__dirname, 'role-key-mapping.json');
fs.writeFileSync(mapPath, JSON.stringify(roleKeyMap, null, 2));
console.log(`✅ Created role mapping: ${mapPath}`);

// Save list of roles for manual translation
const rolesListPath = path.join(__dirname, 'roles-for-translation.txt');
const rolesList = uniqueRoles.join('\n');
fs.writeFileSync(rolesListPath, rolesList);
console.log(`✅ Created roles list for translation: ${rolesListPath}`);

console.log(`\n✨ Role translation files generated!`);
console.log(`📊 Statistics:`);
console.log(`   - Total unique roles: ${uniqueRoles.length}`);
console.log(`   - Languages: ${languages.length}`);
console.log(`   - Total translations: ${uniqueRoles.length * languages.length}`);
console.log(`\n⚠️  Note: zh, hi, es, fr, ar files contain Thai placeholders`);
console.log(`   These need to be translated by a translation service.`);
console.log(`\n📋 Next steps:`);
console.log(`1. Translate roles for: zh, hi, es, fr, ar`);
console.log(`2. Create useRoleTranslations hook`);
console.log(`3. Update components to use role translations`);
