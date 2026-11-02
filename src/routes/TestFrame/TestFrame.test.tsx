import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TestFrame } from './TestFrame';

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/tests/abc']}>
      <Routes>
        <Route element={<TestFrame />}>
          <Route path="/tests/:testId" element={<h1>Question page</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('TestFrame', () => {
  it('names the test in the banner', () => {
    setup();

    expect(screen.getByRole('banner')).toHaveTextContent('Skill test');
  });

  it('shows the page in the main area', () => {
    setup();

    expect(
      within(screen.getByRole('main')).getByRole('heading', { name: 'Question page' }),
    ).toBeInTheDocument();
  });

  it('has no site navigation to wander off with', () => {
    setup();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('lets the person leave the test', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Exit test' })).toHaveAttribute('href', '/dashboard');
  });
});
