import { act, renderHook, waitFor } from '@testing-library/react';
import { useRequest } from './useRequest';

describe('useRequest', () => {
  it('starts loading and then has the data', async () => {
    const load = vi.fn().mockResolvedValue('hello');

    const { result } = renderHook(() => useRequest(load));

    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor(() => expect(result.current.state).toEqual({ status: 'success', data: 'hello' }));
  });

  it('keeps the error when loading fails', async () => {
    const failure = new Error('nope');
    const load = vi.fn().mockRejectedValue(failure);

    const { result } = renderHook(() => useRequest(load));

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error', error: failure }));
  });

  it('loads again on retry', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('nope')).mockResolvedValue('second time');
    const { result } = renderHook(() => useRequest(load));
    await waitFor(() => expect(result.current.state.status).toBe('error'));

    act(() => result.current.retry());

    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: 'success', data: 'second time' }),
    );
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads again when the loader changes', async () => {
    const first = vi.fn().mockResolvedValue('one');
    const second = vi.fn().mockResolvedValue('two');
    const { result, rerender } = renderHook(({ load }) => useRequest(load), {
      initialProps: { load: first },
    });
    await waitFor(() => expect(result.current.state.status).toBe('success'));

    rerender({ load: second });

    await waitFor(() => expect(result.current.state).toEqual({ status: 'success', data: 'two' }));
  });
});
