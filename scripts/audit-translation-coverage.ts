#!/usr/bin/env ts-node
/**
 * Audit Translation Coverage
 *
 * This script compares locales/en/common.json (baseline) against other locale files
 * and identifies missing UI string keys. Optionally generates scaffold files with
 * TODO markers for human translation.
 *
 * Run: npx ts-node scripts/audit-translation-coverage.ts
 * With fix: npx ts-node scripts/audit-translation-coverage.ts --fix
 */

import * as fs from 'fs';
import * as path from 'path';

type LocaleCode = 'en' | 'th' | 'zh' | 'hi' | 'es' | 'fr' | 'ar';

const LOCALES: LocaleCode[] = ['en', 'th', 'zh', 'hi', 'es', 'fr', 'ar'];
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Flatten nested translation keys
 * e.g., { button: { create: "Create" } } → { "button.create": "Create" }
 */
function flattenKeys(obj: any, prefix: string = ''): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      flattened[fullKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenKeys(value, fullKey));
    }
  }

  return flattened;
}

/**
 * Unflatten keys back to nested object
 * e.g., { "button.create": "Create" } → { button: { create: "Create" } }
 */
function unflattenKeys(flattened: Record<string, string>): any {
  const nested: any = {};

  for (const [flatKey, value] of Object.entries(flattened)) {
    const keys = flatKey.split('.');
    let current = nested;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  return nested;
}

/**
 * Load translation file
 */
function loadTranslations(locale: LocaleCode, type: string = 'common'): any {
  const filePath = path.join(PROJECT_ROOT, `locales/${locale}/${type}.json`);

  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Save translation file with proper formatting
 */
function saveTranslations(locale: LocaleCode, type: string, data: any): void {
  const localeDir = path.join(PROJECT_ROOT, `locales/${locale}`);
  
  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
  }

  const filePath = path.join(localeDir, `${type}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Audit a single locale against English baseline
 */
function auditLocale(
  locale: LocaleCode,
  baselineKeys: Set<string>,
  baselineFlat: Record<string, string>,
  fix: boolean
): { missing: string[]; extra: string[]; total: number; coverage: number } {
  const translations = loadTranslations(locale, 'common');
  const flatTranslations = flattenKeys(translations);
  const currentKeys = new Set(Object.keys(flatTranslations));

  // Find missing and extra keys
  const missing = Array.from(baselineKeys).filter((key) => !currentKeys.has(key));
  const extra = Array.from(currentKeys).filter((key) => !baselineKeys.has(key));

  const coverage = baselineKeys.size > 0 
    ? Math.round((currentKeys.size / baselineKeys.size) * 100) 
    : 0;

  // Fix mode: add missing keys with English fallback + TODO marker
  if (fix && missing.length > 0) {
    const updatedFlat = { ...flatTranslations };

    missing.forEach((key) => {
      // Use English value as placeholder with TODO marker
      updatedFlat[key] = `TODO: ${baselineFlat[key]}`;
    });

    const updatedNested = unflattenKeys(updatedFlat);
    saveTranslations(locale, 'common', updatedNested);
  }

  return {
    missing,
    extra,
    total: baselineKeys.size,
    coverage,
  };
}

/**
 * Main audit function
 */
function auditTranslationCoverage(fix: boolean = false): void {
  console.log('🔍 Auditing translation coverage...\n');

  // Load English as baseline
  console.log('📂 Loading English baseline (locales/en/common.json)...');
  const englishTranslations = loadTranslations('en', 'common');
  const englishFlat = flattenKeys(englishTranslations);
  const englishKeys = new Set(Object.keys(englishFlat));
  
  console.log(`✓ Loaded ${englishKeys.size} keys\n`);

  if (englishKeys.size === 0) {
    console.error('❌ Error: English baseline is empty or invalid');
    process.exit(1);
  }

  // Audit each locale
  const results: Record<string, any> = {};
  const otherLocales = LOCALES.filter((l) => l !== 'en');

  console.log(`📊 Auditing ${otherLocales.length} locales...\n`);

  otherLocales.forEach((locale) => {
    const result = auditLocale(locale, englishKeys, englishFlat, fix);
    results[locale] = result;

    // Console output
    const statusIcon = result.coverage === 100 ? '✓' : result.coverage >= 90 ? '⚠️' : '❌';
    console.log(`${statusIcon} ${locale.toUpperCase()}: ${result.coverage}% coverage (${englishKeys.size - result.missing.length}/${result.total} keys)`);

    if (result.missing.length > 0) {
      console.log(`   Missing: ${result.missing.length} keys`);
      if (!fix) {
        console.log(`   Sample: ${result.missing.slice(0, 3).join(', ')}${result.missing.length > 3 ? '...' : ''}`);
      }
    }

    if (result.extra.length > 0) {
      console.log(`   Extra: ${result.extra.length} keys (not in English)`);
    }

    if (fix && result.missing.length > 0) {
      console.log(`   ✓ Added ${result.missing.length} missing keys with TODO markers`);
    }

    console.log('');
  });

  // Summary
  console.log('📈 Summary:\n');

  const table = [
    ['Locale', 'Coverage', 'Missing', 'Status'],
    ['------', '--------', '-------', '------'],
  ];

  otherLocales.forEach((locale) => {
    const r = results[locale];
    const status = r.coverage === 100 ? 'COMPLETE' : r.coverage >= 90 ? 'GOOD' : 'NEEDS WORK';
    table.push([locale.toUpperCase(), `${r.coverage}%`, `${r.missing.length}`, status]);
  });

  table.forEach((row) => {
    console.log(row.join('  |  '));
  });

  // Overall status
  const allComplete = otherLocales.every((l) => results[l].coverage === 100);
  const allGood = otherLocales.every((l) => results[l].coverage >= 90);

  console.log('');
  if (allComplete) {
    console.log('✅ All translations complete!');
  } else if (allGood) {
    console.log('⚠️  Some translations incomplete but above 90% threshold');
  } else {
    console.log('❌ Some translations need significant work');
  }

  // Next steps
  if (!fix && !allComplete) {
    console.log('\n💡 Next steps:');
    console.log('  1. Run with --fix to add missing keys: npx ts-node scripts/audit-translation-coverage.ts --fix');
    console.log('  2. Search for "TODO:" in locale files and translate');
    console.log('  3. Review and remove extra keys if needed');
  } else if (fix) {
    console.log('\n💡 Next steps:');
    console.log('  1. Review updated files in locales/{locale}/common.json');
    console.log('  2. Search for "TODO:" and replace with actual translations');
    console.log('  3. Test language switching in the app');
  }

  // Exit code
  if (!allComplete && !fix) {
    process.exit(1);
  }
}

// Parse command line args
const args = process.argv.slice(2);
const fix = args.includes('--fix');

// Run audit
if (require.main === module) {
  try {
    auditTranslationCoverage(fix);
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

export { auditTranslationCoverage };
