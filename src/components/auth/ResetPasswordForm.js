'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import PasswordInput from '@/components/ui/PasswordInput';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { PASSWORD_MIN, resetPasswordSchema } from '@/lib/validation/auth-schemas';
import { resetPassword } from '@/services/auth.service';
import { toast } from '@/stores/toast-store';

export default function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const reset = useMutation({ mutationFn: resetPassword });
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirmPassword: '' } });
  const strengthValue = useWatch({ control, name: 'password' });

  if (!token) {
    return (
      <Alert tone="error" title="This reset link is incomplete">
        Open the link from your email again, or{' '}
        <Link href="/forgot-password" className="font-medium text-primary underline">
          request a new one
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
        <Alert tone="error" title={errorMessage(reset.error)}>
          {reset.error.code === 'INVALID_TOKEN' && (
            <Link href="/forgot-password" className="font-medium text-primary underline">
              Request a new link
            </Link>
          )}
        </Alert>
      )}
      <Field label="New password" error={errors.password?.message} hint={`At least ${PASSWORD_MIN} characters.`}>
        <PasswordInput autoComplete="new-password" strengthValue={strengthValue} {...register('password')} />
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={reset.isPending}>
        Update password
      </Button>
      <p className="text-sm text-foreground-subtle">For your security, every device will be signed out.</p>
    </form>
  );
}
