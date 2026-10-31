import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { withI18n } from '@/test/i18n';
import { useToastStore } from '@/stores/toast-store';
import { tokenStorage } from '@/lib/token-storage';
import SignOutButton from './SignOutButton';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

beforeAll(() => {
  // jsdom may not implement modal dialogs; emulate the open attribute.
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  vi.unstubAllGlobals();
  replace.mockReset();
  useToastStore.setState({ toasts: [] });
  tokenStorage.clear();
});

function renderButton() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    withI18n(
      <QueryClientProvider client={client}>
        <SignOutButton />
      </QueryClientProvider>,
    ),
  );
}

describe('SignOutButton', () => {
  it('asks for confirmation and does nothing on cancel', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.getByRole('dialog', { name: 'Sign out of Nibras?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('signs out after confirming and shows the API message', async () => {
    tokenStorage.setRefreshToken('refresh-1');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: null, message: 'You have been signed out.' }) }),
    );
    renderButton();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(dialog.querySelectorAll('button')[1]); // confirm

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/en/login'));
    expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/logout$/);
    expect(useToastStore.getState().toasts.at(-1)).toMatchObject({ message: 'You have been signed out.' });
  });
});
