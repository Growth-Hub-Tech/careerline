import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ContactMain } from './ContactMain';

const contact = vi.hoisted(() => ({ email: '', phone: '', address: '' }));

vi.mock('../../config', () => ({ config: { apiUrl: '', contact } }));

const setup = (values: Partial<typeof contact>) => {
  Object.assign(contact, { email: '', phone: '', address: '' }, values);
  render(
    <MemoryRouter>
      <ContactMain />
    </MemoryRouter>,
  );
};

const card = (label: string) => screen.queryByRole('heading', { level: 2, name: label });

describe('ContactMain', () => {
  it('shows no contact cards when none is set, only the form', () => {
    setup({});

    expect(card('Email')).not.toBeInTheDocument();
    expect(card('Phone')).not.toBeInTheDocument();
    expect(card('Office')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('shows only the cards that have a value', () => {
    setup({ email: 'hello@careerline.ng' });

    expect(screen.getByRole('link', { name: 'hello@careerline.ng' })).toHaveAttribute(
      'href',
      'mailto:hello@careerline.ng',
    );
    expect(card('Phone')).not.toBeInTheDocument();
    expect(card('Office')).not.toBeInTheDocument();
  });

  it('shows every channel when all are set, with a dialable phone link', () => {
    setup({
      email: 'hello@careerline.ng',
      phone: '+234 (801) 234-5678',
      address: '1 Marina, Lagos',
    });

    expect(screen.getByRole('link', { name: '+234 (801) 234-5678' })).toHaveAttribute(
      'href',
      'tel:+2348012345678',
    );
    expect(screen.getByText('1 Marina, Lagos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start a new chat' })).not.toBeInTheDocument();
  });
});
