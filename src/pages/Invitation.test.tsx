import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { invitationsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { SessionProvider } from '../lib/session';
import { readAttempt } from '../lib/tests/attemptStore';
import { INVITATION_PUBLIC } from '../test/fixtures/recruiter';
import { signInAs } from '../test/session';
import { Invitation } from './Invitation';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  invitationsApi: { open: vi.fn(), accept: vi.fn() },
}));

const SignInPage = () => {
  const { state } = useLocation() as { state: { from: { pathname: string } } };
  return <h1>Sign in, then back to {state.from.pathname}</h1>;
};

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/invitations/token-1']}>
      <SessionProvider>
        <Routes>
          <Route path="/invitations/:token" element={<Invitation />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/tests/:testId/attempt" element={<h1>Question page</h1>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

const invalidHeading = () =>
  screen.findByRole('heading', { level: 1, name: 'This link is invalid or has expired' });

beforeEach(() => {
  vi.mocked(invitationsApi.open).mockResolvedValue(INVITATION_PUBLIC);
  vi.mocked(invitationsApi.accept).mockResolvedValue({
    ...INVITATION_PUBLIC,
    status: 'accepted',
    attempt_id: 44,
  });
});

describe('Invitation', () => {
  it('shows a loader while the invitation is checked', () => {
    vi.mocked(invitationsApi.open).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(invitationsApi.open).toHaveBeenCalledWith('token-1');
  });

  it('says who is asking and what is tested', async () => {
    setup();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Brightway Recruiting has asked you to take a test',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Frontend Web Development')).toBeInTheDocument();
    expect(screen.getByText(/30 minutes/)).toBeInTheDocument();
    expect(screen.getByText('Please take this test before Friday.')).toBeInTheDocument();
  });

  it('explains what will be shared, with the agree box unticked', async () => {
    signInAs('self-test');
    setup();

    expect(
      await screen.findByText(/Brightway Recruiting will see your score, level, strengths/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'I agree to share this result with Brightway Recruiting',
      }),
    ).not.toBeChecked();
  });

  it('asks a visitor to sign in or create an account and comes back afterwards', async () => {
    setup();

    expect(await screen.findByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/sign-up',
    );
    await userEvent.click(screen.getByRole('link', { name: 'Sign in to continue' }));

    expect(
      screen.getByRole('heading', { name: 'Sign in, then back to /invitations/token-1' }),
    ).toBeInTheDocument();
  });

  it('starts the test only after the person agrees', async () => {
    signInAs('self-test');
    setup();

    const start = await screen.findByRole('button', { name: 'Agree and start the test' });
    expect(start).toBeDisabled();

    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(start);

    expect(invitationsApi.accept).toHaveBeenCalledWith('token-1');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Question page' }),
    ).toBeInTheDocument();
    expect(readAttempt(201)).toEqual({
      testId: 201,
      title: 'Frontend Web Development',
      attemptId: 44,
    });
  });

  it('continues a test that was already started', async () => {
    signInAs('self-test');
    vi.mocked(invitationsApi.open).mockResolvedValue({
      ...INVITATION_PUBLIC,
      status: 'accepted',
      attempt_id: 44,
    });
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Continue the test' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Question page' }),
    ).toBeInTheDocument();
    expect(readAttempt(201)?.attemptId).toBe(44);
  });

  it('says so when the test is already finished', async () => {
    vi.mocked(invitationsApi.open).mockResolvedValue({ ...INVITATION_PUBLIC, status: 'completed' });
    setup();

    expect(
      await screen.findByText('You have finished this test. Brightway Recruiting has your result.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it.each(['expired', 'revoked'] as const)('shows one page for a %s link', async (status) => {
    vi.mocked(invitationsApi.open).mockResolvedValue({ ...INVITATION_PUBLIC, status });
    setup();

    expect(await invalidHeading()).toBeInTheDocument();
  });

  it.each([404, 410, 500])('shows the same page when opening fails with %s', async (status) => {
    vi.mocked(invitationsApi.open).mockRejectedValue(
      new ApiError({ status, code: 'error', message: 'Nope.' }),
    );
    setup();

    expect(await invalidHeading()).toBeInTheDocument();
    expect(screen.getByText(/Ask the person who sent it for a new link/)).toBeInTheDocument();
  });

  it('says why the test could not start', async () => {
    signInAs('self-test');
    vi.mocked(invitationsApi.accept).mockRejectedValue(
      new ApiError({ status: 0, message: 'No connection.' }),
    );
    setup();

    await userEvent.click(await screen.findByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Agree and start the test' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
  });
});
