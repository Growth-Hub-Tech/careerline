import { Link } from 'react-router-dom';
import { LuBriefcase, LuCompass, LuSparkles } from 'react-icons/lu';
import { Card } from '../components/Card';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { useSession, type UserType } from '../lib/session';

const FEATURES = [
  {
    title: 'Your Top 3 Strengths',
    description: 'CareerLine AI helps discover what naturally excel at through quick AI analysis',
    icon: <LuSparkles size={22} />,
  },
  {
    title: 'Roles That Match You',
    description: 'Get tech role recommendations tailored to your interests, passion and style',
    icon: <LuBriefcase size={22} />,
  },
  {
    title: 'Explore Your Path',
    description:
      'Start your learning journey with any of our recommended tech courses complete with learning resources and career insights.',
    icon: <LuCompass size={22} />,
  },
] as const;

const SECONDARY_ACTION =
  'inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-[16px] font-medium text-slate-800 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

interface AreaLink {
  readonly label: string;
  readonly to: string;
}

interface Area {
  readonly title: string;
  readonly description: string;
  readonly links: readonly AreaLink[];
}

const AREAS: Record<Exclude<UserType, 'beginner'>, Area> = {
  'self-test': {
    title: 'Test your skills',
    description:
      'Choose a skill, answer one question at a time and get a scored report with your strengths and weaknesses.',
    links: [
      { label: 'Choose a test', to: '/tests' },
      { label: 'View your reports', to: '/reports' },
    ],
  },
  recruiter: {
    title: 'Validate talent',
    description:
      'Send a role-specific test to a candidate and see their real skill level before you make an offer.',
    links: [{ label: 'Go to candidates', to: '/candidates' }],
  },
  organization: {
    title: 'Audit your team',
    description:
      'See how your team measures up against the Global Standard for their roles and titles.',
    links: [{ label: 'Go to your team', to: '/team' }],
  },
};

const BeginnerHome = () => (
  <>
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-gray-100 p-6 sm:p-8">
      <h2 className="max-w-[28ch] font-heading text-[22px] leading-[1.25] font-bold text-slate-950 sm:text-[26px]">
        Not sure where to start? Find your path in just 10 minutes.
      </h2>
      <p className="max-w-[60ch] text-[14px] leading-[1.55] text-slate-600">
        An AI powered career clarity test - answer a few questions to uncover your strengths,
        matching roles and learning path tailored just for you.
      </p>
      <Link to="/assessment" className={PRIMARY_ACTION}>
        Take Assessment Test
      </Link>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {FEATURES.map(({ title, description, icon }) => (
        <Card key={title} title={title} description={description} icon={icon} headingLevel={2} />
      ))}
    </div>
  </>
);

const AreaHome = ({ area }: { area: Area }) => (
  <div className="flex flex-col items-start gap-4 rounded-2xl bg-gray-100 p-6 sm:p-8">
    <h2 className="font-heading text-[22px] leading-[1.25] font-bold text-slate-950 sm:text-[26px]">
      {area.title}
    </h2>
    <p className="max-w-[60ch] text-[14px] leading-[1.55] text-slate-600">{area.description}</p>
    <div className="flex flex-wrap gap-3">
      {area.links.map(({ label, to }, index) => (
        <Link key={to} to={to} className={index === 0 ? PRIMARY_ACTION : SECONDARY_ACTION}>
          {label}
        </Link>
      ))}
    </div>
  </div>
);

export const Dashboard = () => {
  const { session } = useSession();
  const firstName = session?.user.name.trim().split(/\s+/)[0];
  const userType = session?.user.userType ?? 'beginner';

  return (
    <div className="flex w-full flex-col gap-8 px-5 py-8 sm:px-8">
      <div>
        <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950 sm:text-[32px]">
          {firstName ? `Welcome, ${firstName}!` : 'Welcome!'}
        </h1>
        {userType === 'beginner' && (
          <p className="mt-2 text-[15px] text-slate-600">
            Take your first step to knowing your ideal career path
          </p>
        )}
      </div>

      {userType === 'beginner' ? <BeginnerHome /> : <AreaHome area={AREAS[userType]} />}
    </div>
  );
};
