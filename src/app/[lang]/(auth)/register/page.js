import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.register'), robots: { index: false } };
}

export default async function RegisterPage() {
  const { t } = await getI18n();
  return (
    <AuthShell
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <>
          {t('auth.register.haveAccount')}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
