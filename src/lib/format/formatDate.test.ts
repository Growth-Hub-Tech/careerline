import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('shows day, short month and year', () => {
    expect(formatDate('2026-10-23T10:30:00Z')).toBe('23 Oct 2026');
  });

  it('does not pad the day', () => {
    expect(formatDate('2026-09-05T08:00:00Z')).toBe('5 Sep 2026');
  });

  it('adds the time in 24-hour form when asked', () => {
    expect(formatDate('2026-10-23T10:30:00Z', { withTime: true })).toBe('23 Oct 2026, 11:30');
  });

  it('reads the date in Lagos time, not UTC', () => {
    expect(formatDate('2026-10-23T23:30:00Z')).toBe('24 Oct 2026');
  });

  it('shows midnight as 00', () => {
    expect(formatDate('2026-10-23T23:05:00Z', { withTime: true })).toBe('24 Oct 2026, 00:05');
  });

  it('accepts a Date object', () => {
    expect(formatDate(new Date('2026-10-23T10:30:00Z'))).toBe('23 Oct 2026');
  });

  it('accepts a timestamp in milliseconds', () => {
    expect(formatDate(Date.UTC(2026, 9, 23, 10, 30))).toBe('23 Oct 2026');
  });

  it.each([null, undefined, 'not a date', Number.NaN])('shows a dash for %s', (value) => {
    expect(formatDate(value)).toBe('—');
  });
});
