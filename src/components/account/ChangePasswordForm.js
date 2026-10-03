'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import PasswordInput from '@/components/ui/PasswordInput';
import { useI18n } from '@/i18n/I18nProvider';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { changePasswordSchema, PASSWORD_MIN } from '@/lib/validation/auth-schemas';
import { authKeys, changePassword } from '@/services/auth.service';

export default function ChangePasswordForm() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const schema = useMemo(() => changePasswordSchema(t), [t]);
  const change = useMutation({
    mutationFn: changePassword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.sessions() }),
  });
  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const strengthValue = useWatch({ control, name: 'newPassword' });

  const onSubmit = handleSubmit(({ currentPassword, newPassword }) =>
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => reset(),
        onError: (error) => {
          if (error.code === 'INVALID_CURRENT_PASSWORD') {
            setError('currentPassword', { type: 'server', message: error.message });
          } else if (error.code === 'PASSWORD_UNCHANGED') {
            setError('newPassword', { type: 'server', message: error.message });
          } else applyFieldErrors(error, setError, ['currentPassword', 'newPassword']);
        },
      },
    ),
  );

  const fieldCodes = ['INVALID_CURRENT_PASSWORD', 'PASSWORD_UNCHANGED', 'VALIDATION_ERROR'];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {change.isSuccess && (
        <Alert tone="success" title={change.data.message} />
      )}
      {change.isError && !fieldCodes.includes(change.error.code) && <Alert tone="error" title={errorMessage(change.error, t)} />}

      <Field label={t('fields.currentPassword')} error={errors.currentPassword?.message}>
        <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('fields.newPassword')} error={errors.newPassword?.message} hint={t('fields.newPasswordHint', { min: PASSWORD_MIN })}>
          <PasswordInput autoComplete="new-password" strengthValue={strengthValue} {...register('newPassword')} />
        </Field>
        <Field label={t('fields.confirmNewPassword')} error={errors.confirmPassword?.message}>
          <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
        </Field>
      </div>
      <Button type="submit" loading={change.isPending}>
        {t('account.password.submit')}
      </Button>
    </form>
  );
}
