'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LOCALE_COOKIE, switchLocalePath } from '@/i18n/config';
import { authKeys, updateProfile } from '@/services/auth.service';

/**
 * Switches the site language: remembers it in a cookie (read by proxy.js on the next
 * visit), saves it to the signed-in account so emails follow, and opens the same page
 * in the other language.
 */
export function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  return (locale) => {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;

    const session = queryClient.getQueryData(authKeys.session());
    if (session?.user && session.user.locale !== locale) {
      updateProfile({ locale })
        .then(({ data }) => queryClient.setQueryData(authKeys.session(), (current) => (current ? { ...current, user: data } : current)))
        // Best effort: the page language already changed; emails keep the previous language until the next save.
        .catch(() => {});
    }

    router.push(switchLocalePath(`${pathname}${window.location.search}`, locale), { scroll: false });
  };
}
