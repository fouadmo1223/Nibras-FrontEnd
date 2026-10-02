import { getApiHealth } from '@/services/system.service';

const STATES = {
  ok: { label: 'Operational', dot: 'bg-success', text: 'text-success' },
  degraded: { label: 'Degraded', dot: 'bg-warning', text: 'text-warning' },
  down: { label: 'Unreachable', dot: 'bg-error', text: 'text-error' },
};

async function loadHealth() {
  try {
    const health = await getApiHealth();
    return { state: health.database === 'up' ? 'ok' : 'degraded', health };
  } catch (error) {
    // A 503 from /health still carries a body; anything else means the API is offline.
    return error.status === 503 ? { state: 'degraded', health: error.details ?? null } : { state: 'down', health: null };
  }
}

/** Server component — rendered per request inside a Suspense boundary. */
export default async function ApiStatus() {
  const { state, health } = await loadHealth();
  const s = STATES[state];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
      <div className="col-span-2 flex items-center gap-2.5">
        <span className={`relative inline-flex size-2.5 rounded-full ${s.dot}`} aria-hidden="true">
          {state === 'ok' && <span className={`absolute inset-0 animate-ping rounded-full ${s.dot} opacity-60`} />}
        </span>
        <dt className="sr-only">API status</dt>
        <dd className={`font-medium ${s.text}`}>{s.label}</dd>
      </div>
      <div>
        <dt className="text-foreground-subtle">Database</dt>
        <dd className="mt-0.5 font-mono text-foreground">{health ? `Neon · ${health.database}` : '—'}</dd>
      </div>
      <div>
        <dt className="text-foreground-subtle">API version</dt>
        <dd className="mt-0.5 font-mono text-foreground">{health?.version ?? '—'}</dd>
      </div>
    </dl>
  );
}

export function ApiStatusSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Checking API status">
      <div className="h-4 w-28 animate-pulse rounded-sm bg-surface-muted" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-9 animate-pulse rounded-sm bg-surface-muted" />
        <div className="h-9 animate-pulse rounded-sm bg-surface-muted" />
      </div>
    </div>
  );
}
