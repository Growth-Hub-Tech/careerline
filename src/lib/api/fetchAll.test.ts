import { fetchAll } from './fetchAll';

describe('fetchAll', () => {
  it('returns everything from a single page', async () => {
    const page = vi.fn().mockResolvedValue({ items: ['a', 'b'], total: 2 });

    await expect(fetchAll(page)).resolves.toEqual(['a', 'b']);
    expect(page).toHaveBeenCalledTimes(1);
    expect(page).toHaveBeenCalledWith(0);
  });

  it('keeps asking for pages until it has them all', async () => {
    const page = vi
      .fn()
      .mockResolvedValueOnce({ items: ['a', 'b'], total: 5 })
      .mockResolvedValueOnce({ items: ['c', 'd'], total: 5 })
      .mockResolvedValueOnce({ items: ['e'], total: 5 });

    await expect(fetchAll(page)).resolves.toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(page.mock.calls.map(([offset]) => offset)).toEqual([0, 2, 4]);
  });

  it('stops when a page comes back empty, even if the total says more', async () => {
    const page = vi
      .fn()
      .mockResolvedValueOnce({ items: ['a'], total: 3 })
      .mockResolvedValueOnce({ items: [], total: 3 });

    await expect(fetchAll(page)).resolves.toEqual(['a']);
  });

  it('passes on a failure', async () => {
    const page = vi.fn().mockRejectedValue(new Error('nope'));

    await expect(fetchAll(page)).rejects.toThrow('nope');
  });
});
