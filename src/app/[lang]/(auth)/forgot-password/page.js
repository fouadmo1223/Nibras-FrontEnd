import { ArrowLeft } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { getI18n } from '@/i18n/dictionaries';
import { Link } from '@/i18n/navigation';

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t('meta.forgotPassword'), robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const { t } = await getI18n();
  return (
    <AuthShell
      title={t('auth.forgot.title')}
      subtitle={t('auth.forgot.subtitle')}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          {t('auth.forgot.backToSignIn')}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
