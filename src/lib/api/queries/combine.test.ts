import type { UseQueryResult } from '@tanstack/react-query';
import { combineResults } from './combine';

const result = <T>(state: Partial<UseQueryResult<T>>) =>
  ({
    data: undefined,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...state,
  }) as UseQueryResult<T>;

describe('combining replies for one page', () => {
  it('has the data once every reply has arrived, in order', () => {
    const combined = combineResults([result({ data: 'plans' }), result({ data: 3 })] as const);

    expect(combined.data).toEqual(['plans', 3]);
    expect(combined.isPending).toBe(false);
  });

  it('counts a reply of null as arrived', () => {
    expect(combineResults([result({ data: null })] as const).data).toEqual([null]);
  });

  it('is still loading while one reply is missing', () => {
    const combined = combineResults([result({ data: 'plans' }), result({})] as const);

    expect(combined.data).toBeUndefined();
    expect(combined.isPending).toBe(true);
  });

  it('fails when a reply that never arrived failed', () => {
    const error = new Error('down');
    const combined = combineResults([
      result({ data: 1 }),
      result({ isError: true, error }),
    ] as const);

    expect(combined).toMatchObject({ isError: true, error, isPending: false, data: undefined });
  });

  it('keeps data shown when only a later refresh failed', () => {
    const combined = combineResults([
      result({ data: 1, isError: true, error: new Error('refresh failed') }),
    ] as const);

    expect(combined).toMatchObject({ isError: false, data: [1] });
  });

  it('asks again only for the replies that failed', () => {
    const ok = result({ data: 1 });
    const failed = result({ isError: true, error: new Error('down') });

    combineResults([ok, failed] as const).refetch();

    expect(ok.refetch).not.toHaveBeenCalled();
    expect(failed.refetch).toHaveBeenCalledTimes(1);
  });
});
