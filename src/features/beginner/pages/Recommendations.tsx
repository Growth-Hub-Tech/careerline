import type { CareerPath } from '../types';

interface RecommendationsProps {
  paths: CareerPath[];
  onStartLearning: (path: CareerPath) => void;
  onDownloadReport: () => void;
}

export const Recommendations = ({
  paths,
  onStartLearning,
  onDownloadReport,
}: RecommendationsProps) => {
  const top3 = [...paths].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white px-4 py-16">
      <h1 className="max-w-[820px] text-center text-[32px] font-bold leading-tight text-black">
        Congratulations... You have successfully completed your test
      </h1>
      <h2 className="mt-8 text-2xl font-bold text-[#1f2a44]">
        Here are your top 3 recommended career paths
      </h2>
      <p className="mt-2 text-xs text-[#6b7280]">
        These paths are ranked based on your personality, your goals, your available time, and your
        financial capacity.
      </p>

      <ul className="mt-6 flex w-full max-w-[1120px] flex-col gap-3">
        {top3.map((path, i) => {
          const isTop = i === 0;
          return (
            <li
              key={path.id}
              className={
                'rounded-lg border p-6 ' +
                (isTop ? 'border-[#4A3F8C] bg-[#f0edfb]' : 'border-[#dfe1e7] bg-white')
              }
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold text-[#1f2a44]">{path.title}</h3>
                <span
                  className={
                    'rounded-full px-4 py-1.5 text-[11px] font-semibold text-[#1f2a44] ' +
                    (isTop ? 'bg-[#D99A1B]' : 'bg-[#eff0f4]')
                  }
                >
                  {path.matchScore}% match
                </span>
              </div>
              <p className="mt-2 text-xs text-[#6b7280]">{path.reason}</p>
              <div
                className="mt-6 h-2 w-[72%] rounded-full border border-[#dfe1e7] bg-white"
                role="progressbar"
                aria-valuenow={path.matchScore}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-[#0E8C74]"
                  style={{ width: `${path.matchScore}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex w-full max-w-[1120px] flex-wrap items-center justify-center gap-24">
        <button
          type="button"
          onClick={onDownloadReport}
          className="h-[60px] w-[415px] max-w-full rounded-md bg-[#4A3F8C] text-2xl text-white transition-colors hover:bg-[#3d3375]"
        >
          Download PDF Report
        </button>
        <button
          type="button"
          onClick={() => top3[0] && onStartLearning(top3[0])}
          className="h-[60px] w-[300px] max-w-full rounded-md bg-[#D99A1B] text-2xl text-white transition-colors hover:bg-[#c48b16]"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
};
