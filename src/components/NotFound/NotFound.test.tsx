import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NotFound } from './NotFound';

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/a', '/missing']} initialIndex={1}>
      <Routes>
        <Route path="/a" element={<p>Page A</p>} />
        <Route path="/missing" element={<NotFound />} />
      </Routes>
    </MemoryRouter>,
  );

describe('NotFound', () => {
  it('says the page was not found', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('links to the homepage', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Go to homepage' })).toHaveAttribute('href', '/');
  });

  it('goes back to the previous page', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(screen.getByText('Page A')).toBeInTheDocument();
  });

  it('links to the contact page', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact');
  });
});
