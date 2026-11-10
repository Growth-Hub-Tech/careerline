import { ApiError } from './ApiError';
import { NETWORK_MESSAGE, readError } from './readError';

type QueryValue = string | number | boolean | undefined;

interface RequestOptions {
  readonly method?: string;
  readonly body?: unknown;
  readonly query?: Readonly<Record<string, QueryValue>>;
  readonly headers?: Readonly<Record<string, string>>;
  readonly signal?: AbortSignal;
  readonly auth?: boolean;
}

type ShortcutOptions = Omit<RequestOptions, 'method'>;

// A stalled API must not leave a spinner running forever
export const REQUEST_TIMEOUT_MS = 20_000;

interface ApiClientOptions {
  readonly baseUrl: string;
  readonly getToken: () => string | null | undefined;
  readonly onUnauthorized?: () => void;
  readonly fetcher?: typeof fetch;
}

const buildUrl = (baseUrl: string, path: string, query: RequestOptions['query']) => {
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

export const createApiClient = ({
  baseUrl,
  getToken,
  onUnauthorized,
  fetcher = (...args) => fetch(...args),
}: ApiClientOptions) => {
  const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const { method = 'GET', body, query, headers: extra, signal, auth = true } = options;
    const token = auth ? getToken() : null;
    const headers = new Headers({ Accept: 'application/json', ...extra });

    if (token) headers.set('Authorization', `Bearer ${token}`);

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
          signal: controller.signal,
        });
      } catch (error) {
        throw settle(error);
      }

      if (!response.ok) {
        if (response.status === 401 && token) onUnauthorized?.();
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
    request,
    get: <T>(path: string, options?: ShortcutOptions) => request<T>(path, { ...options }),
    post: <T>(path: string, options?: ShortcutOptions) =>
      request<T>(path, { ...options, method: 'POST' }),
    put: <T>(path: string, options?: ShortcutOptions) =>
      request<T>(path, { ...options, method: 'PUT' }),
    patch: <T>(path: string, options?: ShortcutOptions) =>
      request<T>(path, { ...options, method: 'PATCH' }),
    delete: <T>(path: string, options?: ShortcutOptions) =>
      request<T>(path, { ...options, method: 'DELETE' }),
  };
};
