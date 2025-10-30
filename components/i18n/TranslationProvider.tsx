'use client';

// Translation Provider Component for next-intl
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

interface TranslationProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export default function TranslationProvider({
  locale,
  messages,
  children,
}: TranslationProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Bangkok">
      {children}
    </NextIntlClientProvider>
  );
}
