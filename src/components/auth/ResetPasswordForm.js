'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import PasswordInput from '@/components/ui/PasswordInput';
import { useI18n } from '@/i18n/I18nProvider';
import { Link, useLocaleRouter } from '@/i18n/navigation';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { PASSWORD_MIN, resetPasswordSchema } from '@/lib/validation/auth-schemas';
import { resetPassword } from '@/services/auth.service';
import { toast } from '@/stores/toast-store';

export default function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useLocaleRouter();
  const token = useSearchParams().get('token');
  const reset = useMutation({ mutationFn: resetPassword });
  const schema = useMemo(() => resetPasswordSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { password: '', confirmPassword: '' } });
  const strengthValue = useWatch({ control, name: 'password' });

  if (!token) {
    return (
      <Alert tone="error" title={t('auth.reset.incompleteTitle')}>
        {t('auth.reset.incompleteBody')}{' '}
        <Link href="/forgot-password" className="font-medium text-primary underline">
          {t('auth.reset.requestNew')}
        </Link>
        .
      </Alert>
    );
  }

  const onSubmit = handleSubmit(({ password }) =>
    reset.mutate(
      { token, password },
      {
        onSuccess: (result) => {
          toast.success(result.message);
          router.replace('/login');
        },
        onError: (error) => applyFieldErrors(error, setError, ['password']),
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {reset.isError && reset.error.code !== 'VALIDATION_ERROR' && (
        <Alert tone="error" title={errorMessage(reset.error, t)}>
          {reset.error.code === 'INVALID_TOKEN' && (
            <Link href="/forgot-password" className="font-medium text-primary underline">
              {t('auth.reset.requestNewLink')}
            </Link>
          )}
        </Alert>
      )}
      <Field label={t('fields.newPassword')} error={errors.password?.message} hint={t('fields.newPasswordHint', { min: PASSWORD_MIN })}>
        <PasswordInput autoComplete="new-password" strengthValue={strengthValue} {...register('password')} />
      </Field>
      <Field label={t('fields.confirmNewPassword')} error={errors.confirmPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={reset.isPending}>
        {t('auth.reset.submit')}
      </Button>
      <p className="text-sm text-foreground-subtle">{t('auth.reset.signsOutEverywhere')}</p>
    </form>
  );
}
