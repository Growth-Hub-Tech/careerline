import { act, render, screen } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';

const goOffline = (offline: boolean) =>
  act(() => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(!offline);
    window.dispatchEvent(new Event(offline ? 'offline' : 'online'));
  });

afterEach(() => vi.restoreAllMocks());

describe('OfflineBanner', () => {
  it('shows nothing while online', () => {
    render(<OfflineBanner />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says so when the connection drops and hides when it comes back', () => {
    render(<OfflineBanner />);

    goOffline(true);
    expect(screen.getByRole('alert')).toHaveTextContent('You are offline.');

    goOffline(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
