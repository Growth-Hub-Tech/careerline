import { useId } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/Loader';
import { catalogApi } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import { useSession } from '../lib/session';
import { groupByCategory, type CatalogGroup } from '../lib/tests/catalog';

const load = () => Promise.all([catalogApi.listSkills(), catalogApi.listTests()]);

const CategorySection = ({ group }: { group: CatalogGroup }) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="text-[14px] font-semibold text-slate-500">
        {group.category}
      </h2>

      <ul className="grid gap-6 md:grid-cols-2">
        {group.entries.map(({ test, skill }) => (
          <li key={test.test_id}>
            <Link
              to={`/tests/${test.test_id}`}
              className="flex h-full flex-col gap-4 rounded-2xl border border-indigo-300 bg-white px-6 py-8 transition-colors hover:border-indigo-600 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:px-[74px]"
            >
              <h3 className="text-[17px] font-semibold text-slate-700">{test.title}</h3>
              {skill.description && (
                <p className="text-[13px] leading-[1.5] text-slate-500">{skill.description}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export const SkillTests = () => {
  const { session } = useSession();
  const firstName = session?.user.name.trim().split(/\s+/)[0];
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading the tests" className="flex-1" />;
  }

  if (state.status === 'error') {
    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4 px-5 py-8 sm:px-8">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  const [skills, tests] = state.data;
  const groups = groupByCategory(skills, tests);

  return (
    <div className="flex w-full max-w-[1280px] flex-col gap-12 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-3">
        <p className="text-[15px] text-slate-950">Self Tester dashboard</p>
        <h1 className="text-[36px] leading-[1.2] font-bold text-slate-700 sm:text-[44px]">
          {firstName ? `Welcome, ${firstName}` : 'Welcome'}
        </h1>
        <p className="text-[22px] font-bold text-slate-500 sm:text-[26px]">
          Test your skills and get a real answer.
        </p>
        <p className="text-[13px] text-slate-500">
          Choose a skill area below. You will receive a score along with your specific strengths and
          weaknesses when you finish.
        </p>
      </header>

      {groups.length === 0 ? (
        <EmptyState
          title="No tests are available yet"
          description="Check back soon. New skill tests are added regularly."
        />
      ) : (
        groups.map((group) => <CategorySection key={group.category} group={group} />)
      )}
    </div>
  );
};
