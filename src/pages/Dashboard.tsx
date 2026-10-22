import { Link } from 'react-router-dom';
import { LuBriefcase, LuCompass, LuSparkles } from 'react-icons/lu';
import { Card } from '../components/Card';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { SAMPLE_USER } from '../data/sampleUser';

const FEATURES = [
  {
    title: 'Your Top 3 Strengths',
    description: 'See the traits and skills you naturally lean on.',
    icon: <LuSparkles size={22} />,
  },
  {
    title: 'Roles That Match You',
    description: 'Find tech roles that fit your answers, not just trends.',
    icon: <LuBriefcase size={22} />,
  },
  {
    title: 'Explore Your Path',
    description: 'Get a ranked path with a programme to start learning.',
    icon: <LuCompass size={22} />,
  },
] as const;

export const Dashboard = () => {
  const firstName = SAMPLE_USER.name.split(' ')[0];

  return (
    <div className="flex w-full flex-col gap-8 px-5 py-8 sm:px-8">
      <div>
        <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950 sm:text-[32px]">
          Welcome, {firstName}!
        </h1>
        <p className="mt-2 text-[15px] text-slate-600">
          Take the first step toward the right tech career.
        </p>
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl bg-gray-100 p-6 sm:p-8">
        <h2 className="max-w-[28ch] font-heading text-[22px] leading-[1.25] font-bold text-slate-950 sm:text-[26px]">
          Not sure where to start? Find your path in just 10 minutes.
        </h2>
        <p className="max-w-[52ch] text-[14px] leading-[1.55] text-slate-600">
          Answer a short set of questions about you, your goals and your time, and get a ranked list
          of paths that fit.
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
