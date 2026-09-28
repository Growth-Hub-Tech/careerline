import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BeginnerHeader } from '../components/BeginnerHeader';
import type { CareerPath } from '../types';

export const ProgrammeDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const path = (state as { path?: CareerPath } | null)?.path;

  if (!path) return <Navigate to="/beginner/assessment" replace />;

  return (
    <div className="min-h-screen bg-white">
      <BeginnerHeader showBrand />

      <main className="mx-auto max-w-280 px-20 py-10">
        <h1 className="text-[32px] font-bold text-[#1f2a44]">{path.title}</h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Your top recommended path, based on a {path.matchScore} percent match with your assessment
          answers.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[700px_380px]">
          <section className="flex min-h-75 flex-col rounded-xl bg-[#eff0f4] p-8">
            <span className="text-[11px] font-bold tracking-wide text-[#0E8C74]">
              RECOMMENDED PROGRAMME
            </span>
            <h2 className="mt-3 text-2xl font-bold text-[#1f2a44]">{path.programme.name}</h2>
            <p className="mt-4 max-w-150 text-sm leading-relaxed text-[#6b7280]">
              {path.programme.description}
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-auto h-12 w-62.5 rounded-xl bg-[#4A3F8C] text-sm font-semibold text-white transition-colors hover:bg-[#3d3375]"
            >
              View programme details
            </button>
          </section>

          <aside className="rounded-xl border border-[#dfe1e7] bg-white p-6">
            <h2 className="text-base font-bold text-[#1f2a44]">Why this programme</h2>
            <ul className="mt-5 flex flex-col gap-8">
              {path.whyThisProgramme.map((reason) => (
                <li key={reason} className="text-xs text-[#6b7280]">
                  {reason}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
};
