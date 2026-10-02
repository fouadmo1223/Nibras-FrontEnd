import { Fraunces, Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { brand } from '@/constants/brand';
import { env } from '@/lib/env';
import Providers from './providers';
import './globals.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'], display: 'swap' });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], display: 'swap', axes: ['opsz'] });
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-plex-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: `${brand.name} — ${brand.tagline.en}`, template: `%s · ${brand.name}` },
  description: brand.description.en,
  applicationName: brand.name,
  openGraph: { siteName: brand.name, type: 'website' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0C0B' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geist.variable} ${geistMono.variable} ${fraunces.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
