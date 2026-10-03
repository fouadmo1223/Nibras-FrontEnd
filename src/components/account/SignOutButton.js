'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useLogout } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { useLocaleRouter } from '@/i18n/navigation';

/** Sign-out confirmation; the API's message is shown as a toast by useLogout. */
export function SignOutDialog({ open, onClose }) {
  const { t } = useI18n();
  const router = useLocaleRouter();
  const logout = useLogout();
  return (
    <ConfirmDialog
      open={open}
      icon={LogOut}
      tone="danger"
      title={t('signOut.title')}
      description={t('signOut.description')}
      confirmLabel={t('signOut.confirm')}
      loading={logout.isPending}
      onCancel={onClose}
      onConfirm={() =>
        logout.mutate(undefined, {
          onSettled: () => {
            onClose();
            router.replace('/login');
          },
        })
      }
    />
  );
}

export default function SignOutButton({ variant = 'ghost', size = 'sm', className }) {
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setConfirming(true)}>
        <LogOut className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        {t('signOut.button')}
      </Button>
      <SignOutDialog open={confirming} onClose={() => setConfirming(false)} />
    </>
  );
}
