import { Suspense } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import VerifyEmail from '@/components/auth/VerifyEmail';

export const metadata = { title: 'Confirm your email', robots: { index: false } };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Confirm your email">
      <Suspense>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  );
}
