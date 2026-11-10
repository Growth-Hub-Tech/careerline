// A change in score, signed: "+12 points", "−3 points", "0 points", "+1 point"
export const formatPoints = (change: number) =>
  `${change > 0 ? '+' : change < 0 ? '−' : ''}${Math.abs(change)} ${Math.abs(change) === 1 ? 'point' : 'points'}`;
