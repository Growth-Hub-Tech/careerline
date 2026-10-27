import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beginnerApi, programmesApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { PATH, PROGRAMME } from '../test/fixtures/beginner';
import { Programme } from './Programme';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  beginnerApi: { getIntake: vi.fn(), submitIntake: vi.fn(), getRecommendations: vi.fn() },
  programmesApi: { get: vi.fn(), recordClick: vi.fn() },
}));

const setup = (address = '/programmes/5', onOpen = vi.fn()) => {
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/programmes/:programmeId" element={<Programme onOpen={onOpen} />} />
        <Route path="*" element={<p>Not found</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return { onOpen };
};

beforeEach(() => {
  vi.mocked(programmesApi.get).mockResolvedValue(PROGRAMME);
  vi.mocked(beginnerApi.getRecommendations).mockResolvedValue(PATH);
});

describe('Programme', () => {
  it('shows a loader while the programme arrives', () => {
    vi.mocked(programmesApi.get).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the brand and the beginner path in the banner', async () => {
    setup();
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByRole('banner')).toHaveTextContent('CareerLine AI');
    expect(screen.getByRole('banner')).toHaveTextContent('Beginner path');
  });

  it('names the career path and the match', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Product Design' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your top recommended path, based on a 92% match with your assessment answers.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the recommended programme and what it involves', async () => {
    setup();

    const card = await screen.findByRole('region', { name: PROGRAMME.name });

    expect(within(card).getByText('Recommended programme')).toBeInTheDocument();
    expect(card).toHaveTextContent(PROGRAMME.summary);
    expect(card).toHaveTextContent('Incubate');
    expect(card).toHaveTextContent('Online');
    expect(card).toHaveTextContent('12 weeks');
    expect(card).toHaveTextContent('₦150,000');
  });

  it('explains why this programme using the reasons from the API', async () => {
    setup();

    const panel = await screen.findByRole('region', { name: 'Why this programme' });

    expect(within(panel).getAllByRole('listitem')).toHaveLength(1);
    expect(panel).toHaveTextContent(PATH.recommendations[0].reasons[0]);
  });

  it('discloses a partner programme', async () => {
    vi.mocked(programmesApi.get).mockResolvedValue({
      ...PROGRAMME,
      programme_id: 7,
      name: 'Partner Bootcamp',
      provider: 'CodeCo',
      provider_type: 'partner',
      mode: 'hybrid',
      duration_weeks: 1,
      price: { amount: 0, currency: 'NGN' },
    });

    setup('/programmes/7');

    const card = await screen.findByRole('region', { name: 'Partner Bootcamp' });
    expect(within(card).getByText('Partner programme')).toBeInTheDocument();
    expect(card).toHaveTextContent('CareerLine may earn a referral fee');
    expect(card).toHaveTextContent('Free');
    expect(card).toHaveTextContent('Hybrid');
    expect(card).toHaveTextContent('1 week');
  });

  it('records the click and opens the programme', async () => {
    vi.mocked(programmesApi.recordClick).mockResolvedValue({
      click_id: 'c1',
      programme_id: 5,
      redirect_url: 'https://incubate.example/go?ref=careerline',
      clicked_at: '2026-10-26T08:00:00Z',
    });
    const { onOpen } = setup();

    await userEvent.click(await screen.findByRole('button', { name: 'View programme details' }));

    await waitFor(() =>
      expect(onOpen).toHaveBeenCalledWith('https://incubate.example/go?ref=careerline'),
    );
    expect(programmesApi.recordClick).toHaveBeenCalledWith(5, { source: 'beginner_path' });
  });

  it('says so when the click cannot be recorded', async () => {
    vi.mocked(programmesApi.recordClick).mockRejectedValue(
      new ApiError({ status: 500, message: 'Something went wrong on our side.' }),
    );
    const { onOpen } = setup();

    await userEvent.click(await screen.findByRole('button', { name: 'View programme details' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on our side.');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('still shows the programme when the match cannot be loaded', async () => {
    vi.mocked(beginnerApi.getRecommendations).mockRejectedValue(new Error('offline'));

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: PROGRAMME.name }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Why this programme' })).not.toBeInTheDocument();
  });

  it('sends an unknown programme to the not found page', async () => {
    vi.mocked(programmesApi.get).mockRejectedValue(
      new ApiError({ status: 404, message: 'Not Found' }),
    );

    setup('/programmes/999');

    expect(await screen.findByText('Not found')).toBeInTheDocument();
  });

  it('sends an address that is not a number to the not found page', () => {
    setup('/programmes/product-design');

    expect(screen.getByText('Not found')).toBeInTheDocument();
    expect(programmesApi.get).not.toHaveBeenCalled();
  });

  it('shows other errors with a retry', async () => {
    vi.mocked(programmesApi.get)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(PROGRAMME);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
