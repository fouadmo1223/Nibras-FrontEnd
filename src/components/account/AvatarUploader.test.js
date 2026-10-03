import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToastStore } from '@/stores/toast-store';
import AvatarUploader from './AvatarUploader';

const respond = (status, body) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: status < 300, status, json: () => Promise.resolve(body) }));

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

const pick = (file) => userEvent.upload(document.querySelector('input[type=file]'), file);
const png = new File([new Uint8Array([137, 80, 78, 71])], 'me.png', { type: 'image/png' });

afterEach(() => {
  vi.unstubAllGlobals();
  useToastStore.setState({ toasts: [] });
});

describe('AvatarUploader', () => {
  it('uploads as multipart and shows the API success message', async () => {
    const updated = { name: 'Layla Hassan', avatarUrl: 'http://localhost:5000/api/v1/media/avatars/u/a.webp' };
    respond(200, { success: true, data: updated, message: 'Your profile photo was updated.' });
    const client = renderUploader({ name: 'Layla Hassan', avatarUrl: null });

    expect(screen.getByText('LH')).toBeInTheDocument(); // initials fallback
    await pick(png);

    await vi.waitFor(() => expect(useToastStore.getState().toasts.at(-1)).toMatchObject({ tone: 'success', message: 'Your profile photo was updated.' }));
    const [url, init] = fetch.mock.calls[0];
    expect(url).toMatch(/\/users\/me\/avatar$/);
    expect(init.method).toBe('PUT');
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers['Content-Type']).toBeUndefined(); // browser sets the multipart boundary
    expect(client.getQueryData(['auth', 'session']).user.avatarUrl).toBe(updated.avatarUrl);
  });

  it('shows the API error message when the upload is rejected', async () => {
    respond(413, { success: false, error: { code: 'FILE_TOO_LARGE', message: 'That image is too large. The maximum size is 5 MB.' } });
    renderUploader({ name: 'Layla', avatarUrl: null });
    await pick(png);
    await vi.waitFor(() =>
      expect(useToastStore.getState().toasts.at(-1)).toMatchObject({ tone: 'error', message: 'That image is too large. The maximum size is 5 MB.' }),
    );
  });
});
