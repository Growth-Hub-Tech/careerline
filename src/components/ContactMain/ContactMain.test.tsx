import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { config } from '../../config';
import { ContactMain } from './ContactMain';

vi.mock('../../config', () => ({
  config: { contact: { email: '', phone: '', address: '' } },
}));

const contact = config.contact as { email: string; phone: string; address: string };

const setup = () =>
  render(
    <MemoryRouter>
      <ContactMain />
    </MemoryRouter>,
  );

describe('ContactMain', () => {
  afterEach(() => Object.assign(contact, { email: '', phone: '', address: '' }));

  it('lists the team’s direct channels, with no form', () => {
    Object.assign(contact, { email: 'hello@careerline.ng', phone: '+234 800 000 0000' });
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Contact us' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'hello@careerline.ng' })).toHaveAttribute(
      'href',
      'mailto:hello@careerline.ng',
    );
    expect(screen.getByRole('link', { name: '+234 800 000 0000' })).toHaveAttribute(
      'href',
      'tel:+2348000000000',
    );
    expect(screen.queryByText('Office')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('points to the Help Center while no contact details are set', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', '/help');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
