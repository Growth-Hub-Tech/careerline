import { render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { beginnerApi, programmesApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { PATH, PROGRAMME, QUESTIONNAIRE } from '../test/fixtures/beginner';
import { signInAs } from '../test/session';
import { getRoutes } from './index';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  beginnerApi: { getIntake: vi.fn(), submitIntake: vi.fn(), getRecommendations: vi.fn() },
  programmesApi: { get: vi.fn(), recordClick: vi.fn() },
}));

const Routes = () => useRoutes(getRoutes());

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes />
    </MemoryRouter>,
  );

const shellNav = () => screen.queryByRole('navigation', { name: 'Main' });

describe('beginner flow routes', () => {
  beforeEach(() => {
    signInAs();
    vi.mocked(beginnerApi.getIntake).mockResolvedValue(QUESTIONNAIRE);
    vi.mocked(beginnerApi.getRecommendations).mockResolvedValue(PATH);
    vi.mocked(programmesApi.get).mockResolvedValue(PROGRAMME);
  });

  it('serves the assessment outside the app shell', async () => {
    renderAt('/assessment');

    expect(
      await screen.findByRole('heading', { level: 2, name: QUESTIONNAIRE.questions[0].text }),
    ).toBeInTheDocument();
    expect(shellNav()).not.toBeInTheDocument();
  });

  it('sends the matching screen without answers back to the assessment', async () => {
    renderAt('/assessment/processing');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Career assessment' }),
    ).toBeInTheDocument();
  });

  it('serves the results outside the app shell', async () => {
    renderAt('/assessment/results');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Congratulations/ }),
    ).toBeInTheDocument();
    expect(shellNav()).not.toBeInTheDocument();
  });

  it('serves a programme outside the app shell', async () => {
    renderAt('/programmes/5');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Product Design' }),
    ).toBeInTheDocument();
    expect(shellNav()).not.toBeInTheDocument();
  });

  it('shows the not found page for an unknown programme', async () => {
    vi.mocked(programmesApi.get).mockRejectedValue(
      new ApiError({ status: 404, message: 'Not Found' }),
    );

    renderAt('/programmes/999');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });
});
