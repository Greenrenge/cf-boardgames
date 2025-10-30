import { notFound } from 'next/navigation';
import { LOCALE_CODES } from '@/lib/i18n/config';
import { getDirectionAttr } from '@/lib/i18n/rtl';
import TranslationProvider from '@/components/i18n/TranslationProvider';
import type { LocaleCode } from '@/lib/i18n/types';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

// Load translation messages for the locale
async function getMessages(locale: LocaleCode) {
  try {
    // Load common translations (preloaded)
    const common = await import(`@/locales/${locale}/common.json`);

    return {
      common: common.default,
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return { common: {} };
  }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Validate locale
  if (!(LOCALE_CODES as readonly string[]).includes(params.locale)) {
    notFound();
  }

  const locale = params.locale as LocaleCode;
  const direction = getDirectionAttr(locale);
  const messages = await getMessages(locale);

  return (
    <div lang={locale} dir={direction}>
      <TranslationProvider locale={locale} messages={messages}>
        {children}
      </TranslationProvider>
    </div>
  );
}

// Generate static params for all supported locales
export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({
    locale,
  }));
}
