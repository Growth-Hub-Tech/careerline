import * as Sentry from '@sentry/react';
import type { BrowserOptions, ErrorEvent } from '@sentry/react';
import { scrubUrl, startErrorMonitoring } from './monitoring';

vi.mock('@sentry/react', () => ({ init: vi.fn() }));

describe('scrubUrl', () => {
  it.each([
    ['https://careerline.ng/reset-password?token=secret', 'https://careerline.ng/reset-password'],
    ['https://careerline.ng/verify-email?token=secret#top', 'https://careerline.ng/verify-email'],
    ['https://careerline.ng/invitations/secret', 'https://careerline.ng/invitations/:token'],
    [
      'https://api.example.ng/api/v1/invitations/token/secret/accept',
      'https://api.example.ng/api/v1/invitations/token/:token/accept',
    ],
    [
      'https://api.example.ng/api/v1/reports/secret',
      'https://api.example.ng/api/v1/reports/:token',
    ],
    [
      'https://api.example.ng/api/v1/privacy/data-exports/download/secret',
      'https://api.example.ng/api/v1/privacy/data-exports/download/:token',
    ],
    ['/invitations/secret?x=1', '/invitations/:token'],
    ['/dashboard', '/dashboard'],
  ])('keeps %s as %s', (url, clean) => {
    expect(scrubUrl(url)).toBe(clean);
  });
});

describe('startErrorMonitoring', () => {
  it('sends nothing without a DSN', () => {
    startErrorMonitoring(undefined, 'production');
    startErrorMonitoring('', 'production');

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it('starts without personal data and scrubs addresses from reports and breadcrumbs', () => {
    startErrorMonitoring('https://key@o1.ingest.sentry.io/1', 'staging');

    const options = vi.mocked(Sentry.init).mock.calls[0][0] as BrowserOptions;
    expect(options).toMatchObject({
      dsn: 'https://key@o1.ingest.sentry.io/1',
      environment: 'staging',
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: false,
        httpBodies: [],
        urlQueryParams: false,
      },
    });
    const event = options.beforeSend?.(
      { request: { url: 'https://careerline.ng/reset-password?token=secret' } } as ErrorEvent,
      {},
    ) as ErrorEvent;
    expect(event.request?.url).toBe('https://careerline.ng/reset-password');
    const crumb = options.beforeBreadcrumb?.({
      category: 'navigation',
      data: { from: '/invitations/secret', to: '/verify-email?token=secret' },
    });
    expect(crumb?.data).toEqual({ from: '/invitations/:token', to: '/verify-email' });
  });
});
