import { ApiError } from './ApiError';
import { shouldRetry } from './queryClient';

const failure = (status: number) => new ApiError({ status, message: 'x' });

describe('when a failed request is tried again', () => {
  it('tries once more after a dropped connection or a server error', () => {
    expect(shouldRetry(0, failure(0))).toBe(true);
    expect(shouldRetry(0, failure(503))).toBe(true);
  });

  it('does not try a third time', () => {
    expect(shouldRetry(1, failure(503))).toBe(false);
  });

  it.each([400, 401, 403, 404, 409, 422, 429])('does not repeat a %s', (status) => {
    expect(shouldRetry(0, failure(status))).toBe(false);
  });

  it('does not repeat a request that was cancelled or failed in the page', () => {
    expect(shouldRetry(0, new DOMException('Aborted', 'AbortError'))).toBe(false);
    expect(shouldRetry(0, new Error('bug'))).toBe(false);
  });
});
