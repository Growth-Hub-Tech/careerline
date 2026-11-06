import { compareToStandard } from './levels';

describe('compareToStandard', () => {
  it('says how far below the standard a level is', () => {
    expect(compareToStandard('JUNIOR', 'MID')).toBe('Mid: 1 level below');
    expect(compareToStandard('BEGINNER', 'ADVANCED')).toBe('Advanced: 3 levels below');
  });

  it('says when the standard is met or passed', () => {
    expect(compareToStandard('MID', 'MID')).toBe('Mid: meets it');
    expect(compareToStandard('ADVANCED', 'JUNIOR')).toBe('Junior: meets it');
  });

  it('says when there is nothing to compare yet', () => {
    expect(compareToStandard(null, 'MID')).toBe('Mid: not measured yet');
  });
});
