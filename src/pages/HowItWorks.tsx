import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PRIMARY_ACTION } from '../components/ErrorPage';

const GROUPS = [
  {
    title: 'Beginners',
    path: '/for-individuals',
    steps: [
      'Answer questions about your personality, goals, time and budget.',
      'Get up to three tech career paths, ranked, each with the reasons.',
      'Open the matched programme for the path you like best.',
    ],
  },
  {
    title: 'Professionals',
    path: '/for-individuals',
    steps: [
      'Choose a skill test.',
      'Answer one question at a time. The test gets harder or easier as you go.',
      'Download your report and retake the test later to measure progress.',
    ],
  },
  {
    title: 'Recruiters',
    path: '/for-recruiters',
    steps: [
      'Send a role-specific test to a candidate.',
      'The candidate agrees to share the result and takes the test.',
      'Read the scored report before you make an offer.',
    ],
  },
  {
    title: 'Organizations',
    path: '/for-organizations',
    steps: [
      'Upload your staff list and start an audit.',
      'Everyone takes the test for their role.',
      'Read the team heatmap and employee reports, then set targets.',
    ],
  },
];

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 id={headingId} className="font-heading text-[22px] font-bold text-slate-950">
        {title}
      </h2>
      {children}
    </section>
  );
};

export const HowItWorks = () => (
  <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-5 py-14 sm:px-8">
    <header className="flex flex-col gap-4">
      <h1 className="font-heading text-[36px] leading-[1.15] font-bold text-slate-950">
        How it works
      </h1>
      <p className="max-w-[62ch] text-[18px] leading-[1.6] text-slate-700">
        CareerLine AI helps four groups with one testing engine: it finds where someone stands and
        says what to do next.
      </p>
    </header>

    <div className="grid gap-6 md:grid-cols-2">
      {GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-[15px] text-slate-700">
            {group.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Link
            to={group.path}
            className="w-fit font-medium text-indigo-700 underline hover:text-indigo-900"
          >
            More for {group.title.toLowerCase()}
          </Link>
        </Section>
      ))}
    </div>

    <Section title="One engine underneath">
      <p className="text-[15px] leading-[1.6] text-slate-700">
        Skill tests are adaptive: a right answer brings a harder question, a wrong one an easier
        question, so the test finds your level instead of giving everyone the same score. Each
        result names your strengths and weaknesses and links a gap to a programme that closes it.
        Scores support decisions; they never make them on their own.
      </p>
    </Section>

    <Link to="/sign-up" className={`${PRIMARY_ACTION} w-fit`}>
      Get started
    </Link>
  </div>
);
