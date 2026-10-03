import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { getI18n } from '@/i18n/dictionaries';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.resetPassword'), robots: { index: false } };
}

export default async function ResetPasswordPage() {
  const { t } = await getI18n();
  return (
    <AuthShell title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
