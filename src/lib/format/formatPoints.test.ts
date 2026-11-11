import { formatPoints } from './formatPoints';

describe('formatPoints', () => {
  it.each([
    [12, '+12 points'],
    [-3, '−3 points'],
    [0, '0 points'],
    [1, '+1 point'],
    [-1, '−1 point'],
  ])('shows %d as %s', (change, text) => {
    expect(formatPoints(change)).toBe(text);
  });
});
