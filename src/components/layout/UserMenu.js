'use client';

import { useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { SignOutDialog } from '@/components/account/SignOutButton';
import Avatar from '@/components/ui/Avatar';
import Menu from '@/components/ui/Menu';
import { useI18n } from '@/i18n/I18nProvider';
import { useLocaleRouter } from '@/i18n/navigation';

/** Signed-in avatar button: who you are, your account, sign out (with confirmation). */
export default function UserMenu({ user }) {
  const { t } = useI18n();
  const router = useLocaleRouter();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Menu
        label={t('nav.accountMenu')}
        triggerClassName="inline-flex rounded-full ring-offset-2 ring-offset-background transition-shadow hover:ring-2 hover:ring-border-strong aria-expanded:ring-2 aria-expanded:ring-primary"
        triggerContent={<Avatar user={user} size="sm" className="size-9" />}
        header={
          <div className="mb-1 flex items-center gap-3 border-b border-border px-3 pb-3 pt-2">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-foreground-subtle">
                <span className="sr-only">{t('nav.signedInAs')} </span>
                {user.email}
              </p>
            </div>
          </div>
        }
        items={[
          { id: 'account', label: t('nav.account'), icon: UserRound, onSelect: () => router.push('/account') },
          { id: 'sign-out', label: t('signOut.button'), icon: LogOut, onSelect: () => setConfirming(true) },
        ]}
        className="shrink-0"
        menuClassName="w-72"
      />
      <SignOutDialog open={confirming} onClose={() => setConfirming(false)} />
    </>
  );
}
