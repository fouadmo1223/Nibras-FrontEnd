/**
 * Small on-brand illustrations for empty account sections (cart, wishlist). Static, decorative
 * (aria-hidden) — the real messaging is the text/CTA next to them, these just soften the blank
 * state. Shares the stroke-icon-in-a-soft-badge language used by HeroIllustration's floating
 * badges, scaled down to a single centered motif instead of a whole animated scene.
 */
function Glow() {
  return (
    <radialGradient id="empty-state-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="var(--primary)" stopOpacity="0.25" />
      <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
    </radialGradient>
  );
}

export function EmptyCartIllustration({ className }) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true" focusable="false">
      <defs>
        <Glow />
      </defs>
      <circle cx="80" cy="80" r="76" fill="url(#empty-state-glow)" />
      <circle cx="80" cy="80" r="52" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeDasharray="3 6" />
      <g stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M52 62h56l-6 42a6 6 0 0 1-6 5H64a6 6 0 0 1-6-5l-6-42Z" fill="var(--primary-soft)" />
        <path d="M60 62v-8a20 20 0 0 1 40 0v8" />
      </g>
      <circle cx="64" cy="112" r="4.5" fill="var(--secondary)" />
      <circle cx="96" cy="112" r="4.5" fill="var(--secondary)" />
      <path d="M38 42l6 6M122 42l-6 6M80 30v8" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyWishlistIllustration({ className }) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true" focusable="false">
      <defs>
        <Glow />
      </defs>
      <circle cx="80" cy="80" r="76" fill="url(#empty-state-glow)" />
      <circle cx="80" cy="80" r="52" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeDasharray="3 6" />
      <path
        d="M80 104c-18-11.5-30-21.4-30-34.3C50 60.1 57.2 53 66.3 53c5.4 0 10.5 2.6 13.7 6.9C83.2 55.6 88.3 53 93.7 53 102.8 53 110 60.1 110 69.7 110 82.6 98 92.5 80 104Z"
        fill="var(--primary-soft)"
        stroke="var(--primary)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M40 46l6 6M120 46l-6 6M80 28v8" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="46" cy="110" r="4" fill="var(--secondary)" />
      <circle cx="114" cy="106" r="3" fill="var(--secondary)" />
    </svg>
  );
}
