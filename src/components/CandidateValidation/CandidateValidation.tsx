import { useNavigate } from 'react-router-dom';
import { LuScale } from 'react-icons/lu';
import { ArrowButton, Section, SectionHeader } from '../Section';

const SCORES = [
  { name: 'UX Research & User Testing', value: '94%', gap: false },
  { name: 'Interactive Prototyping', value: '90%', gap: false },
  { name: 'Visual Hierarchy & Systems', value: '88%', gap: false },
  { name: 'Product Strategy & Metrics', value: '68% (Target Dev)', gap: true },
] as const;

export const CandidateValidation = () => {
  const navigate = useNavigate();

  return (
    <Section id="for-recruiters" bg="bg-[#f7f7fd]">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <SectionHeader
            eyebrow="Candidate Validation"
            title="Verify skills before you hire."
            lead="A strong CV and a great interview don't always tell the whole story. Eliminate hiring uncertainty by having candidates complete standard-calibrated practical evaluations."
          />

          <div className="mt-6 rounded-xl bg-white p-4 shadow-[0_2px_12px_rgba(53,37,205,0.05)]">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3525cd]">
              <LuScale size={13} />
              Responsible Recruitment Guardrail
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#5a6270]">
              CareerLine AI provides structured assessment information to support hiring decisions.
              It does not automatically make hiring decisions or determine whether a candidate is
              hired. Human judgment remains paramount.
            </p>
          </div>

          <div className="mt-6">
            <ArrowButton variant="dark" onClick={() => navigate('/recruiter/sign-up')}>
              Test a Candidate
            </ArrowButton>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-[0_16px_48px_rgba(53,37,205,0.12)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-heading flex h-10 w-10 items-center justify-center rounded-full bg-[#e4e2ff] text-[13px] font-semibold text-[#3525cd]">
                SJ
              </span>
              <div>
                <p className="font-heading text-[14px] font-semibold text-[#141b34]">
                  Sarah Johnson
                </p>
                <p className="text-[11px] text-[#5a6270]">Senior Product Designer Candidate</p>
              </div>
            </div>
            <span className="rounded-full bg-[#e4e2ff] px-2.5 py-1 text-[10.5px] font-semibold text-[#3525cd]">
              Verified Dossier
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3 rounded-xl bg-[#e8eaff] p-4">
            <div>
              <p className="text-[10.5px] font-semibold text-[#464555]">Assessment Composite</p>
              <p className="font-heading mt-1 text-[26px] font-bold text-[#141b34]">
                87 <span className="text-[12px] font-medium text-[#5a6270]">/100</span>
              </p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-[#dcdffc] px-2.5 py-1 text-[10.5px] font-semibold text-[#3525cd]">
                Ranked Top 8%
              </span>
              <p className="mt-1.5 text-[10.5px] text-[#5a6270]">among 2,400 assessed designers</p>
            </div>
          </div>

          <ul className="mt-3 flex flex-col gap-1.5">
            {SCORES.map(({ name, value, gap }) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-md bg-[#f7f7fd] px-3 py-2 text-[11px]"
              >
                <span className="font-semibold text-[#2b3247]">{name}</span>
                <span className={`font-semibold ${gap ? 'text-[#b42318]' : 'text-[#3525cd]'}`}>
                  {value}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between text-[10.5px] text-[#5a6270]">
            <span>Assessment Duration: 18m 42s</span>
            <span>Integrity Flag: 100% Validated</span>
          </div>
        </div>
      </div>
    </Section>
  );
};
