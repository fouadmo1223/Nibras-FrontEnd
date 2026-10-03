'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Monitor, Smartphone } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { errorMessage } from '@/lib/api-errors';
import { describeDevice, relativeTime } from '@/lib/user-agent';
import { authKeys, listSessions, revokeOtherSessions, revokeSession } from '@/services/auth.service';
import { toast } from '@/stores/toast-store';

export default function SessionsList() {
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
      <ul className="space-y-3" aria-busy="true" aria-label="Loading devices">
        {[0, 1].map((i) => (
          <li key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        ))}
      </ul>
    );
  }
  if (sessions.isError) return <Alert tone="error" title={errorMessage(sessions.error)} />;

  const others = sessions.data.filter((s) => !s.current);
  const error = revokeOne.error ?? revokeOthers.error;

  return (
    <div className="space-y-4">
      {error && <Alert tone="error" title={errorMessage(error)} />}
      <ul className="divide-y divide-border rounded-lg border border-border">
        {sessions.data.map((s) => {
          const Icon = s.clientType === 'MOBILE' ? Smartphone : Monitor;
          return (
            <li key={s.id} className="flex items-center gap-4 px-4 py-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-muted text-foreground-muted">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                  {describeDevice(s.userAgent, s.clientType)}
                  {s.current && (
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                      This device
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-foreground-subtle">
                  {s.ipAddress ?? 'Unknown location'} · active {relativeTime(s.lastActiveAt)}
                </p>
              </div>
              {!s.current && (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={revokeOne.isPending && revokeOne.variables === s.id}
                  onClick={() => revokeOne.mutate(s.id)}
                  aria-label={`Sign out ${describeDevice(s.userAgent, s.clientType)}`}
                >
                  Sign out
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {others.length > 0 && (
        <Button variant="secondary" size="sm" loading={revokeOthers.isPending} onClick={() => revokeOthers.mutate()}>
          Sign out all other devices
        </Button>
      )}
    </div>
  );
}
