import { brand } from '@/constants/brand';

const { mark, colors } = brand;

// light-dark() follows the resolved color-scheme (system or data-theme), and keeps
// brand colors fixed even if UI accent colors are customised.
const fills = {
  page: `light-dark(${colors.light.page}, ${colors.dark.page})`,
  flame: `light-dark(${colors.light.flame}, ${colors.dark.flame})`,
  core: `light-dark(${colors.light.core}, ${colors.dark.core})`,
};

/** The Nibras mark: an open book whose spine carries a flame. */
export function LogoMark({ className = 'size-8', title }) {
  return (
    <svg
      viewBox={mark.viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path style={{ fill: fills.page }} d={mark.pageLeft} />
      <path style={{ fill: fills.page }} d={mark.pageRight} />
      <path style={{ fill: fills.flame }} d={mark.flame} />
      <path style={{ fill: fills.core }} d={mark.flameCore} />
    </svg>
  );
}

/** Mark + wordmark lockup. In RTL the Arabic name is used. */
export default function Logo({ className = '', markClassName = 'size-8', wordClassName = 'text-2xl', lang = 'en' }) {
  const name = lang === 'ar' ? brand.nameAr : brand.name;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span
        className={`font-semibold leading-none tracking-tight text-foreground ${lang === 'ar' ? 'font-arabic' : 'font-display'} ${wordClassName}`}
      >
        {name}
      </span>
    </span>
  );
}
