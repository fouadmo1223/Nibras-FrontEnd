import { notFound } from 'next/navigation';

// This route only ever 404s, so there is no instant-navigation shell to validate.
export const instant = false;

/** Any unknown path under /{locale}/ renders the localized not-found page inside the root layout. */
export default function UnknownPage() {
  notFound();
}
