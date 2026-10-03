'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { BadgeCheck, KeyRound, MailCheck, MonitorSmartphone } from 'lucide-react';
import AvatarUploader from '@/components/account/AvatarUploader';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';
import SessionsList from '@/components/account/SessionsList';
import SignOutButton from '@/components/account/SignOutButton';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { useSession } from '@/hooks/use-auth';
import { errorMessage } from '@/lib/api-errors';
import { resendVerification } from '@/services/auth.service';

const ROLE_LABELS = { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', INSTRUCTOR: 'Instructor', STUDENT: 'Student' };

// Staggered entrance: the page reveals card by card. MotionConfig (providers) honours Reduce Motion.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 28 } },
};

function Card({ icon: Icon, title, description, children }) {
  return (
    <motion.section variants={item} className="rounded-2xl border border-border bg-surface p-6 shadow-elevation-1 sm:p-8">
      <header className="mb-6 flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>}
        </div>
      </header>
      {children}
    </motion.section>
  );
}

function VerifyBanner({ email }) {
  const resend = useMutation({ mutationFn: resendVerification });
  return (
    <motion.div
      variants={item}
      className="flex flex-col gap-4 rounded-2xl border border-warning/30 bg-warning/10 p-5 sm:flex-row sm:items-center"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
        <MailCheck className="size-5" aria-hidden="true" />
      </span>
      <div className="flex-1 text-sm">
        <p className="font-medium text-foreground">Confirm your email</p>
        <p className="text-foreground-muted" aria-live="polite">
          {resend.isSuccess ? resend.data.message : resend.isError ? errorMessage(resend.error) : `We sent a link to ${email}.`}
        </p>
      </div>
      <Button size="sm" variant="secondary" loading={resend.isPending} disabled={resend.isSuccess} onClick={() => resend.mutate()}>
        {resend.isSuccess ? 'Sent' : 'Resend link'}
      </Button>
    </motion.div>
  );
}

function AccountSkeleton() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[20rem_1fr] lg:px-10" aria-busy="true" aria-label="Loading your account">
      <div className="h-96 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="space-y-6">
        <div className="h-12 w-72 animate-pulse rounded-md bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-surface-muted" />
      </div>
    </div>
  );
}

export default function AccountView() {
  const router = useRouter();
  const welcome = useSearchParams().get('welcome') === '1';
  const session = useSession();

  // Client-side guard for UX; the API independently rejects unauthenticated requests.
  useEffect(() => {
    if (session.isSuccess && !session.data) router.replace('/login?next=/account');
  }, [session.isSuccess, session.data, router]);

  if (session.isPending || (session.isSuccess && !session.data)) return <AccountSkeleton />;
  if (session.isError) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24">
        <Alert tone="error" title={errorMessage(session.error)} />
      </div>
    );
  }

  const { user } = session.data;

  return (
    <div className="relative min-h-dvh">
      {/* Soft brand light behind the header. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_30%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 lg:px-10">
        <header className="flex items-center justify-between py-6">
          <Link href="/" aria-label="Nibras home" className="rounded-md">
            <Logo markClassName="size-7" wordClassName="text-xl" />
          </Link>
          <SignOutButton />
        </header>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-6 grid items-start gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]"
        >
          {/* Profile card */}
          <motion.aside
            variants={item}
            className="rounded-2xl border border-border bg-surface p-7 shadow-elevation-1 lg:sticky lg:top-8"
          >
            <AvatarUploader user={user} />
            <div className="mt-6 border-t border-border pt-6 text-center">
              <h1 className="font-display text-2xl tracking-tight text-foreground">{user.name}</h1>
              <p className="mt-1 break-all text-sm text-foreground-muted">{user.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {user.roles.map((role) => (
                  <span key={role} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                    {ROLE_LABELS[role] ?? role}
                  </span>
                ))}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${user.emailVerified ? 'bg-success-soft text-success' : 'bg-warning/15 text-warning'}`}
                >
                  {user.emailVerified && <BadgeCheck className="size-3.5" aria-hidden="true" />}
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
            <SignOutButton variant="secondary" className="mt-6 w-full" />
          </motion.aside>

          {/* Settings */}
          <div className="space-y-6">
            <motion.div variants={item}>
              <p className="text-sm text-foreground-subtle">{welcome ? 'Welcome to Nibras' : 'Account settings'}</p>
              <p className="mt-1 font-display text-4xl tracking-tight text-foreground">
                {welcome ? `Hi, ${user.name.split(' ')[0]}` : 'Your account'}
              </p>
            </motion.div>

            {!user.emailVerified && <VerifyBanner email={user.email} />}

            <Card icon={KeyRound} title="Password" description="Changing it signs out your other devices.">
              <ChangePasswordForm />
            </Card>

            <Card icon={MonitorSmartphone} title="Devices" description="Where you’re signed in. Sign out anything you don’t recognise.">
              <SessionsList />
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
