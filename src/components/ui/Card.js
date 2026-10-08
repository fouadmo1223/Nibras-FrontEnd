import { cn } from '@/lib/cn';

const VARIANTS = {
  default: 'border border-border bg-surface shadow-elevation-1',
  glass: 'border border-border bg-surface/80 shadow-elevation-1 backdrop-blur-sm',
  dashed: 'border border-dashed border-border-strong bg-surface',
};

/**
 * Shared surface for grid/list cards site-wide: the border+radius+shadow foundation other
 * components layer their own content and hover behaviour onto. Polymorphic via `as` so it
 * can render as a `li`/`article`/etc. without an extra wrapper element.
 */
export default function Card({ as: Tag = 'div', variant = 'default', hover = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        VARIANTS[variant],
        hover && 'group transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevation-2',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** Decorative radial glow that fades in on `.group:hover` — pair with `Card hover`. */
export function CardGlow({ tone = 'primary' }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute -end-10 -top-10 size-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
        tone === 'primary' && 'bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)]',
        tone === 'secondary' && 'bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--secondary)_22%,transparent),transparent)]',
      )}
    />
  );
}
