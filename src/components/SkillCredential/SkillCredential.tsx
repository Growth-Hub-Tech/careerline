import { useNavigate } from 'react-router-dom';
import { LuShieldCheck, LuTrendingUp } from 'react-icons/lu';
import { ArrowButton, Section, SectionHeader } from '../Section';

const BARS = [
  { name: 'Architecture', value: 86 },
  { name: 'System Reliability', value: 82 },
  { name: 'API Design', value: 89 },
] as const;

export const SkillCredential = () => {
  const navigate = useNavigate();

  return (
    <Section bg="bg-indigo-50">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Credential card */}
        <div className="order-2 overflow-hidden rounded-3xl bg-white shadow-[0_16px_48px_rgba(53,37,205,0.12)] lg:order-1">
          <div className="flex items-center justify-between bg-[#eceefb] px-5 py-3">
            <p className="font-heading flex items-center gap-2 text-[13px] font-medium text-[#141b34]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1c1f4a] text-white">
                <LuTrendingUp size={13} />
              </span>
              Verifiable Skill Credential
            </p>
            <span className="rounded bg-[#dcdffc] px-2 py-0.5 font-mono text-[9.5px] text-[#464555]">
              HASH: #88c0...4f1e
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] text-[#5a6270]">Candidate Record</p>
                <p className="font-heading mt-0.5 text-[19px] font-semibold text-[#141b34]">
                  Alex Mercer
                </p>
                <p className="mt-0.5 text-[10.5px] font-semibold text-[#3525cd]">
                  Full-Stack Capability Audit
                </p>
              </div>
              <div className="text-right">
                <p className="font-heading text-[26px] font-bold text-[#141b34]">
                  84 <span className="text-[12px] font-medium text-[#5a6270]">/100</span>
                </p>
                <p className="text-[10.5px] font-semibold text-[#3525cd]">Senior Standard Met</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-lg bg-[#f7f7fd] p-3">
              {BARS.map(({ name, value }) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="font-semibold text-[#2b3247]">{name}</span>
                    <span className="font-semibold text-[#3525cd]">{value}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-[#e3e6f7]">
                    <div
                      className="h-full rounded-full bg-[#4f46e5]"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-[#5a6270]">
              <span>Issued: Q2 2026</span>
              <span>Encrypted via Ed25519 standard</span>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <SectionHeader
            eyebrow="For Individual Professionals"
            title="Turn your skills into evidence."
            lead="Whether you're self-taught, changing careers, or preparing for your next role, CareerLine AI gives you an objective way to measure your skills independently. Stop relying on unverified claims."
          />

          <ul className="mt-5 flex flex-col gap-2.5 text-[13px] text-[#464555]">
            <li className="flex items-start gap-2">
              <LuShieldCheck size={15} className="mt-0.5 shrink-0 text-[#3525cd]" />
              <span>
                <strong className="font-semibold text-[#141b34]">Portable Proof:</strong> Share
                cryptographic credential links directly with employers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <LuTrendingUp size={15} className="mt-0.5 shrink-0 text-[#3525cd]" />
              <span>
                <strong className="font-semibold text-[#141b34]">Deficit Elimination:</strong> Focus
                exclusively on the 2–3 skill gaps holding you back.
              </span>
            </li>
          </ul>

          <div className="mt-6">
            <ArrowButton variant="solid" onClick={() => navigate('/beginner/sign-up')}>
              Take a Self-Test
            </ArrowButton>
          </div>
        </div>
      </div>
    </Section>
  );
};
