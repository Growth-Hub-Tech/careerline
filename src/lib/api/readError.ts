import { ApiError } from './ApiError';

const MESSAGES: Readonly<Partial<Record<number, string>>> = {
  400: 'That request was not valid. Check what you entered and try again.',
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have access to this.',
  404: 'We could not find what you asked for.',
  409: 'That conflicts with something that already exists.',
  422: 'Some of what you entered needs fixing.',
  429: 'Too many tries. Wait a moment and try again.',
};

export const NETWORK_MESSAGE =
  'We could not reach the server. Check your connection and try again.';

export const messageForStatus = (status: number) =>
  MESSAGES[status] ??
  (status >= 500
    ? 'Something went wrong on our side. Try again in a moment.'
    : 'Something went wrong. Try again.');

type Body = Readonly<Record<string, unknown>>;

const firstString = (source: Body, keys: readonly string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return undefined;
};

const firstMessage = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value))
    return value.find((item) => typeof item === 'string') as string | undefined;
  return undefined;
};

const readFieldErrors = (value: unknown): Record<string, string> => {
  const found: Record<string, string> = {};

  if (Array.isArray(value)) {
    value.forEach((item: unknown) => {
      if (typeof item !== 'object' || item === null) return;
      const { field, message } = item as Body;
      if (typeof field === 'string' && typeof message === 'string') found[field] = message;
    });
  } else if (typeof value === 'object' && value !== null) {
    Object.entries(value).forEach(([field, entry]) => {
      const message = firstMessage(entry);
      if (message) found[field] = message;
    });
  }

  return found;
};

const asBody = (value: unknown): Body | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Body)
    : undefined;

const readRetryAfter = (response: Response) => {
  const seconds = Number(response.headers.get('retry-after'));
  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : undefined;
};

export const readError = async (response: Response) => {
  let body: Body = {};

  try {
    body = asBody(await response.json()) ?? {};
  } catch {
    body = {};
  }

  const error = asBody(body.error) ?? body;

  return new ApiError({
    status: response.status,
    message:
      firstString(error, ['message', 'detail', 'title']) ?? messageForStatus(response.status),
    code: firstString(error, ['code', 'errorCode']),
    reference:
      firstString(error, ['request_id', 'requestId', 'reference']) ??
      response.headers.get('x-request-id') ??
      undefined,
    details: firstString(error, ['details']),
    retryAfter: readRetryAfter(response),
    fieldErrors: readFieldErrors(error.errors ?? error.fieldErrors ?? body.errors),
  });
};
