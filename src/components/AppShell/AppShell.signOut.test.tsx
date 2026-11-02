import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { NAV_BY_TYPE } from './navigation';

const setup = () => {
  const onSignOut = vi.fn();
  render(
    <MemoryRouter>
      <AppShell
        user={{ name: 'Skye Favour', role: 'Beginner' }}
        navigation={NAV_BY_TYPE.beginner}
        onSignOut={onSignOut}
      >
        <p>Page</p>
      </AppShell>
    </MemoryRouter>,
  );
  return { onSignOut };
};

describe('AppShell sign out', () => {
  it('has a Sign out button in the header', () => {
    setup();

    expect(
      within(screen.getByRole('banner')).getByRole('button', { name: 'Sign out' }),
    ).toBeInTheDocument();
  });

  it('asks to sign out when pressed', async () => {
    const { onSignOut } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
