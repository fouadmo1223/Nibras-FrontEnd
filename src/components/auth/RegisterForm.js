'use client';

import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { useRegister } from '@/hooks/use-auth';
import { useI18n } from '@/i18n/I18nProvider';
import { useLocaleRouter } from '@/i18n/navigation';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { PASSWORD_MIN, registerSchema } from '@/lib/validation/auth-schemas';

export default function RegisterForm() {
  const { t } = useI18n();
  const router = useLocaleRouter();
  const signUp = useRegister();
  const schema = useMemo(() => registerSchema(t), [t]);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } });
  const strengthValue = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(values, {
      onSuccess: () => router.replace('/account?welcome=1'),
      onError: (error) => {
        if (error.code === 'EMAIL_TAKEN') setError('email', { type: 'server', message: errorMessage(error, t) });
        else applyFieldErrors(error, setError, ['name', 'email', 'password']);
      },
    }),
  );

  const showBanner = signUp.isError && !['EMAIL_TAKEN', 'VALIDATION_ERROR'].includes(signUp.error?.code);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {showBanner && <Alert tone="error" title={errorMessage(signUp.error, t)} />}

      <Field label={t('fields.fullName')} error={errors.name?.message}>
        <Input autoComplete="name" placeholder={t('fields.namePlaceholder')} {...register('name')} />
      </Field>

      <Field label={t('fields.email')} error={errors.email?.message}>
        <Input type="email" dir="ltr" autoComplete="email" inputMode="email" placeholder={t('fields.emailPlaceholder')} {...register('email')} />
      </Field>

      <Field label={t('fields.password')} error={errors.password?.message} hint={t('auth.register.passwordHint', { min: PASSWORD_MIN })}>
        <PasswordInput autoComplete="new-password" strengthValue={strengthValue} {...register('password')} />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={signUp.isPending}>
        {t('auth.register.submit')}
      </Button>
    </form>
  );
}
