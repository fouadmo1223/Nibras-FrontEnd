'use client';

import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import { useI18n } from '@/i18n/I18nProvider';
import { errorMessage } from '@/lib/api-errors';
import { forgotPasswordSchema } from '@/lib/validation/auth-schemas';
import { forgotPassword } from '@/services/auth.service';

export default function ForgotPasswordForm() {
  const { t } = useI18n();
  const request = useMutation({ mutationFn: ({ email }) => forgotPassword(email) });
  const schema = useMemo(() => forgotPasswordSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  if (request.isSuccess) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-medium text-foreground">{t('auth.forgot.checkInbox')}</h2>
        <p className="mt-1.5 text-sm text-foreground-muted">{request.data.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => request.mutate(v))} noValidate className="space-y-5">
      {request.isError && <Alert tone="error" title={errorMessage(request.error, t)} />}
      <Field label={t('fields.email')} error={errors.email?.message}>
        <Input type="email" dir="ltr" autoComplete="email" inputMode="email" placeholder={t('fields.emailPlaceholder')} {...register('email')} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={request.isPending}>
        {t('auth.forgot.submit')}
      </Button>
    </form>
  );
}
