import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { useUserStore } from '../lib/user';
import { Tasks } from './Tasks';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  apiGet: vi.fn(),
}));

const page = <T,>(items: T[]) => ({ items, total: items.length, limit: 50, offset: 0 });

const answer = (received: unknown[]) =>
  vi
    .mocked(apiGet)
    .mockImplementation((path: string) =>
      Promise.resolve(path === '/invitations/received' ? page(received) : page([])),
    );

const setup = () => {
  useUserStore.setState({
    user: { name: 'Skye Favour', email: 'skye@example.com', userType: 'self-test' },
  });
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('Tasks', () => {
  it('lists an open invitation above the account’s own tasks', async () => {
    answer([
      {
        token: 'abc',
        status: 'sent',
        invited_by: 'Acme Recruiting',
        full_name: 'Skye Favour',
        test_id: 201,
        test_title: 'Python',
        duration_minutes: 30,
        message: null,
        expires_at: '2026-12-01T09:00:00Z',
        attempt_id: null,
      },
    ]);
    setup();

    const list = await screen.findByRole('list', { name: 'Your invitations' });
    expect(
      within(list).getByText('Acme Recruiting invited you to take the Python test.'),
    ).toBeInTheDocument();
    expect(within(list).getByRole('link', { name: 'Open the invitation' })).toHaveAttribute(
      'href',
      '/invitations/abc',
    );
    expect(await screen.findByRole('list', { name: 'Your tasks' })).toBeInTheDocument();
  });

  it('shows no invitations section without an open invitation', async () => {
    answer([]);
    setup();

    expect(await screen.findByRole('list', { name: 'Your tasks' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Invitations' })).not.toBeInTheDocument();
  });
});
