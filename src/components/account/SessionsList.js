'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Monitor, Smartphone } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nProvider';
import { errorMessage } from '@/lib/api-errors';
import { describeDevice } from '@/lib/user-agent';
import { authKeys, listSessions, revokeOtherSessions, revokeSession } from '@/services/auth.service';
import { toast } from '@/stores/toast-store';

export default function SessionsList() {
  const { t, format } = useI18n();
  const queryClient = useQueryClient();
  const sessions = useQuery({ queryKey: authKeys.sessions(), queryFn: listSessions, staleTime: 0 });
  const onSuccess = (result) => {
    toast.success(result.message);
    return queryClient.invalidateQueries({ queryKey: authKeys.sessions() });
  };
  const revokeOne = useMutation({ mutationFn: revokeSession, onSuccess });
  const revokeOthers = useMutation({ mutationFn: revokeOtherSessions, onSuccess });

  if (sessions.isPending) {
    return (
      <ul className="space-y-3" aria-busy="true" aria-label={t('sessions.loading')}>
        {[0, 1].map((i) => (
          <li key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </ul>
    );
  }
  if (sessions.isError) return <Alert tone="error" title={errorMessage(sessions.error, t)} />;

  const others = sessions.data.filter((s) => !s.current);
  const error = revokeOne.error ?? revokeOthers.error;

  return (
    <div className="space-y-4">
      {error && <Alert tone="error" title={errorMessage(error, t)} />}
      <ul className="divide-y divide-border rounded-lg border border-border">
        {sessions.data.map((s) => {
          const Icon = s.clientType === 'MOBILE' ? Smartphone : Monitor;
          const device = describeDevice(s.userAgent, s.clientType, t);
          return (
            <li key={s.id} className="flex items-center gap-4 px-4 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-muted text-foreground-muted">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                  {device}
                  {s.current && (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                      {t('sessions.thisDevice')}
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-foreground-subtle">
                  <span dir="ltr">{s.ipAddress ?? t('sessions.unknownLocation')}</span> · {t('sessions.lastActive', { time: format.relativeTime(s.lastActiveAt) })}
                </p>
              </div>
              {!s.current && (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={revokeOne.isPending && revokeOne.variables === s.id}
                  onClick={() => revokeOne.mutate(s.id)}
                  aria-label={t('sessions.signOutDevice', { device })}
                >
                  {t('sessions.signOut')}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {others.length > 0 && (
        <Button variant="secondary" size="sm" loading={revokeOthers.isPending} onClick={() => revokeOthers.mutate()}>
          {t('sessions.signOutOthers')}
        </Button>
      )}
    </div>
  );
}
