import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-sans-thai',
});

export const metadata: Metadata = {
  title: 'Spyfall Online - Thai Edition',
  description: 'เกมหาสายลับออนไลน์ ฉบับภาษาไทย สนุก ตื่นเต้น เล่นง่าย สำหรับ 4-20 คน',
  keywords: 'spyfall, spy game, สายลับ, เกมออนไลน์, board game, party game, thai game',
  authors: [{ name: 'Greenrenge' }],
  creator: 'Greenrenge',
  publisher: 'Greenrenge',
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://spyfall.greenrenge.com'),
  openGraph: {
    title: 'Spyfall Online - Thai Edition',
    description: 'เกมหาสายลับออนไลน์ ฉบับภาษาไทย สนุก ตื่นเต้น เล่นง่าย',
    url: 'https://spyfall.greenrenge.com',
    siteName: 'Spyfall Online',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Spyfall Online Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spyfall Online - Thai Edition',
    description: 'เกมหาสายลับออนไลน์ ฉบับภาษาไทย',
    images: ['/icon.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/favicon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/favicon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/favicon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/favicon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/favicon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/favicon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/favicon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/favicon-152x152.png',
      },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#1e40af', // Blue theme color matching spy/mystery theme
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Spyfall Online',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon-180x180.png" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${notoSansThai.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
