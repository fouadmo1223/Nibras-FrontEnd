import Link from 'next/link';
import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Create your account', robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Start learning"
      subtitle="Create your free account in a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
