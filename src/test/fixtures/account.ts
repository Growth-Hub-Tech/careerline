import type { Account } from '../../lib/api';

export const account = (overrides: Partial<Account> = {}): Account => ({
  account_id: 2,
  full_name: 'Skye Favour',
  email: 'skye@example.com',
  phone: '08012345678',
  account_type: 'learner',
  email_verified: true,
  organisation_id: null,
  organisation_role: null,
  created_at: '2026-10-01T09:00:00Z',
  ...overrides,
});
