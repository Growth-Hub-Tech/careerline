import type { CreditPack, Credits, Payment, Plan } from '../../lib/api';

const naira = (amount: number) => ({ amount: amount * 100, currency: 'NGN' as const });

export const PLANS: readonly Plan[] = [
  {
    plan_id: 1,
    name: 'Individual Monthly',
    audience: 'individual',
    interval: 'monthly',
    price: naira(5000),
    credits_per_interval: 5,
    seats: null,
    features: ['Five skill tests a month', 'PDF reports'],
  },
  {
    plan_id: 2,
    name: 'Recruiter Pro',
    audience: 'recruiter',
    interval: 'monthly',
    price: naira(45000),
    credits_per_interval: 40,
    seats: null,
    features: ['Forty candidate tests a month'],
  },
  {
    plan_id: 3,
    name: 'Team Audit',
    audience: 'organisation',
    interval: 'yearly',
    price: naira(1200000),
    credits_per_interval: 600,
    seats: 50,
    features: ['Capability heatmap', 'Targets for each role'],
  },
];

export const CREDIT_PACKS: readonly CreditPack[] = [
  { pack_id: 11, name: 'Starter pack', credits: 3, price: naira(9000) },
  { pack_id: 12, name: 'Value pack', credits: 10, price: naira(25000) },
];

export const CREDITS: Credits = {
  credits_balance: 3,
  transactions: [
    {
      transaction_id: 2,
      change: -2,
      reason: 'test_started',
      balance_after: 3,
      created_at: '2026-10-28T10:00:00Z',
    },
    {
      transaction_id: 1,
      change: 5,
      reason: 'purchase',
      balance_after: 5,
      created_at: '2026-10-20T09:00:00Z',
    },
  ],
};

export const payment = (status: Payment['status'], creditsAdded = 10): Payment => ({
  reference: 'ref-1',
  status,
  item_type: 'credit_pack',
  item_id: 12,
  description: 'Value pack',
  amount: naira(25000),
  credits_added: status === 'paid' ? creditsAdded : 0,
  created_at: '2026-11-03T09:00:00Z',
  paid_at: status === 'paid' ? '2026-11-03T09:01:00Z' : null,
});
