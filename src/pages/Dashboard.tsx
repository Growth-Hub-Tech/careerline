import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LuBriefcase, LuCompass, LuSparkles } from 'react-icons/lu';
import { Alert } from '../components/Alert';
import { Card } from '../components/Card';
import { CreditsStrip } from '../components/CreditsStrip';
import { LINK_CLASS, PRIMARY_ACTION, SECONDARY_ACTION } from '../components/Button';
import { recruiterQueries } from '../lib/api/queries';
import { invitationTasks } from '../lib/tasks/buildTasks';
import { useCurrentUser, type UserType } from '../lib/user';
import { firstNameOf } from '../lib/format';

const FEATURES = [
  {
    title: 'Your top 3 strengths',
    description:
      'CareerLine AI helps you discover what you naturally excel at, through a quick AI analysis.',
    icon: <LuSparkles size={22} />,
  },
  {
    title: 'Roles that match you',
    description: 'Get tech role recommendations tailored to your interests, passion and style.',
    icon: <LuBriefcase size={22} />,
  },
  {
    title: 'Explore your path',
    description:
      'Start your learning journey with any of our recommended tech courses complete with learning resources and career insights.',
    icon: <LuCompass size={22} />,
  },
] as const;

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
        An AI-powered career clarity test. Answer a few questions to uncover your strengths,
        matching roles and learning path tailored just for you.
      </p>
      <Link to="/assessment/start" className={PRIMARY_ACTION}>
        Take the assessment
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

// Invitations are in-app only, so a waiting one is pointed out here; Tasks lists them (and shows
// a failed load with a retry)
const InvitationsNotice = () => {
  const { data } = useQuery(recruiterQueries.receivedInvitations());
  const open = data ? invitationTasks(data).length : 0;
  if (open === 0) return null;

  return (
    <Alert title={open === 1 ? 'You have a test invitation' : `You have ${open} test invitations`}>
      <Link to="/tasks" className={LINK_CLASS}>
        See your invitations
      </Link>
    </Alert>
  );
};

export const Dashboard = () => {
  const { name, userType } = useCurrentUser();
  const firstName = firstNameOf(name);

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

      <InvitationsNotice />
      {(userType === 'self-test' || userType === 'recruiter') && <CreditsStrip />}
      {userType === 'beginner' ? <BeginnerHome /> : <AreaHome area={AREAS[userType]} />}
    </div>
  );
};
