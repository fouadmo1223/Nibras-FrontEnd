'use client';

import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import { errorMessage } from '@/lib/api-errors';
import { forgotPasswordSchema } from '@/lib/validation/auth-schemas';
import { forgotPassword } from '@/services/auth.service';

export default function ForgotPasswordForm() {
  const request = useMutation({ mutationFn: ({ email }) => forgotPassword(email) });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  if (request.isSuccess) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-medium text-foreground">Check your inbox</h2>
        <p className="mt-1.5 text-sm text-foreground-muted">
          {request.data.message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => request.mutate(v))} noValidate className="space-y-5">
      {request.isError && <Alert tone="error" title={errorMessage(request.error)} />}
      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...register('email')} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={request.isPending}>
        Send reset link
      </Button>
    </form>
  );
}
