export interface LegalSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export const LEGAL_UPDATED = '2026-11-04';

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    title: 'What we collect',
    paragraphs: [
      'Your account details: name, email address and phone number.',
      'Your answers to the beginner questionnaire and to skill tests, and the results we work out from them.',
      'Records of what you buy. Payments are handled by Paystack; we never see or store your card details.',
      'Basic technical records, such as when you signed in, to keep the service secure.',
    ],
  },
  {
    title: 'Why we use it',
    paragraphs: [
      'To run your tests, work out your results and write your reports.',
      'To recommend career paths and programmes that fit your results.',
      'To send you the emails the service needs, such as confirming your address. Marketing emails are only sent if you turn them on.',
    ],
  },
  {
    title: 'Who can see your results',
    paragraphs: [
      'You can always see your own results.',
      'A recruiter or organisation sees a result only when you accept their test invitation and agree to share that result with them.',
      'Recruiters can find your profile only if you turn on sharing with recruiters in your privacy centre. You can take that back at any time.',
      'We do not sell your data.',
    ],
  },
  {
    title: 'How long we keep it',
    paragraphs: [
      'We keep your data while you have an account.',
      'When you ask us to delete your account, we wait 30 days so you can change your mind, then erase your data.',
    ],
  },
  {
    title: 'Your choices',
    paragraphs: [
      'In your privacy centre you can download a copy of your data, change who can see your results, turn emails on or off, and delete your account.',
      'For anything else about your data, contact us and we will reply.',
    ],
  },
];

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    title: 'Using CareerLine AI',
    paragraphs: [
      'You need an account to take tests. Keep your password private; you are responsible for what happens in your account.',
      'Give true details when you sign up, and take tests yourself without help from other people or tools.',
      'Do not copy or share test questions.',
    ],
  },
  {
    title: 'What results mean',
    paragraphs: [
      'Results and recommendations support decisions; they do not make them. Use them alongside interviews, work samples and other evidence.',
      'Programmes we recommend are run by Incubate or by partners. When a partner pays us for a referral, we say so next to the programme.',
    ],
  },
  {
    title: 'Payments and credits',
    paragraphs: [
      'Prices are shown before you pay. Payments are taken by Paystack.',
      'Credits are used when a test starts. Plans renew until you cancel; a cancelled plan stays active until the end of the period you paid for.',
      'If something went wrong with a payment, contact support with your payment reference.',
    ],
  },
  {
    title: 'Recruiters and organisations',
    paragraphs: [
      'Only send tests to people who expect them, and use results fairly and lawfully.',
      'A candidate or employee chooses whether to share a result. Do not ask them for results they have not shared.',
    ],
  },
  {
    title: 'Changes',
    paragraphs: [
      'We may update these terms. When we make an important change, we will tell you by email or in the app before it applies.',
    ],
  },
];
