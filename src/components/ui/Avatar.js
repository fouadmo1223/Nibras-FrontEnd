'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

const SIZES = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg', xl: 'size-24 text-3xl' };
const PIXELS = { sm: 32, md: 40, lg: 56, xl: 96 };

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase() || '?';
}

/**
 * User photo, falling back to initials on a brand-tinted circle — including when `avatarUrl`
 * is set but the file itself 404s (e.g. deleted from storage out from under the record). Without
 * the `onError` fallback, a dead URL renders as a broken `<img>` with wrapped alt text instead of
 * a clean circle.
 */
export default function Avatar({ user, size = 'md', className }) {
  const [broken, setBroken] = useState(false);
  const base = cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full', SIZES[size], className);
  if (user?.avatarUrl && !broken) {
    return (
      <span className={base}>
        {/* Already a 512px WebP from the API's media pipeline — no need for Next's optimiser. */}
        <Image
          src={user.avatarUrl}
          alt={user.name ?? ''}
          width={PIXELS[size]}
          height={PIXELS[size]}
          unoptimized
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      </span>
    );
  }
  return (
    <span className={cn(base, 'bg-primary-soft font-semibold text-primary')} aria-hidden={!user?.name}>
      {initials(user?.name)}
    </span>
  );
}
