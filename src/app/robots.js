import { env } from '@/lib/env';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/en/account', '/ar/account'] },
    sitemap: new URL('/sitemap.xml', env.siteUrl).toString(),
  };
}
