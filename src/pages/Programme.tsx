import { useId } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FlowHeader } from '../components/FlowHeader';
import { SAMPLE_PROGRAMMES } from '../data/sampleProgrammes';

export const Programme = () => {
  const { programmeId } = useParams();
  const headingId = useId();
  const programme = SAMPLE_PROGRAMMES.find((item) => item.id === programmeId);

  if (!programme) {
    return <Navigate to="/page-not-found" replace />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <FlowHeader label="Beginner path" showBrand />

      <main className="w-full max-w-[1200px] px-5 py-10 sm:px-10 lg:px-20">
        <h1 className="text-[32px] leading-[1.2] font-bold text-slate-800">
          {programme.careerTitle}
        </h1>
        <p className="mt-3 text-[15px] text-slate-600">{programme.tagline}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <section
            aria-labelledby={headingId}
            className="flex flex-col gap-4 rounded-xl bg-gray-100 p-8"
          >
            <p className="text-[12px] font-semibold tracking-wide text-teal-700 uppercase">
              Recommended programme
            </p>
            <h2 id={headingId} className="text-[24px] leading-[1.3] font-bold text-slate-800">
              {programme.programmeTitle}
            </h2>
            <p className="max-w-[60ch] text-[15px] leading-[1.55] text-slate-600">
              {programme.description}
            </p>
            <div className="pt-8">
              <Button variant="deep" fullWidth={false}>
                View programme details
              </Button>
            </div>
          </section>

          <Card title="Why this programme" headingLevel={2} className="p-6">
            <ul className="flex flex-col gap-6 text-[13px] leading-[1.5] text-slate-600">
              {programme.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};
