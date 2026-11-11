import { ApiError } from './ApiError';
import { NETWORK_MESSAGE, readError } from './readError';

type QueryValue = string | number | boolean | undefined;

type QueryParams = Readonly<Record<string, QueryValue>>;

interface HttpOptions {
  readonly query?: QueryParams;
  readonly headers?: Readonly<Record<string, string>>;
  readonly signal?: AbortSignal;
  // false marks a request that needs no session (signing in, the contact form), so its 401 is
  // not a session that ended
  readonly auth?: boolean;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// A stalled API must not leave a spinner running forever
export const REQUEST_TIMEOUT_MS = 20_000;

interface HttpClientOptions {
  readonly baseUrl: string;
  readonly isSignedIn?: () => boolean;
  readonly onUnauthorized?: () => void;
  readonly fetcher?: typeof fetch;
}

const buildUrl = (baseUrl: string, path: string, query: QueryParams | undefined) => {
  const url = `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });

  const search = params.toString();
  return search ? `${url}?${search}` : url;
};

const isEnvelope = (value: unknown): value is { success: true; data: unknown } =>
  typeof value === 'object' &&
  value !== null &&
  (value as Record<string, unknown>).success === true &&
  'data' in value;

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

const networkError = () => new ApiError({ status: 0, message: NETWORK_MESSAGE, code: 'network' });

// The session is the API's HttpOnly cookie, sent with every request (credentials: 'include'):
// page scripts never see the token
export const createHttpClient = ({
  baseUrl,
  isSignedIn = () => false,
  onUnauthorized,
  fetcher = (...args) => fetch(...args),
}: HttpClientOptions) => {
  const request = async <T>(
    method: Method,
    path: string,
    body: unknown,
    options: HttpOptions = {},
  ): Promise<T> => {
    const { query, headers: extra, signal, auth = true } = options;
    const headers = new Headers({ Accept: 'application/json', ...extra });

    let payload: BodyInit | undefined;
    if (body instanceof FormData || body instanceof URLSearchParams) {
      payload = body;
    } else if (body !== undefined) {
      headers.set('Content-Type', 'application/json');
      payload = JSON.stringify(body);
    }

    // One controller for the caller's signal (e.g. leaving the page) and the timeout. It covers
    // reading the body too. A timeout is a network error; the caller's own abort is rethrown.
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    const forwardAbort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    else signal?.addEventListener('abort', forwardAbort, { once: true });

    const settle = (error: unknown) => {
      if (isAbort(error) && !timedOut) return error;
      return networkError();
    };

    let response: Response;
    let text: string;
    try {
      try {
        response = await fetcher(buildUrl(baseUrl, path, query), {
          method,
          headers,
          body: payload,
          credentials: 'include',
          signal: controller.signal,
        });
      } catch (error) {
        throw settle(error);
      }

      if (!response.ok) {
        if (response.status === 401 && auth && isSignedIn()) onUnauthorized?.();
        throw await readError(response);
      }

      try {
        text = await response.text();
      } catch (error) {
        throw settle(error);
      }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', forwardAbort);
    }

    if (text === '') return undefined as T;

    try {
      const parsed: unknown = JSON.parse(text);
      return (isEnvelope(parsed) ? parsed.data : parsed) as T;
    } catch {
      throw new ApiError({
        status: response.status,
        message: 'The server sent a reply we could not read. Try again.',
        code: 'invalid_response',
      });
    }
  };

  return {
    get: <T>(path: string, options?: HttpOptions) => request<T>('GET', path, undefined, options),
    post: <T>(path: string, body?: unknown, options?: HttpOptions) =>
      request<T>('POST', path, body, options),
    put: <T>(path: string, body?: unknown, options?: HttpOptions) =>
      request<T>('PUT', path, body, options),
    patch: <T>(path: string, body?: unknown, options?: HttpOptions) =>
      request<T>('PATCH', path, body, options),
    delete: <T>(path: string, options?: HttpOptions) =>
      request<T>('DELETE', path, undefined, options),
  };
};
