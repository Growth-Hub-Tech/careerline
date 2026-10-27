import { Link } from 'react-router-dom';
import { LuBriefcase, LuCompass, LuSparkles } from 'react-icons/lu';
import { Card } from '../components/Card';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { useSession } from '../lib/session';

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

export const Dashboard = () => {
  const { session } = useSession();
  const firstName = session?.user.name.trim().split(/\s+/)[0];

  return (
    <div className="flex w-full flex-col gap-8 px-5 py-8 sm:px-8">
      <div>
        <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950 sm:text-[32px]">
          {firstName ? `Welcome, ${firstName}!` : 'Welcome!'}
        </h1>
        <p className="mt-2 text-[15px] text-slate-600">
          Take your first step to knowing your ideal career path
        </p>
      </div>

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
    </div>
  );
};
