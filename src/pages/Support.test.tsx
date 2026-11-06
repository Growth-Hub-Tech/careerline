import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Support } from './Support';

const setup = () =>
  render(
    <MemoryRouter>
      <Support />
    </MemoryRouter>,
  );

describe('Support', () => {
  it('has a main heading', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Support' })).toBeInTheDocument();
  });

  it('points to the answers first', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', '/help');
  });

  it('offers a form to send the team a message', () => {
    setup();

    expect(screen.getByRole('region', { name: 'Send us a message' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('asks for the payment reference for payment problems', () => {
    setup();

    expect(screen.getByText(/include your payment reference/)).toBeInTheDocument();
  });
});
