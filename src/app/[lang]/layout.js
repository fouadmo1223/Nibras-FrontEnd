import { Fraunces, Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { brand } from '@/constants/brand';
import { env } from '@/lib/env';
import { THEME_SCRIPT } from '@/lib/theme-script';
import InlineScript from '@/components/ui/InlineScript';
import Toaster from '@/components/ui/Toaster';
import ChatWidget from '@/components/chat/ChatWidget';
import I18nProvider from '@/i18n/I18nProvider';
import { dirOf, LOCALE_META, LOCALES } from '@/i18n/config';
import { getI18n, getMessages } from '@/i18n/dictionaries';
import Providers from './providers';
import '../globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], display: 'swap', axes: ['opsz'] });
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-plex-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// /en and /ar are prerendered. Other first segments never reach here as locales: the proxy
// redirects locale-less URLs, and getLocale() 404s anything unsupported.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata() {
  const { t, locale } = await getI18n();
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: t('meta.title'), template: `%s · ${locale === 'ar' ? brand.nameAr : brand.name}` },
    description: t('meta.description'),
    applicationName: brand.name,
    openGraph: {
      siteName: brand.name,
      type: 'website',
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
    },
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0B' },
  ],
};

export default async function RootLayout({ children }) {
  const { locale, messages } = await getI18n();
  const fallback = locale === 'en' ? null : await getMessages('en');

  return (
    // suppressHydrationWarning: the theme script sets data-theme before hydration, and extensions
    // (ColorZilla, Grammarly…) add attributes to <html>/<body>. Only these two elements' attributes are affected.
    <html
      suppressHydrationWarning
      lang={locale}
      dir={dirOf(locale)}
      className={`${geist.variable} ${geistMono.variable} ${fraunces.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <head>
        <InlineScript html={THEME_SCRIPT} />
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <I18nProvider locale={locale} messages={messages} fallback={fallback}>
          <Providers>
            {children}
            <Toaster />
            <ChatWidget />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
