import { SKILLS, TESTS } from '../../test/fixtures/tests';
import { describeLevels, describePrice, groupByCategory } from './catalog';

describe('groupByCategory', () => {
  it('groups the testable skills under their category', () => {
    const groups = groupByCategory(SKILLS.skills, TESTS.items);

    expect(groups.map((group) => group.category)).toEqual(['Engineering and Development']);
    expect(groups[0].entries.map((entry) => entry.test.test_id)).toEqual([201, 202, 208]);
  });

  it('leaves out skills that have no test', () => {
    const groups = groupByCategory(SKILLS.skills, TESTS.items);

    const names = groups.flatMap((group) => group.entries.map((entry) => entry.skill.skill_name));
    expect(names).not.toContain('UI/UX Design');
  });

  it('orders categories by where their first skill appears', () => {
    const tests = [
      TESTS.items[0],
      { ...TESTS.items[0], test_id: 300, skill_id: 13 },
      TESTS.items[1],
    ];

    const groups = groupByCategory(SKILLS.skills, tests);

    expect(groups.map((group) => group.category)).toEqual([
      'Engineering and Development',
      'Design & Product',
    ]);
  });

  it('files a test whose skill is unknown under Other', () => {
    const groups = groupByCategory(SKILLS.skills, [
      { ...TESTS.items[0], test_id: 999, skill_id: 777 },
    ]);

    expect(groups[0].category).toBe('Other');
    expect(groups[0].entries[0].skill.skill_name).toBe(TESTS.items[0].skill_name);
  });

  it('gives nothing when there are no tests', () => {
    expect(groupByCategory(SKILLS.skills, [])).toEqual([]);
  });
});

describe('describePrice', () => {
  it.each([
    [0, 'Free'],
    [1, '1 credit'],
    [2, '2 credits'],
  ])('shows %i credits as "%s"', (credits, text) => {
    expect(describePrice(credits)).toBe(text);
  });
});

describe('describeLevels', () => {
  it('lists the levels in plain words', () => {
    expect(describeLevels(['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'])).toBe(
      'Beginner, Junior, Mid, Advanced',
    );
  });
});
