interface HelpTopic {
  readonly title: string;
  readonly questions: readonly { readonly question: string; readonly answer: string }[];
}

export const HELP_TOPICS: readonly HelpTopic[] = [
  {
    title: 'Tests',
    questions: [
      {
        question: 'How long does a skill test take?',
        answer:
          'Most tests have 16 questions and a 30-minute limit. The timer is shown at the top while you answer.',
      },
      {
        question: 'Why do the questions get harder or easier?',
        answer:
          'The test is adaptive. A right answer brings a harder question and a wrong answer an easier one, so it can find your level.',
      },
      {
        question: 'What happens if I close the page or lose my connection?',
        answer:
          'Open the test again before the time runs out and you continue at the question you were on.',
      },
      {
        question: 'Can I go back to a question?',
        answer: 'No. Each answer is final once you move on.',
      },
    ],
  },
  {
    title: 'Results and reports',
    questions: [
      {
        question: 'How do I download my report?',
        answer:
          'Open the result from Reports and choose “Download your report”. The PDF can take a few seconds to prepare.',
      },
      {
        question: 'Can I retake a test?',
        answer:
          'Yes. Choose “Retake to measure progress” on your result. Your next result shows how much you moved.',
      },
    ],
  },
  {
    title: 'Account',
    questions: [
      {
        question: 'I did not get the confirmation email.',
        answer:
          'Check your spam folder, then ask for a new link from the “Check your email” page or from Settings.',
      },
      {
        question: 'How do I change my password?',
        answer: 'Go to Settings and use “Change password”. You need your current password.',
      },
    ],
  },
  {
    title: 'Payments',
    questions: [
      {
        question: 'When are credits taken?',
        answer: 'When a test starts. You can see every change on the Credits page.',
      },
      {
        question: 'My payment went through but I have no credits.',
        answer:
          'Paystack can take a few minutes to confirm. If the credits have not arrived after that, contact support with your payment reference.',
      },
    ],
  },
  {
    title: 'Privacy',
    questions: [
      {
        question: 'Who can see my results?',
        answer:
          'Only you, unless you agree to share a result with a recruiter or organisation, or turn on sharing with recruiters in your privacy centre.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Open your privacy centre and choose “Delete your account”. You have 30 days to change your mind.',
      },
    ],
  },
];
