import { createApiClient } from './client';
import {
  createAttemptsApi,
  createAuthApi,
  createBeginnerApi,
  createContactApi,
  createPaymentsApi,
  createPrivacyApi,
  createProfileApi,
  createProgrammesApi,
  createSubscriptionsApi,
} from './endpoints';

const setup = (body: unknown = { success: true, data: {} }) => {
  const fetcher = vi.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    ),
  );
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    getToken: () => 'token-123',
    fetcher,
  });

  return { fetcher, client };
};

const sent = (fetcher: ReturnType<typeof setup>['fetcher']) => {
  const [input, init] = fetcher.mock.calls[0];
  return { url: String(input), init: init ?? {}, headers: new Headers(init?.headers) };
};

describe('auth endpoints', () => {
  it('logs in with a form body and no token', async () => {
    const reply = { access_token: 'abc', token_type: 'bearer', learner_id: 7, full_name: 'Skye' };
    const { fetcher, client } = setup(reply);

    const token = await createAuthApi(client).login('skye@example.com', 'secret123');

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/auth/login');
    expect(init.method).toBe('POST');
    expect((init.body as URLSearchParams).get('username')).toBe('skye@example.com');
    expect((init.body as URLSearchParams).get('password')).toBe('secret123');
    expect(headers.has('authorization')).toBe(false);
    expect(token).toEqual(reply);
  });

  it('registers with the four fields the API asks for', async () => {
    const { fetcher, client } = setup();
    const details = {
      full_name: 'Skye Favour',
      email: 'skye@example.com',
      phone: '+2348012345678',
      password: 'longenough1',
    };

    await createAuthApi(client).register(details);

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/auth/register');
    expect(JSON.parse(String(init.body))).toEqual(details);
    expect(headers.has('authorization')).toBe(false);
  });

  it('asks for a password reset link', async () => {
    const { fetcher, client } = setup();

    await createAuthApi(client).requestPasswordReset('skye@example.com');

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/accounts/password-reset');
    expect(JSON.parse(String(init.body))).toEqual({ email: 'skye@example.com' });
  });
});

describe('email verification endpoints', () => {
  it('confirms an email with the token from the link and no sign-in', async () => {
    const { fetcher, client } = setup({ success: true, data: { status: 'accepted' } });

    const result = await createAuthApi(client).verifyEmail('abc-123');

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/accounts/verify-email');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ token: 'abc-123' });
    expect(headers.has('authorization')).toBe(false);
    expect(result).toEqual({ status: 'accepted' });
  });

  it('asks for the email to be sent again with the sign-in token', async () => {
    const { fetcher, client } = setup({ success: true, data: { status: 'accepted' } });

    await createAuthApi(client).resendVerification();

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/accounts/verify-email/resend');
    expect(init.method).toBe('POST');
    expect(headers.get('authorization')).toBe('Bearer token-123');
  });
});

describe('contact endpoint', () => {
  it('sends the message and returns the receipt', async () => {
    const receipt = { ticket_id: 'T-1', status: 'received', received_at: '2026-10-26T08:00:00Z' };
    const { fetcher, client } = setup({ success: true, message: null, data: receipt });
    const message = {
      full_name: 'Skye Favour',
      email: 'skye@example.com',
      topic: 'general' as const,
      message: 'Hello, I have a question.',
    };

    const result = await createContactApi(client).send(message);

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/contact');
    expect(JSON.parse(String(init.body))).toEqual(message);
    expect(result).toEqual(receipt);
  });
});

describe('beginner path endpoints', () => {
  it('loads the questionnaire with the token', async () => {
    const { fetcher, client } = setup({ success: true, data: { version: 'v1', questions: [] } });

    const result = await createBeginnerApi(client).getIntake();

    const { url, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/beginner-path/intake');
    expect(headers.get('authorization')).toBe('Bearer token-123');
    expect(result).toEqual({ version: 'v1', questions: [] });
  });

  it('submits the answers', async () => {
    const { fetcher, client } = setup({ success: true, data: { intake_id: 1 } });
    const submission = { version: 'v1', answers: [{ question_id: 'a', values: ['x'] }] };

    await createBeginnerApi(client).submitIntake(submission);

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/beginner-path/intake');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(submission);
  });

  it('loads the saved recommendations', async () => {
    const { fetcher, client } = setup();

    await createBeginnerApi(client).getRecommendations();

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/beginner-path/recommendations');
  });
});

describe('programme endpoints', () => {
  it('loads one programme', async () => {
    const { fetcher, client } = setup();

    await createProgrammesApi(client).get(5);

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/programmes/5');
  });

  it('records a click', async () => {
    const { fetcher, client } = setup({ success: true, data: { redirect_url: 'https://x.test' } });

    const click = await createProgrammesApi(client).recordClick(5, { source: 'beginner_path' });

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/programmes/5/clicks');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ source: 'beginner_path' });
    expect(click).toEqual({ redirect_url: 'https://x.test' });
  });
});

describe('profile endpoints', () => {
  it('loads my profile', async () => {
    const { fetcher, client } = setup({ success: true, data: { budget: 'under_50k' } });

    const profile = await createProfileApi(client).get();

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/profile');
    expect(sent(fetcher).headers.get('authorization')).toBe('Bearer token-123');
    expect(profile).toEqual({ budget: 'under_50k' });
  });
});

describe('pricing endpoints', () => {
  it('lists the subscription plans', async () => {
    const { fetcher, client } = setup({ success: true, data: [{ plan_id: 1 }] });

    const plans = await createSubscriptionsApi(client).listPlans();

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/subscriptions/plans');
    expect(plans).toEqual([{ plan_id: 1 }]);
  });

  it('lists the credit packs', async () => {
    const { fetcher, client } = setup({ success: true, data: [{ pack_id: 11 }] });

    const packs = await createPaymentsApi(client).listCreditPacks();

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/payments/credit-packs');
    expect(packs).toEqual([{ pack_id: 11 }]);
  });
});

describe('checkout endpoints', () => {
  const checkout = { reference: 'ref-1', authorization_url: 'https://pay.test/ref-1' };

  it('starts a checkout for a credit pack', async () => {
    const { fetcher, client } = setup({ success: true, data: checkout });

    const reply = await createPaymentsApi(client).checkout({
      item_type: 'credit_pack',
      item_id: 12,
      callback_url: 'https://app.test/payments/callback',
    });

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/payments/checkout');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      item_type: 'credit_pack',
      item_id: 12,
      callback_url: 'https://app.test/payments/callback',
    });
    expect(reply).toEqual(checkout);
  });

  it('subscribes to a plan', async () => {
    const { fetcher, client } = setup({ success: true, data: checkout });

    await createSubscriptionsApi(client).subscribe({
      plan_id: 3,
      callback_url: 'https://app.test/payments/callback',
    });

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/subscriptions');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      plan_id: 3,
      callback_url: 'https://app.test/payments/callback',
    });
  });
});

describe('payment check endpoints', () => {
  it('loads one payment by its reference', async () => {
    const { fetcher, client } = setup({ success: true, data: { status: 'paid' } });

    const payment = await createPaymentsApi(client).get('ref/1');

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/payments/ref%2F1');
    expect(payment).toEqual({ status: 'paid' });
  });

  it('loads my credits', async () => {
    const { fetcher, client } = setup({ success: true, data: { credits_balance: 3 } });

    const credits = await createPaymentsApi(client).credits();

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/credits');
    expect(credits).toEqual({ credits_balance: 3 });
  });
});

describe('privacy endpoints', () => {
  it('loads my consents', async () => {
    const { fetcher, client } = setup({ success: true, data: { items: [] } });

    await createPrivacyApi(client).getConsents();

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/privacy/consents');
  });

  it('changes consents with a PUT', async () => {
    const { fetcher, client } = setup({ success: true, data: { items: [] } });

    await createPrivacyApi(client).updateConsents([{ key: 'marketing_emails', granted: true }]);

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/privacy/consents');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toEqual({
      items: [{ key: 'marketing_emails', granted: true }],
    });
  });

  it('asks for a copy of my data and checks on it', async () => {
    const { fetcher, client } = setup({ success: true, data: { export_id: 4 } });
    const privacy = createPrivacyApi(client);

    await privacy.requestExport();
    await privacy.getExport(4);

    expect(String(fetcher.mock.calls[0][0])).toBe(
      'https://api.example.test/api/v1/privacy/data-exports',
    );
    expect(fetcher.mock.calls[0][1]?.method).toBe('POST');
    expect(String(fetcher.mock.calls[1][0])).toBe(
      'https://api.example.test/api/v1/privacy/data-exports/4',
    );
  });

  it('asks to delete the account and cancels it', async () => {
    const { fetcher, client } = setup({ success: true, data: { status: 'scheduled' } });
    const privacy = createPrivacyApi(client);

    await privacy.requestDeletion({ password: 'secret123', reason: null });
    await privacy.cancelDeletion();

    const [deleteUrl, deleteInit] = fetcher.mock.calls[0];
    expect(String(deleteUrl)).toBe('https://api.example.test/api/v1/privacy/account-deletion');
    expect(deleteInit?.method).toBe('POST');
    expect(JSON.parse(String(deleteInit?.body))).toEqual({ password: 'secret123', reason: null });
    expect(fetcher.mock.calls[1][1]?.method).toBe('DELETE');
  });
});

describe('attempt endpoints', () => {
  it('starts the test of a skill', async () => {
    const { fetcher, client } = setup({ success: true, data: { attempt_id: 2 } });

    const attempt = await createAttemptsApi(client).start(1);

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/attempts/start');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ skill_id: 1 });
    expect(attempt).toEqual({ attempt_id: 2 });
  });

  it('reads where a test stands', async () => {
    const { fetcher, client } = setup({ success: true, data: { attempt_id: 2 } });

    const attempt = await createAttemptsApi(client).current(2);

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/attempts/2/question');
    expect(attempt).toEqual({ attempt_id: 2 });
  });

  it('answers the current question', async () => {
    const { fetcher, client } = setup({ success: true, data: { attempt_id: 2 } });

    const attempt = await createAttemptsApi(client).answer(2, {
      question_id: 6,
      selected_option_id: 22,
    });

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/attempts/2/answer');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ question_id: 6, selected_option_id: 22 });
    expect(attempt).toEqual({ attempt_id: 2 });
  });
});

describe('programme list', () => {
  it('lists up to three programmes for a role', async () => {
    const { fetcher, client } = setup({
      success: true,
      data: { items: [{ programme_id: 5 }], total: 1, limit: 3, offset: 0 },
    });

    const programmes = await createProgrammesApi(client).listForRole(2);

    expect(sent(fetcher).url).toBe(
      'https://api.example.test/api/v1/programmes?role_id=2&limit=3&offset=0',
    );
    expect(programmes).toEqual([{ programme_id: 5 }]);
  });
});
