import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.signIn'), robots: { index: false } };
}

export default async function LoginPage() {
  const { t } = await getI18n();
  return (
    <AuthShell
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.newHere')}{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t('auth.login.createAccount')}
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
