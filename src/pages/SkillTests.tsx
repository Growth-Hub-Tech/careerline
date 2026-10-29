import { useId } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/Loader';
import { StatusLabel } from '../components/StatusLabel';
import { catalogApi } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import {
  describeLevels,
  describePrice,
  FORMAT_LABELS,
  groupByCategory,
  type CatalogGroup,
} from '../lib/tests/catalog';

const load = () => Promise.all([catalogApi.listSkills(), catalogApi.listTests()]);

const CategorySection = ({ group }: { group: CatalogGroup }) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="font-heading text-[22px] font-bold text-slate-950">
        {group.category}
      </h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {group.entries.map(({ test, skill }) => (
          <Card
            key={test.test_id}
            title={test.title}
            description={skill.description}
            footer={
              <>
                <StatusLabel status={test.price_credits === 0 ? 'success' : 'info'}>
                  {describePrice(test.price_credits)}
                </StatusLabel>
                <Link
                  to={`/tests/${test.test_id}`}
                  aria-label={`Start ${test.title} test`}
                  className="ml-auto inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-[14px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Start test
                </Link>
              </>
            }
          >
            <ul className="flex flex-col gap-1 text-[13px] text-slate-600">
              <li>{test.question_count} questions</li>
              <li>{test.duration_minutes} minutes</li>
              <li>{FORMAT_LABELS[test.format]}</li>
              <li>{describeLevels(test.levels)}</li>
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
};

export const SkillTests = () => {
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
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-8 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950 sm:text-[32px]">
          Skill tests
        </h1>
        <p className="text-[15px] text-slate-600">
          Choose a skill to test. Your result shows your level and what to learn next.
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
