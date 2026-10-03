'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { LogOut, MailCheck } from 'lucide-react';
import AvatarUploader from '@/components/account/AvatarUploader';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';
import SessionsList from '@/components/account/SessionsList';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { useLogout, useSession } from '@/hooks/use-auth';
import { errorMessage } from '@/lib/api-errors';
import { resendVerification } from '@/services/auth.service';

const ROLE_LABELS = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', INSTRUCTOR: 'Instructor', STUDENT: 'Student' };

function Section({ title, description, children }) {
  return (
    <section className="grid gap-6 border-t border-border py-10 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <div>
        <h2 className="font-medium text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-foreground-muted">{description}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

function VerifyBanner({ email }) {
  const resend = useMutation({ mutationFn: resendVerification });
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-warning/25 bg-warning-soft p-5 sm:flex-row sm:items-center">
      <MailCheck className="size-6 shrink-0 text-warning" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-foreground">Confirm your email</p>
        <p className="text-foreground-muted">
          We sent a link to <strong className="text-foreground">{email}</strong>.{' '}
          {resend.isSuccess && resend.data.message}
          {resend.isError && errorMessage(resend.error)}
        </p>
      </div>
      <Button size="sm" variant="secondary" loading={resend.isPending} disabled={resend.isSuccess} onClick={() => resend.mutate()}>
        {resend.isSuccess ? 'Sent' : 'Resend link'}
      </Button>
    </div>
  );
}

export default function AccountView() {
  const router = useRouter();
  const welcome = useSearchParams().get('welcome') === '1';
  const session = useSession();
  const logout = useLogout();

  // Client-side guard for UX; the API independently rejects unauthenticated requests.
  useEffect(() => {
    if (session.isSuccess && !session.data) router.replace('/login?next=/account');
  }, [session.isSuccess, session.data, router]);

  if (session.isPending || (session.isSuccess && !session.data)) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-16" aria-busy="true" aria-label="Loading your account">
        <div className="h-10 w-64 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-surface-muted" />
      </div>
    );
  }
  if (session.isError) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24">
        <Alert tone="error" title={errorMessage(session.error)} />
      </div>
    );
  }

  const { user } = session.data;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <header className="flex items-center justify-between py-6">
        <Link href="/" aria-label="Nibras home" className="rounded-md">
          <Logo markClassName="size-7" wordClassName="text-xl" />
        </Link>
        <Button
          variant="ghost"
          size="sm"
          loading={logout.isPending}
          onClick={() => logout.mutate(undefined, { onSettled: () => router.replace('/login') })}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      </header>

      <div className="py-10">
        <p className="text-sm text-foreground-subtle">{welcome ? 'Welcome to Nibras' : 'Account'}</p>
        <h1 className="mt-1 font-display text-4xl tracking-tight text-foreground">{user.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground-muted">
          <span>{user.email}</span>
          {user.roles.map((role) => (
            <span key={role} className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">
              {ROLE_LABELS[role] ?? role}
            </span>
          ))}
        </div>
      </div>

      {!user.emailVerified && (
        <div className="mb-10">
          <VerifyBanner email={user.email} />
        </div>
      )}

      <Section title="Profile photo" description="Shown on your profile, reviews and discussions.">
        <AvatarUploader user={user} />
      </Section>

      <Section title="Password" description="Changing it signs out your other devices.">
        <ChangePasswordForm />
      </Section>

      <Section title="Devices" description="Where you’re signed in. Sign out anything you don’t recognise.">
        <SessionsList />
      </Section>
    </div>
  );
}
