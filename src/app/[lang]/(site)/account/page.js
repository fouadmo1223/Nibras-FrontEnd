import { Suspense } from 'react';
import AccountView from '@/components/account/AccountView';
import { getI18n } from '@/i18n/dictionaries';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.account'), robots: { index: false } };
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountView />
    </Suspense>
  );
}
