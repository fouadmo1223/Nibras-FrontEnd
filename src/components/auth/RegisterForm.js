'use client';

import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import { useRegister } from '@/hooks/use-auth';
import { applyFieldErrors, errorMessage } from '@/lib/api-errors';
import { PASSWORD_MIN, registerSchema } from '@/lib/validation/auth-schemas';

export default function RegisterForm() {
  const router = useRouter();
  const signUp = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '' } });
  const strengthValue = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit((values) =>
    signUp.mutate(values, {
      onSuccess: () => router.replace('/account?welcome=1'),
      onError: (error) => {
        if (error.code === 'EMAIL_TAKEN') setError('email', { type: 'server', message: errorMessage(error) });
        else applyFieldErrors(error, setError, ['name', 'email', 'password']);
      },
    }),
  );

  const showBanner = signUp.isError && !['EMAIL_TAKEN', 'VALIDATION_ERROR'].includes(signUp.error?.code);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {showBanner && <Alert tone="error" title={errorMessage(signUp.error)} />}

      <Field label="Full name" error={errors.name?.message}>
        <Input autoComplete="name" placeholder="Layla Hassan" {...register('name')} />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <Input type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...register('email')} />
      </Field>

      <Field label="Password" error={errors.password?.message} hint={`At least ${PASSWORD_MIN} characters. A short phrase works well.`}>
        <PasswordInput autoComplete="new-password" strengthValue={strengthValue} {...register('password')} />
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={signUp.isPending}>
        Create account
      </Button>
    </form>
  );
}
