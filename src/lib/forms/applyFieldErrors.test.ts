import { ApiError } from '../api/ApiError';
import { applyFieldErrors } from './applyFieldErrors';

describe('applyFieldErrors', () => {
  it('puts the server message on the matching field', () => {
    const setError = vi.fn();
    const error = new ApiError({
      status: 422,
      message: 'Invalid',
      fieldErrors: { email: 'Not a valid email', other: 'ignored' },
    });

    expect(applyFieldErrors(error, ['email', 'password'], setError)).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('email', { message: 'Not a valid email' });
  });

  it('reports nothing applied when no field matches', () => {
    const setError = vi.fn();

    expect(applyFieldErrors(new ApiError({ status: 500, message: 'x' }), ['email'], setError)).toBe(
      false,
    );
    expect(applyFieldErrors(new Error('x'), ['email'], setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
