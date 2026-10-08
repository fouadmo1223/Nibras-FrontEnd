/**
 * Temporary stock photography (Unsplash) used until real platform content exists — course
 * thumbnails, instructor/student photos, etc. Swap any entry's `src` to replace it; once the
 * CMS (Phase 11) manages homepage imagery, these move there instead of living in code.
 * Each photo is credited per Unsplash's license terms.
 */
export const STOCK_IMAGES = {
  heroLearner: {
    src: 'https://images.unsplash.com/photo-1622151834625-66296f9f0e96',
    alt: { en: 'A learner focused on their laptop at night', ar: 'متعلّم يركّز على حاسوبه المحمول ليلًا' },
    credit: 'Unsplash',
  },
  focusGlow: {
    src: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
    alt: { en: 'A laptop glowing warmly in the dark', ar: 'حاسوب محمول يتوهّج بدفء في الظلام' },
    credit: 'Unsplash',
  },
  handsOnKeyboard: {
    src: 'https://images.unsplash.com/photo-1508780709619-79562169bc64',
    alt: { en: 'Hands typing on a laptop keyboard', ar: 'يدان تكتبان على لوحة مفاتيح الحاسوب' },
    credit: 'Unsplash',
  },
};

/** Appends Unsplash's own delivery params (crop/format/quality) to a base photo URL. */
export function unsplashUrl(src, { w, h, fit = 'crop' } = {}) {
  const params = new URLSearchParams({ auto: 'format', q: '80', fit });
  if (w) params.set('w', w);
  if (h) params.set('h', h);
  return `${src}?${params.toString()}`;
}
