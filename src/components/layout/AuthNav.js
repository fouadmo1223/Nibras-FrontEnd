'use client';

import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { useSession } from '@/hooks/use-auth';

/** Minimal signed-in/out entry point until the full navigation lands in Phase 3. */
export default function AuthNav() {
  const session = useSession();

  if (session.isPending) return <div className="h-9 w-40 animate-pulse rounded-md bg-surface-muted" aria-hidden="true" />;

  if (session.data) {
    return (
      <Link
        href="/account"
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface ps-1 pe-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        <Avatar user={session.data.user} size="sm" className="size-7" />
        Account
      </Link>
    );
  }

  return (
    <nav className="flex items-center gap-2" aria-label="Account">
      <Link href="/login" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground-muted hover:text-foreground">
        Sign in
      </Link>
      <Link
        href="/register"
        className="inline-flex h-9 items-center rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
      >
        Get started
      </Link>
    </nav>
  );
}
