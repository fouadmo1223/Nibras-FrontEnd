'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useLogout } from '@/hooks/use-auth';

/** Sign-out with a confirmation step; the API's message is shown as a toast by useLogout. */
export default function SignOutButton({ variant = 'ghost', size = 'sm', className }) {
  const router = useRouter();
  const logout = useLogout();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setConfirming(true)}>
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </Button>
      <ConfirmDialog
        open={confirming}
        icon={LogOut}
        tone="danger"
        title="Sign out of Nibras?"
        description="You’ll need to sign in again to continue learning on this device. Your progress is saved."
        confirmLabel="Sign out"
        loading={logout.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() =>
          logout.mutate(undefined, {
            onSettled: () => {
              setConfirming(false);
              router.replace('/login');
            },
          })
        }
      />
    </>
  );
}
