import { EMPTY_VALUE } from './constants';

type DateInput = Date | string | number | null | undefined;

interface DateOptions {
  readonly withTime?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LAGOS_PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

export const formatDate = (value: DateInput, { withTime = false }: DateOptions = {}) => {
  if (value === null || value === undefined) return EMPTY_VALUE;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  const parts = Object.fromEntries(LAGOS_PARTS.formatToParts(date).map((p) => [p.type, p.value]));
  const day = `${Number(parts.day)} ${MONTHS[Number(parts.month) - 1]} ${parts.year}`;

  if (!withTime) return day;

  return `${day}, ${parts.hour.padStart(2, '0')}:${parts.minute.padStart(2, '0')}`;
};
