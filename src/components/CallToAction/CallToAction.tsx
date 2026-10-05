import { useNavigate } from 'react-router-dom';
import { LuRocket } from 'react-icons/lu';
import { ArrowButton, Section } from '../Section';

// Update the routes if yours differ.
const ACTIONS = [
  { label: "I'm Exploring a Career", to: '/question', variant: 'solid' },
  { label: 'I Want to Test Skills', to: '/beginner/sign-up', variant: 'dark' },
  { label: "I'm Hiring", to: '/recruiter/sign-up', variant: 'soft' },
  { label: 'I Want to Audit Team', to: '/organization/sign-up', variant: 'soft' },
] as const;

export const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <Section bg="bg-indigo-50" className="lg:py-28">
      <div className="mx-auto max-w-[860px] rounded-3xl bg-white px-5 py-9 text-center shadow-[0_16px_48px_rgba(53,37,205,0.14)] sm:px-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4e2ff] px-3 py-1 text-[10.5px] font-semibold text-[#3525cd]">
          <LuRocket size={11} />
          Begin Your Trajectory
        </span>

        <h2 className="font-heading mt-3 text-[28px] leading-[1.15] font-bold tracking-tight text-[#141b34] sm:text-[34px]">
          Know where you are.
          <span className="block text-[#4f46e5]">Know where you&apos;re going.</span>
        </h2>

        <p className="mx-auto mt-3 max-w-[46ch] text-[14px] leading-relaxed text-[#525a6b]">
          Discover your path. Measure your skills. Close your gaps. Start with an objective
          benchmark today.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {ACTIONS.map(({ label, to, variant }) => (
            <ArrowButton
              key={label}
              variant={variant}
              onClick={() => navigate(to)}
              className="h-10 text-[12px]"
            >
              {label}
            </ArrowButton>
          ))}
        </div>
      </div>
    </Section>
  );
};
