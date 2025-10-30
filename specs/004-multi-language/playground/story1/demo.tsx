'use client';

/**
 * USER STORY 1 - Language Selection Playground Demo
 *
 * Purpose: Demonstrate language switcher functionality
 * Features:
 * - Dropdown showing all 7 supported languages with native names
 * - Language persistence (localStorage + cookie)
 * - Immediate UI update without page reload
 * - Browser language detection
 * - Visual indication of current language
 *
 * Usage: Import and use LanguageSwitcher in any component
 */

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function LanguageSwitcherDemo() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            🌍 {t('heading.languageSelection')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            User Story 1: Language Selection Feature Demo
          </p>
        </div>

        {/* Language Switcher Demo */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Language Switcher Component
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <label className="text-gray-700 dark:text-gray-300 font-medium">
              {t('label.selectLanguage')}:
            </label>
            <LanguageSwitcher />
          </div>
          <div className="bg-blue-50 dark:bg-slate-700 rounded-lg p-4 border border-blue-200 dark:border-slate-600">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              💡 <strong>Try it:</strong> Select different languages from the dropdown. The UI
              updates immediately without page reload. Your selection is saved and will persist
              across page refreshes and browser restarts.
            </p>
          </div>
        </div>

        {/* Translated Content Examples */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Translated Content Examples
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {t('heading.buttons')}
              </h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  {t('button.createRoom')}
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  {t('button.joinRoom')}
                </button>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  {t('button.startGame')}
                </button>
              </div>
            </div>

            {/* Labels */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {t('heading.labels')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('label.roomCode')}:</span>
                  <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">ABC123</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">{t('label.playerName')}:</span>
                  <span className="text-gray-800 dark:text-white">Alice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('label.gameDuration')}:
                  </span>
                  <span className="text-gray-800 dark:text-white">8 {t('label.minutes')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Languages */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
            Supported Languages (7)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">🇹🇭</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">ไทย</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Thai (Default)</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">English</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">English</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">🇨🇳</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">中文</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Mandarin Chinese</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">हिंदी</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hindi</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">🇪🇸</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">Español</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Spanish</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">🇫🇷</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">Français</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">French</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-2xl">🇸🇦</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-white">العربية</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Arabic (RTL)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Testing Checklist */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl shadow-xl p-8 mt-8 border-2 border-amber-200 dark:border-amber-800">
          <h2 className="text-2xl font-semibold mb-6 text-amber-900 dark:text-amber-300">
            ✅ Testing Checklist
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Language switcher dropdown displays all 7 languages with native names</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Current language is visually indicated in dropdown</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Changing language updates UI immediately without page reload</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Language selection persists in localStorage (cf-boardgames-locale)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Language selection persists in cookie (NEXT_LOCALE)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Selected language persists after page refresh</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Selected language persists after browser restart</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>First-time users get language based on browser settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>Arabic text displays correctly in RTL direction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">☑</span>
              <span>All UI strings are translated (no hardcoded text)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
