import { REPORT_FAILED, REPORT_GENERATING, REPORT_READY } from '../../test/fixtures/results';
import { waitForReport } from './report';

const noWait = () => Promise.resolve();

describe('waitForReport', () => {
  it('returns a report that is ready straight away', async () => {
    const load = vi.fn().mockResolvedValue(REPORT_READY);

    expect(await waitForReport(load, { wait: noWait })).toEqual(REPORT_READY);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('asks again while the report is being made', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce(REPORT_GENERATING)
      .mockResolvedValueOnce(REPORT_GENERATING)
      .mockResolvedValue(REPORT_READY);
    const wait = vi.fn(noWait);

    expect(await waitForReport(load, { wait, interval: 2000 })).toEqual(REPORT_READY);
    expect(load).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledWith(2000);
  });

  it('stops at a failed report', async () => {
    const load = vi.fn().mockResolvedValueOnce(REPORT_GENERATING).mockResolvedValue(REPORT_FAILED);

    expect(await waitForReport(load, { wait: noWait })).toEqual(REPORT_FAILED);
  });

  it('gives up after the last try and returns what it has', async () => {
    const load = vi.fn().mockResolvedValue(REPORT_GENERATING);

    expect(await waitForReport(load, { wait: noWait, tries: 4 })).toEqual(REPORT_GENERATING);
    expect(load).toHaveBeenCalledTimes(4);
  });

  it('passes on an error', async () => {
    const load = vi.fn().mockRejectedValue(new Error('offline'));

    await expect(waitForReport(load, { wait: noWait })).rejects.toThrow('offline');
  });
});
