import { ROLES } from '../../test/fixtures/organisation';
import { parseCsv, readStaffList, STAFF_LIST_TEMPLATE } from './staffList';

describe('parseCsv', () => {
  it('splits lines and cells, keeping quoted commas and quotes', () => {
    expect(parseCsv('a,b\r\n"c, d","say ""hi"""\n')).toEqual([
      ['a', 'b'],
      ['c, d', 'say "hi"'],
    ]);
  });

  it('skips empty lines', () => {
    expect(parseCsv('a,b\n\n  \nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
});

describe('readStaffList', () => {
  it('starts from a template with the expected columns', () => {
    expect(STAFF_LIST_TEMPLATE.split('\n')[0]).toBe('full_name,email,department,role');
  });

  it('reads each row into a team member, matching the role by title', () => {
    const { rows } = readStaffList(
      'full_name,email,department,role\nAda Obi,ADA@kora.example,Engineering,frontend developer',
      ROLES,
    );

    expect(rows).toEqual([
      {
        line: 2,
        values: ['Ada Obi', 'ADA@kora.example', 'Engineering', 'frontend developer'],
        errors: [],
        member: {
          full_name: 'Ada Obi',
          email: 'ada@kora.example',
          department: 'Engineering',
          role_id: 1,
        },
      },
    ]);
  });

  it('lists every problem in a row', () => {
    const { rows } = readStaffList('full_name,email,department,role\n,not-an-email,,Chef', ROLES);

    expect(rows[0].errors).toEqual([
      'Name is missing',
      'Email is not valid',
      'Role "Chef" is not one of our roles',
    ]);
    expect(rows[0].member).toBeNull();
  });

  it('flags the same email twice', () => {
    const { rows } = readStaffList(
      'full_name,email,department,role\nA,a@k.example,,Frontend Developer\nB,A@k.example,,Frontend Developer',
      ROLES,
    );

    expect(rows[1].errors).toEqual(['Email is already on row 2']);
  });

  it('says when the columns are not the template ones', () => {
    expect(readStaffList('name,mail\nA,b', ROLES).problem).toBe(
      'The first row must be: full_name,email,department,role. Download the template to start.',
    );
  });

  it('says when the file has no people', () => {
    expect(readStaffList('full_name,email,department,role\n', ROLES).problem).toBe(
      'The file has no people in it.',
    );
  });
});
