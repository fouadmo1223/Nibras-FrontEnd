import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { withI18n } from '@/test/i18n';
import { useToastStore } from '@/stores/toast-store';
import LoginForm from './LoginForm';

const replace = vi.fn();
let searchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    withI18n(
      <QueryClientProvider client={client}>
        <LoginForm />
      </QueryClientProvider>,
    ),
  );
}

const respond = (status, body) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: status < 300, status, json: () => Promise.resolve(body) }));

beforeEach(() => {
  replace.mockReset();
  searchParams = new URLSearchParams();
});
afterEach(() => vi.unstubAllGlobals());

describe('LoginForm', () => {
  it('validates before calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter your email.')).toBeInTheDocument();
    expect(screen.getByText('Enter your password.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the error message returned by the API', async () => {
    respond(401, { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' } });
    renderForm();

    await userEvent.type(screen.getByLabelText('Email'), 'layla@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Incorrect email or password.')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('signs in and returns to a safe "next" destination', async () => {
    searchParams = new URLSearchParams('next=/account?tab=security');
    respond(200, { success: true, data: { user: { name: 'Layla' }, csrfToken: 'c' }, message: 'Welcome back, Layla.' });
    renderForm();

    await userEvent.type(screen.getByLabelText('Email'), 'layla@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'correct password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/en/account?tab=security'));
    // The API's success message is queued as a toast.
    expect(useToastStore.getState().toasts.at(-1)).toMatchObject({ tone: 'success', message: 'Welcome back, Layla.' });
    const [, init] = fetch.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ email: 'layla@example.com', password: 'correct password' });
    expect(init.credentials).toBe('include');
  });

  it('ignores an off-site "next" parameter', async () => {
    searchParams = new URLSearchParams('next=//evil.example');
    respond(200, { success: true, data: { user: {}, csrfToken: 'c' } });
    renderForm();

    await userEvent.type(screen.getByLabelText('Email'), 'layla@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'correct password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/en/account'));
  });
});
