import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { privacyApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { consents, dataExport } from '../test/fixtures/privacy';
import { PrivacyCentre } from './PrivacyCentre';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  privacyApi: {
    getConsents: vi.fn(),
    updateConsents: vi.fn(),
    requestExport: vi.fn(),
    getExport: vi.fn(),
    requestDeletion: vi.fn(),
    cancelDeletion: vi.fn(),
  },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <PrivacyCentre pollInterval={5} />
    </MemoryRouter>,
  );

const section = (name: string) => screen.findByRole('region', { name });

beforeEach(() => {
  vi.mocked(privacyApi.getConsents).mockResolvedValue(consents());
  vi.mocked(privacyApi.updateConsents).mockImplementation(async (items) => {
    const current = consents();
    return {
      items: current.items.map((item) => {
        const change = items.find((next) => next.key === item.key);
        return change ? { ...item, granted: change.granted } : item;
      }),
    };
  });
});

describe('PrivacyCentre', () => {
  it('shows a loader while the settings arrive', () => {
    vi.mocked(privacyApi.getConsents).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has a main heading', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Privacy centre' }),
    ).toBeInTheDocument();
  });

  it('shows the error and tries again on request', async () => {
    vi.mocked(privacyApi.getConsents)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(consents());
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await section('Who can see your results')).toBeInTheDocument();
  });

  describe('who can see your results', () => {
    it('says recruiters can see them', async () => {
      setup();

      expect(await section('Who can see your results')).toHaveTextContent(
        'Recruiters on CareerLine can see your profile and your test results.',
      );
    });

    it('takes back access after asking first', async () => {
      setup();
      const results = await section('Who can see your results');

      await userEvent.click(within(results).getByRole('button', { name: 'Take back access' }));
      const dialog = screen.getByRole('dialog', { name: 'Take back access?' });
      expect(privacyApi.updateConsents).not.toHaveBeenCalled();
      await userEvent.click(within(dialog).getByRole('button', { name: 'Take back access' }));

      expect(privacyApi.updateConsents).toHaveBeenCalledWith([
        { key: 'share_profile_with_recruiters', granted: false },
      ]);
      expect(
        await within(results).findByText('Only you can see your results.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keeps access when the person cancels', async () => {
      setup();
      const results = await section('Who can see your results');

      await userEvent.click(within(results).getByRole('button', { name: 'Take back access' }));
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(privacyApi.updateConsents).not.toHaveBeenCalled();
      expect(results).toHaveTextContent('Recruiters on CareerLine can see your profile');
    });

    it('shares again on request', async () => {
      vi.mocked(privacyApi.getConsents).mockResolvedValue(consents(false));
      setup();
      const results = await section('Who can see your results');

      await userEvent.click(within(results).getByRole('button', { name: 'Share with recruiters' }));

      expect(privacyApi.updateConsents).toHaveBeenCalledWith([
        { key: 'share_profile_with_recruiters', granted: true },
      ]);
    });
  });

  describe('emails and research', () => {
    it('shows each choice as it is saved', async () => {
      setup();
      const emails = await section('Emails and research');

      expect(within(emails).getByRole('checkbox', { name: /news and offers/ })).not.toBeChecked();
      expect(within(emails).getByRole('checkbox', { name: /help improve/ })).toBeChecked();
    });

    it('saves a change straight away', async () => {
      setup();
      const emails = await section('Emails and research');

      await userEvent.click(within(emails).getByRole('checkbox', { name: /news and offers/ }));

      expect(privacyApi.updateConsents).toHaveBeenCalledWith([
        { key: 'marketing_emails', granted: true },
      ]);
      expect(
        await within(emails).findByRole('checkbox', { name: /news and offers/ }),
      ).toBeChecked();
    });

    it('says when a change could not be saved and keeps the old choice', async () => {
      vi.mocked(privacyApi.updateConsents).mockRejectedValue(
        new ApiError({ status: 500, message: 'Something went wrong on our side.' }),
      );
      setup();
      const emails = await section('Emails and research');

      await userEvent.click(within(emails).getByRole('checkbox', { name: /news and offers/ }));

      expect(await within(emails).findByRole('alert')).toHaveTextContent(
        'Something went wrong on our side.',
      );
      expect(within(emails).getByRole('checkbox', { name: /news and offers/ })).not.toBeChecked();
    });
  });

  describe('download my data', () => {
    it('prepares the file and gives the download link when ready', async () => {
      vi.mocked(privacyApi.requestExport).mockResolvedValue(dataExport('queued'));
      vi.mocked(privacyApi.getExport)
        .mockResolvedValueOnce(dataExport('queued'))
        .mockResolvedValue(dataExport('ready'));
      setup();
      const data = await section('Download your data');

      await userEvent.click(within(data).getByRole('button', { name: 'Download my data' }));

      const link = await within(data).findByRole('link', { name: 'Download your file' });
      expect(link).toHaveAttribute('href', 'https://files.test/export-4.zip');
      expect(data).toHaveTextContent('The link works until 10 Nov 2026.');
      expect(privacyApi.getExport).toHaveBeenCalledWith(4);
    });

    it('says when the link has expired', async () => {
      vi.mocked(privacyApi.requestExport).mockResolvedValue(dataExport('expired'));
      setup();
      const data = await section('Download your data');

      await userEvent.click(within(data).getByRole('button', { name: 'Download my data' }));

      expect(
        await within(data).findByText('That download link has expired. Ask for a new copy.'),
      ).toBeInTheDocument();
      expect(within(data).getByRole('button', { name: 'Download my data' })).toBeEnabled();
    });
  });

  describe('delete my account', () => {
    const askToDelete = async () => {
      const danger = await section('Delete your account');
      await userEvent.type(within(danger).getByLabelText('Password'), 'secret123');
      await userEvent.click(within(danger).getByRole('button', { name: 'Delete my account' }));
      return danger;
    };

    it('needs the password', async () => {
      setup();
      const danger = await section('Delete your account');

      await userEvent.click(within(danger).getByRole('button', { name: 'Delete my account' }));

      expect(within(danger).getByText('Enter your password to confirm.')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('asks first, then schedules the deletion and offers to cancel it', async () => {
      vi.mocked(privacyApi.requestDeletion).mockResolvedValue({
        status: 'scheduled',
        requested_at: '2026-11-03T09:00:00Z',
        scheduled_for: '2026-12-03T09:00:00Z',
      });
      vi.mocked(privacyApi.cancelDeletion).mockResolvedValue({
        status: 'cancelled',
        requested_at: '2026-11-03T09:00:00Z',
        scheduled_for: null,
      });
      setup();
      const danger = await askToDelete();

      const dialog = screen.getByRole('dialog', { name: 'Delete your account?' });
      expect(privacyApi.requestDeletion).not.toHaveBeenCalled();
      await userEvent.click(within(dialog).getByRole('button', { name: 'Delete my account' }));

      expect(privacyApi.requestDeletion).toHaveBeenCalledWith({
        password: 'secret123',
        reason: null,
      });
      expect(
        await within(danger).findByText('Your account will be deleted on 3 Dec 2026.'),
      ).toBeInTheDocument();

      await userEvent.click(within(danger).getByRole('button', { name: 'Cancel deletion' }));

      expect(
        await within(danger).findByText('Your account will not be deleted.'),
      ).toBeInTheDocument();
    });

    it('says when the password is wrong', async () => {
      vi.mocked(privacyApi.requestDeletion).mockRejectedValue(
        new ApiError({ status: 400, code: 'wrong_password', message: 'Wrong password.' }),
      );
      setup();
      const danger = await askToDelete();

      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete my account' }),
      );

      expect(await within(danger).findByRole('alert')).toHaveTextContent('Wrong password.');
    });
  });
});
