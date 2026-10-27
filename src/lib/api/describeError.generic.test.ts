import { ApiError } from './ApiError';
import { describeError } from './describeError';

describe('describeError', () => {
  it('does not read a conflict as a taken email', () => {
    const error = new ApiError({ status: 409, code: 'conflict', message: 'Already handled.' });

    expect(describeError(error)).toBe('Already handled.');
  });

  it('says how long to wait after too many requests', () => {
    const error = new ApiError({ status: 429, message: 'x', retryAfter: 30 });

    expect(describeError(error)).toBe('Too many tries. Try again in 30 seconds.');
  });

  it('adds the reference to a server error', () => {
    const error = new ApiError({ status: 503, message: 'Try again shortly.', reference: 'req-1' });

    expect(describeError(error)).toBe('Try again shortly. Reference: req-1');
  });

  it('hides errors that did not come from the API', () => {
    expect(describeError(new Error('boom'))).toBe('Something went wrong. Try again.');
  });
});
