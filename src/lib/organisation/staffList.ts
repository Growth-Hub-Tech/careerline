import type { RoleSummary, TeamMemberCreate } from '../api';

export const STAFF_COLUMNS = ['full_name', 'email', 'department', 'role'] as const;

export const STAFF_LIST_TEMPLATE = `${STAFF_COLUMNS.join(',')}\nAda Obi,ada@yourcompany.com,Engineering,Frontend Developer\n`;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export interface StaffRow {
  readonly line: number;
  readonly values: readonly string[];
  readonly errors: readonly string[];
  readonly member: TeamMemberCreate | null;
}

export interface StaffList {
  readonly rows: readonly StaffRow[];
  readonly problem?: string;
}

export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  const endRow = () => {
    row.push(cell);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
    row = [];
    cell = '';
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      endRow();
    } else if (char !== '\r') {
      cell += char;
    }
  }
  endRow();

  return rows;
};

export const readStaffList = (text: string, roles: readonly RoleSummary[]): StaffList => {
  const [header = [], ...lines] = parseCsv(text);
  const columns = header.map((value) => value.trim().toLowerCase());

  if (columns.join(',') !== STAFF_COLUMNS.join(',')) {
    return {
      rows: [],
      problem: `The first row must be: ${STAFF_COLUMNS.join(',')}. Download the template to start.`,
    };
  }
  if (lines.length === 0) return { rows: [], problem: 'The file has no people in it.' };

  const seen = new Map<string, number>();

  const rows = lines.map((cells, index): StaffRow => {
    const line = index + 2;
    const [name = '', rawEmail = '', department = '', roleTitle = ''] = cells.map((value) =>
      value.trim(),
    );
    const email = rawEmail.toLowerCase();
    const role = roles.find((item) => item.title.toLowerCase() === roleTitle.toLowerCase());
    const errors: string[] = [];

    if (!name) errors.push('Name is missing');
    if (!EMAIL.test(email)) errors.push('Email is not valid');
    else if (seen.has(email)) errors.push(`Email is already on row ${seen.get(email)}`);
    if (!roleTitle) errors.push('Role is missing');
    else if (!role) errors.push(`Role "${roleTitle}" is not one of our roles`);
    if (EMAIL.test(email) && !seen.has(email)) seen.set(email, line);

    return {
      line,
      values: [name, rawEmail.trim(), department, roleTitle],
      errors,
      member:
        errors.length === 0 && role
          ? { full_name: name, email, department: department || null, role_id: role.role_id }
          : null,
    };
  });

  return { rows };
};
