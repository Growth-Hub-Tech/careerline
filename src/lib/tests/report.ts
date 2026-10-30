import type { ResultReport } from '../api/types';

interface WaitOptions {
  readonly tries?: number;
  readonly interval?: number;
  readonly wait?: (ms: number) => Promise<void>;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const waitForReport = async (
  load: () => Promise<ResultReport>,
  { tries = 10, interval = 3000, wait = sleep }: WaitOptions = {},
) => {
  let report = await load();

  for (let attempt = 1; attempt < tries && report.status === 'generating'; attempt += 1) {
    await wait(interval);
    report = await load();
  }

  return report;
};
