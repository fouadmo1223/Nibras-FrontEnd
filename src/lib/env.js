/**
 * Public runtime configuration. Only NEXT_PUBLIC_* values are exposed to the
 * browser; never put secrets here.
 */
const DEFAULT_API_URL = 'http://localhost:5000/api/v1';

export const env = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, ''),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};
