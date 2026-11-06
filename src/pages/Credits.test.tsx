import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { paymentsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { CREDITS } from '../test/fixtures/payments';
import { Credits } from './Credits';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  paymentsApi: { credits: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <Credits />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.mocked(paymentsApi.credits).mockResolvedValue(CREDITS);
});

describe('Credits', () => {
  it('shows a loader while the credits arrive', () => {
    vi.mocked(paymentsApi.credits).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the balance with a way to buy more', async () => {
    setup();

    expect(await screen.findByRole('heading', { level: 1, name: 'Credits' })).toBeInTheDocument();
    expect(await screen.findByText('You have 3 credits.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buy credits' })).toHaveAttribute(
      'href',
      '/pricing?return=%2Fcredits',
    );
  });

  it('lists every change to the balance', async () => {
    setup();

    const table = await screen.findByRole('table', { name: 'Credit history' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Started a test');
    expect(rows[0]).toHaveTextContent('−2');
    expect(rows[1]).toHaveTextContent('Bought credits');
    expect(rows[1]).toHaveTextContent('+5');
  });

  it('says when there is no history yet', async () => {
    vi.mocked(paymentsApi.credits).mockResolvedValue({ credits_balance: 0, transactions: [] });
    setup();

    expect(await screen.findByText('You have 0 credits.')).toBeInTheDocument();
    expect(screen.getByText('No credit activity yet.')).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(paymentsApi.credits)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(CREDITS);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('You have 3 credits.')).toBeInTheDocument();
  });
});
