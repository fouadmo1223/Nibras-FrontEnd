'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { useLogin } from '@/hooks/use-auth';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { safeRedirect } from '@/lib/safe-redirect';
import { loginSchema } from '@/lib/validation/auth-schemas';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => router.replace(safeRedirect(params.get('next'))),
      onError: (error) => applyFieldErrors(error, setError, ['email', 'password']),
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {login.isError && <Alert tone="error" title={errorMessage(login.error)} />}

      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...register('email')} />
      </Field>

      <Field
        label="Password"
        error={errors.password?.message}
        action={
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        }
      >
        <PasswordInput autoComplete="current-password" {...register('password')} />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        Sign in
      </Button>
    </form>
  );
}
