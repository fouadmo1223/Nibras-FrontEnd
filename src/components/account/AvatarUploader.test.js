import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToastStore } from '@/stores/toast-store';
import AvatarUploader from './AvatarUploader';

/** Minimal XMLHttpRequest fake: reports upload progress, then answers with the given response. */
function installXhr(status, body, progressSteps = [40, 100]) {
  const requests = [];
  const seenProgress = [];
  class FakeXhr {
    constructor() {
      this.headers = {};
      this.upload = {};
      requests.push(this);
    }
    open(method, url) {
      this.method = method;
      this.url = url;
    }
    setRequestHeader(name, value) {
      this.headers[name] = value;
    }
    send(body_) {
      this.body = body_;
      setTimeout(() => {
        for (const p of progressSteps) {
          this.upload.onprogress?.({ lengthComputable: true, loaded: p, total: 100 });
          seenProgress.push(p);
        }
        this.status = status;
        this.responseText = JSON.stringify(body);
        this.onload?.();
      }, 10);
    }
  }
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
  return { requests, seenProgress };
}

function renderUploader(user) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(['auth', 'session'], { user, csrfToken: 'c' });
  render(
    <QueryClientProvider client={client}>
      <AvatarUploader user={user} />
    </QueryClientProvider>,
  );
  return client;
}

const pick = () =>
  userEvent.upload(document.querySelector('input[type=file]'), new File([new Uint8Array([137, 80, 78, 71])], 'me.png', { type: 'image/png' }));

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => {
  vi.unstubAllGlobals();
  useToastStore.setState({ toasts: [] });
});

describe('AvatarUploader', () => {
  it('uploads with progress, then shows the API success message', async () => {
    const updated = { name: 'Layla Hassan', avatarUrl: 'http://localhost:5000/api/v1/media/avatars/u/a.webp' };
    const { requests, seenProgress } = installXhr(200, { success: true, data: updated, message: 'Your profile photo was updated.' });
    const client = renderUploader({ name: 'Layla Hassan', avatarUrl: null });

    expect(screen.getByText('LH')).toBeInTheDocument(); // initials fallback
    await pick();

    await vi.waitFor(() =>
      expect(useToastStore.getState().toasts.at(-1)).toMatchObject({ tone: 'success', message: 'Your profile photo was updated.' }),
    );
    const [xhr] = requests;
    expect(xhr.method).toBe('PUT');
    expect(xhr.url).toMatch(/\/users\/me\/avatar$/);
    expect(xhr.body).toBeInstanceOf(FormData);
    expect(xhr.withCredentials).toBe(true);
    expect(seenProgress).toEqual([40, 100]);
    expect(client.getQueryData(['auth', 'session']).user.avatarUrl).toBe(updated.avatarUrl);
  });

  it('shows the API error message when the upload is rejected', async () => {
    installXhr(413, { success: false, error: { code: 'FILE_TOO_LARGE', message: 'That image is too large. The maximum size is 5 MB.' } });
    renderUploader({ name: 'Layla', avatarUrl: null });
    await pick();
    await vi.waitFor(() =>
      expect(useToastStore.getState().toasts.at(-1)).toMatchObject({ tone: 'error', message: 'That image is too large. The maximum size is 5 MB.' }),
    );
  });
});
