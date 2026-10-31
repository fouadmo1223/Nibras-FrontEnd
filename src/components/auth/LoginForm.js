'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { useLogin } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { Link, useLocaleRouter } from '@/i18n/navigation';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { safeRedirect } from '@/lib/safe-redirect';
import { loginSchema } from '@/lib/validation/auth-schemas';

export default function LoginForm() {
  const { t } = useI18n();
  const router = useLocaleRouter();
  const params = useSearchParams();
  const login = useLogin();
  const schema = useMemo(() => loginSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => router.replace(safeRedirect(params.get('next'))),
      onError: (error) => applyFieldErrors(error, setError, ['email', 'password']),
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {login.isError && <Alert tone="error" title={errorMessage(login.error, t)} />}

      <Field label={t('fields.email')} error={errors.email?.message}>
        <Input type="email" dir="ltr" autoComplete="email" inputMode="email" placeholder={t('fields.emailPlaceholder')} {...register('email')} />
      </Field>

      <Field
        label={t('fields.password')}
        error={errors.password?.message}
        action={
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            {t('auth.login.forgot')}
          </Link>
        }
      >
        <PasswordInput autoComplete="current-password" {...register('password')} />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        {t('auth.login.submit')}
      </Button>
    </form>
  );
}
