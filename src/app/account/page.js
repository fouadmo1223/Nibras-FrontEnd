import { Suspense } from 'react';
import AccountView from '@/components/account/AccountView';

export const metadata = { title: 'Account', robots: { index: false } };

export default function AccountPage() {
  return (
    <Suspense>
      <AccountView />
    </Suspense>
  );
}
