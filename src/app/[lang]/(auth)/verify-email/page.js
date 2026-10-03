import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import VerifyEmail from '@/components/auth/VerifyEmail';
import { getI18n } from '@/i18n/dictionaries';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.verifyEmail'), robots: { index: false } };
}

export default async function VerifyEmailPage() {
  const { t } = await getI18n();
  return (
    <AuthShell title={t('auth.verify.title')}>
      <Suspense>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  );
}
