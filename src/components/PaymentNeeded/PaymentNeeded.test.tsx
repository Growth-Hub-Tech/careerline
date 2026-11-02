import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PaymentNeeded } from './PaymentNeeded';

const setup = (props: Partial<Parameters<typeof PaymentNeeded>[0]> = {}) =>
  render(
    <MemoryRouter>
      <PaymentNeeded priceCredits={2} balance={1} {...props} />
    </MemoryRouter>,
  );

describe('PaymentNeeded', () => {
  it('is a named region', () => {
    setup();

    expect(screen.getByRole('region', { name: 'Payment needed' })).toBeInTheDocument();
  });

  it('shows the price and balance the server sent', () => {
    setup({ priceCredits: 5, balance: 2 });

    expect(screen.getByText('This test costs 5 credits.')).toBeInTheDocument();
    expect(screen.getByText('You have 2 credits. Buy 3 more to start.')).toBeInTheDocument();
  });

  it('uses the singular for one credit', () => {
    setup({ priceCredits: 1, balance: 0 });

    expect(screen.getByText('This test costs 1 credit.')).toBeInTheDocument();
    expect(screen.getByText('You have 0 credits. Buy 1 more to start.')).toBeInTheDocument();
  });

  it('leaves out the balance when it is not known', () => {
    setup({ balance: undefined });

    expect(screen.getByText('This test costs 2 credits.')).toBeInTheDocument();
    expect(screen.queryByText(/You have/)).not.toBeInTheDocument();
  });

  it('links to buying credits and back to the tests', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Buy credits' })).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'Back to tests' })).toHaveAttribute('href', '/tests');
  });

  it('can send the person somewhere else to buy', () => {
    setup({ buyHref: '/credits' });

    expect(screen.getByRole('link', { name: 'Buy credits' })).toHaveAttribute('href', '/credits');
  });
});
