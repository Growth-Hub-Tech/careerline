import * as Sentry from '@sentry/react';

// Addresses can carry secrets: reset and confirmation tokens in the query, invitation and
// download tokens in the path. Error reports keep the page, never those.
const TOKEN_IN_PATH = /\/(invitations\/token|invitations|reports|download)\/[^/?#]+/g;

export const scrubUrl = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin);
    const path = parsed.pathname.replace(TOKEN_IN_PATH, '/$1/:token');
    // The query and the hash are always left out
    return /^[a-z][a-z\d+.-]*:/i.test(url) ? `${parsed.origin}${path}` : path;
  } catch {
    return '';
  }
};

const scrubData = (data: Record<string, unknown> | undefined) => {
  if (!data) return data;
  const clean = { ...data };
  for (const key of ['url', 'from', 'to']) {
    if (typeof clean[key] === 'string') clean[key] = scrubUrl(clean[key]);
  }
  return clean;
};

// Errors from real users reach Sentry when VITE_SENTRY_DSN is set; nothing is sent otherwise
export const startErrorMonitoring = (dsn: string | undefined, environment: string) => {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment,
    // No user details, cookies, headers, request or response bodies, or query strings
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    beforeSend(event) {
      if (event.request?.url)
        event.request = { ...event.request, url: scrubUrl(event.request.url) };
      return event;
    },
    beforeBreadcrumb: (breadcrumb) => ({ ...breadcrumb, data: scrubData(breadcrumb.data) }),
  });
};
