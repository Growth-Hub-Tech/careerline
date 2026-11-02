import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { catalogApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { SessionProvider } from '../lib/session';
import { SKILLS, TESTS } from '../test/fixtures/tests';
import { signInAs } from '../test/session';
import { SkillTests } from './SkillTests';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  catalogApi: { listSkills: vi.fn(), listTests: vi.fn() },
}));

const setup = () =>
  render(
    <SessionProvider>
      <MemoryRouter>
        <SkillTests />
      </MemoryRouter>
    </SessionProvider>,
  );

beforeEach(() => {
  signInAs('self-test');
  vi.mocked(catalogApi.listSkills).mockResolvedValue([...SKILLS.skills]);
  vi.mocked(catalogApi.listTests).mockResolvedValue(TESTS.items);
});

describe('SkillTests', () => {
  it('shows a loader while the tests arrive', () => {
    vi.mocked(catalogApi.listTests).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('welcomes the person by first name', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Welcome, Skye' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Self Tester dashboard')).toBeInTheDocument();
  });

  it('says what the tests give', async () => {
    setup();

    expect(await screen.findByText('Test your skills and get a real answer.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Choose a skill area below. You will receive a score along with your specific strengths and weaknesses when you finish.',
      ),
    ).toBeInTheDocument();
  });

  it('groups the skills that can be tested by category', async () => {
    setup();

    const group = await screen.findByRole('region', { name: 'Engineering and Development' });

    expect(
      within(group)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['Frontend Web Development', 'Backend Development', 'Version Control (Git)']);
    expect(screen.queryByRole('region', { name: 'Design & Product' })).not.toBeInTheDocument();
  });

  it('describes each skill on its card', async () => {
    setup();

    const card = await screen.findByRole('link', { name: /Version Control \(Git\)/ });

    expect(card).toHaveTextContent('Tests expertise in: Branching, merging, pull requests');
  });

  it('opens the test page from the whole card', async () => {
    setup();

    expect(await screen.findByRole('link', { name: /Backend Development/ })).toHaveAttribute(
      'href',
      '/tests/202',
    );
  });

  it('says so when there are no tests yet', async () => {
    vi.mocked(catalogApi.listTests).mockResolvedValue([]);

    setup();

    expect(await screen.findByText('No tests are available yet')).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(catalogApi.listTests)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(TESTS.items);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('region', { name: 'Engineering and Development' }),
    ).toBeInTheDocument();
  });
});
