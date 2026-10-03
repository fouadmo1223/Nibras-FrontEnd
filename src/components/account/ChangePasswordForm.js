'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import PasswordInput from '@/components/ui/PasswordInput';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { changePasswordSchema, PASSWORD_MIN } from '@/lib/validation/auth-schemas';
import { authKeys, changePassword } from '@/services/auth.service';

export default function ChangePasswordForm() {
  const queryClient = useQueryClient();
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
    resolver: zodResolver(changePasswordSchema),
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
            setError('currentPassword', { type: 'server', message: 'Your current password is incorrect.' });
          } else if (error.code === 'PASSWORD_UNCHANGED') {
            setError('newPassword', { type: 'server', message: 'Choose a different password.' });
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
      {change.isError && !fieldCodes.includes(change.error.code) && <Alert tone="error" title={errorMessage(change.error)} />}

      <Field label="Current password" error={errors.currentPassword?.message}>
        <PasswordInput autoComplete="current-password" {...register('currentPassword')} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="New password" error={errors.newPassword?.message} hint={`At least ${PASSWORD_MIN} characters.`}>
          <PasswordInput autoComplete="new-password" strengthValue={strengthValue} {...register('newPassword')} />
        </Field>
        <Field label="Confirm new password" error={errors.confirmPassword?.message}>
          <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
        </Field>
      </div>
      <Button type="submit" loading={change.isPending}>
        Update password
      </Button>
    </form>
  );
}
