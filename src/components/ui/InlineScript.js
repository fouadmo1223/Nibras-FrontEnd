'use client';

/**
 * Inline script that runs during HTML parsing (before first paint). On the client it renders
 * as text/plain, so React doesn't warn about script tags it would never execute.
 */
export default function InlineScript({ html }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
