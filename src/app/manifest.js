import { brand } from '@/constants/brand';

export default function manifest() {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.description.en,
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F7F5',
    theme_color: brand.colors.light.page,
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
