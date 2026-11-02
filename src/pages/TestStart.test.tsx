import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { attemptsApi, catalogApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { readAttempt, saveAttempt } from '../lib/tests/attemptStore';
import {
  ACCESS_SHORT_OF_CREDITS,
  ACCESS_WITH_CREDITS,
  STARTED_ATTEMPT,
  TEST_DETAIL,
} from '../test/fixtures/tests';
import { signInAs } from '../test/session';
import { TestStart } from './TestStart';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  catalogApi: { getTest: vi.fn(), getAccess: vi.fn() },
  attemptsApi: { start: vi.fn() },
}));

const setup = (address = '/tests/202') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/tests/:testId" element={<TestStart />} />
        <Route path="/tests/:testId/attempt" element={<h1>Question page</h1>} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const paymentPanel = () => screen.queryByRole('region', { name: 'Payment needed' });

beforeEach(() => {
  signInAs('self-test');
  vi.mocked(attemptsApi.start).mockResolvedValue(STARTED_ATTEMPT);
  vi.mocked(catalogApi.getTest).mockResolvedValue(TEST_DETAIL);
  vi.mocked(catalogApi.getAccess).mockResolvedValue(ACCESS_WITH_CREDITS);
});

describe('TestStart', () => {
  it('shows a loader while the test arrives', () => {
    vi.mocked(catalogApi.getAccess).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('asks for the test in the address', async () => {
    setup('/tests/208');

    await screen.findByRole('heading', { level: 1 });

    expect(catalogApi.getTest).toHaveBeenCalledWith(208);
    expect(catalogApi.getAccess).toHaveBeenCalledWith(208);
  });

  it('names the test and says what it involves', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Backend Development' }),
    ).toBeInTheDocument();
    expect(screen.getByText(TEST_DETAIL.description)).toBeInTheDocument();
    expect(screen.getByText('25 questions · 30 minutes · Adaptive')).toBeInTheDocument();
    expect(screen.getByText('A score for each sub-skill')).toBeInTheDocument();
  });

  it('says what starting will use from the balance', async () => {
    setup();

    expect(
      await screen.findByText('This test uses 2 credits. You have 3 credits.'),
    ).toBeInTheDocument();
    expect(paymentPanel()).not.toBeInTheDocument();
  });

  it('says when the test is free', async () => {
    vi.mocked(catalogApi.getAccess).mockResolvedValue({
      ...ACCESS_WITH_CREDITS,
      reason: 'free',
      price_credits: 0,
    });

    setup();

    expect(await screen.findByText('This test is free.')).toBeInTheDocument();
  });

  it('says when a subscription covers the test', async () => {
    vi.mocked(catalogApi.getAccess).mockResolvedValue({
      ...ACCESS_WITH_CREDITS,
      reason: 'subscription',
    });

    setup();

    expect(await screen.findByText('Your subscription covers this test.')).toBeInTheDocument();
  });

  it('shows the payment panel with the price the server sent', async () => {
    vi.mocked(catalogApi.getAccess).mockResolvedValue(ACCESS_SHORT_OF_CREDITS);

    setup();

    expect(await screen.findByRole('region', { name: 'Payment needed' })).toHaveTextContent(
      'This test costs 2 credits.You have 1 credit. Buy 1 more to start.',
    );
  });

  it('shows the payment panel when the server answers payment required', async () => {
    vi.mocked(catalogApi.getAccess).mockRejectedValue(
      new ApiError({ status: 402, code: 'payment_required', message: 'Payment required.' }),
    );

    setup();

    const panel = await screen.findByRole('region', { name: 'Payment needed' });
    expect(panel).toHaveTextContent('This test costs 2 credits.');
    expect(panel).not.toHaveTextContent('You have');
  });

  it('sends an unknown test to page not found', async () => {
    vi.mocked(catalogApi.getTest).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('sends an address that is not a test id to page not found', () => {
    setup('/tests/abc');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(catalogApi.getTest).not.toHaveBeenCalled();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(catalogApi.getTest)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(TEST_DETAIL);

    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Backend Development' }),
    ).toBeInTheDocument();
  });

  it('offers the levels of the test, starting with the first', async () => {
    setup();

    const levels = await screen.findByRole('radiogroup', { name: 'Choose your level' });

    expect(
      within(levels)
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('value')),
    ).toEqual(['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED']);
    expect(within(levels).getByRole('radio', { name: 'Beginner' })).toBeChecked();
  });

  it('starts the test at the chosen level and opens the first question', async () => {
    setup();

    await userEvent.click(await screen.findByRole('radio', { name: 'Junior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Start test' }));

    expect(attemptsApi.start).toHaveBeenCalledWith(TEST_DETAIL.skill_id, 'JUNIOR');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Question page' }),
    ).toBeInTheDocument();
    expect(readAttempt(202)).toEqual({
      testId: 202,
      title: 'Backend Development',
      attempt: STARTED_ATTEMPT,
      answers: [],
    });
  });

  it('starts only once when Start test is clicked twice', async () => {
    vi.mocked(attemptsApi.start).mockReturnValue(new Promise(() => undefined));
    setup();

    await userEvent.dblClick(await screen.findByRole('button', { name: 'Start test' }));

    expect(attemptsApi.start).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Start test' })).toBeDisabled();
  });

  it('says why the test could not start', async () => {
    vi.mocked(attemptsApi.start).mockRejectedValue(
      new ApiError({ status: 400, code: 'bad_request', message: 'Invalid level.' }),
    );
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Start test' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid level.');
    expect(screen.getByRole('button', { name: 'Start test' })).toBeEnabled();
  });

  it('offers to continue a test that is already in progress', async () => {
    saveAttempt({
      testId: 202,
      title: 'Backend Development',
      attempt: STARTED_ATTEMPT,
      answers: [],
    });
    setup();

    expect(await screen.findByRole('link', { name: 'Continue test' })).toHaveAttribute(
      'href',
      '/tests/202/attempt',
    );
    expect(screen.queryByRole('button', { name: 'Start test' })).not.toBeInTheDocument();
  });

  it('does not offer to start when payment is needed', async () => {
    vi.mocked(catalogApi.getAccess).mockResolvedValue(ACCESS_SHORT_OF_CREDITS);
    setup();

    await screen.findByRole('region', { name: 'Payment needed' });

    expect(screen.queryByRole('button', { name: 'Start test' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});
