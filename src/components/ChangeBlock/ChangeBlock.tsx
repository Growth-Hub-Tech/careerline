import { useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profileQueries } from '../../lib/api/queries';
import { formatDate, formatPoints } from '../../lib/format';
import { LEVEL_LABELS } from '../../lib/tests/catalog';

interface ChangeBlockProps {
  readonly skillId: number;
  readonly skillName: string;
  readonly attemptId: number;
}

export const ChangeBlock = ({ skillId, skillName, attemptId }: ChangeBlockProps) => {
  const headingId = useId();
  const { data: history } = useQuery(profileQueries.skillHistory(skillId));

  if (!history) return null;

  const entries = history.entries;
  const index = entries.findIndex((entry) => entry.attempt_id === attemptId);
  const current = entries[index];
  const previous = index >= 0 ? entries[index + 1] : undefined;

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-full max-w-[680px] flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h2 id={headingId} className="text-[17px] font-semibold text-slate-900">
        Change since your last test
      </h2>
      {current && previous ? (
        <>
          <p className="text-[24px] font-bold text-slate-900">
            {formatPoints(current.score - previous.score)}{' '}
            <span className="text-[15px] font-normal text-slate-600">
              since your last test on {formatDate(previous.recorded_at)}
            </span>
          </p>
          <p className="text-[15px] text-slate-700">
            {LEVEL_LABELS[previous.level]} → {LEVEL_LABELS[current.level]}
          </p>
        </>
      ) : (
        <p className="text-[15px] text-slate-600">
          This is your first {skillName} test, so there is nothing to compare yet.
        </p>
      )}
    </section>
  );
};
