'use client';

import { CreateRoom } from '@/components/room/CreateRoom';
import { JoinRoom } from '@/components/room/JoinRoom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function HomePage() {
  const t = useTranslations('common');
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Top right controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="max-w-4xl w-full">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-56 h-56 md:w-80 md:h-80 animate-fade-in">
              <Image
                src="/icon-no-bg.png"
                alt="Spyfall Online Logo"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
          {/* <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4 animate-fade-in">
            Spyfall Online
          </h1> */}
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
            {t('homepage.tagline')}
          </p>
        </div>

        {/* Game Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <CreateRoom />
          <JoinRoom />
        </div>

        {/* How to Play Section */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('heading.howToPlay')}
            </h3>
          </div>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="text-2xl flex-shrink-0">🎭</span>
              <span>{t('homepage.howToPlay1')}</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="text-2xl flex-shrink-0">💬</span>
              <span>{t('homepage.howToPlay2')}</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="text-2xl flex-shrink-0">🗳️</span>
              <span>{t('homepage.howToPlay3')}</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="text-2xl flex-shrink-0">🎯</span>
              <span>{t('homepage.howToPlay4')}</span>
            </li>
          </ul>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {t('homepage.feature1')}
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {t('homepage.feature2')}
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🕵️</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {t('homepage.feature3')}
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {t('homepage.feature4')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>{t('homepage.footer')}</p>
        </div>
      </div>
    </main>
  );
}
