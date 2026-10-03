import Link from 'next/link';
import { brand } from '@/constants/brand';
import Logo from '@/components/ui/Logo';
import AuthShowcase from './AuthShowcase';

/**
 * Two halves on desktop: the form, and an animated brand illustration that
 * stays pinned while the form scrolls. Mobile shows the form only.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/" className="self-start rounded-md" aria-label={`${brand.name} home`}>
          <Logo markClassName="size-7" wordClassName="text-xl" />
        </Link>

        <main className="animate-fade-up mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-[2.15rem] leading-tight tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-foreground-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-foreground-muted">{footer}</div>}
        </main>

        <p className="text-xs text-foreground-subtle">
          {brand.name} · {brand.tagline.en}
        </p>
      </div>

      <div className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
        <AuthShowcase />
      </div>
    </div>
  );
}
