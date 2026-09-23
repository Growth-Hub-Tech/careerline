import { useNavigate } from 'react-router-dom';
import { LuChevronRight } from 'react-icons/lu';
import { PageContainer } from '../PageContainer';

export const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-white py-20 lg:py-24">
      <PageContainer>
        <div className="relative mx-auto max-w-225 overflow-hidden rounded-[28px] bg-white text-center shadow-[0_30px_60px_-20px_rgba(31,42,68,0.18)]">
          {/* Top-right gradient blob */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(53,37,205,0.18)_0%,rgba(53,37,205,0)_70%)]"
          />
          {/* Bottom-left gradient blob */}
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(53,37,205,0.18)_0%,rgba(53,37,205,0)_70%)]"
          />

          <div className="relative px-8 py-16">
            <span className="text-[12px] font-semibold tracking-[0.14em] text-[#3525cd] uppercase">
              Your next chapter
            </span>

            <h2 className="mx-auto mt-4 max-w-[26ch] text-[32px] leading-[1.2] font-bold tracking-tight text-[#1f2a44] lg:text-[38px]">
              Still wondering what you should learn?
            </h2>

            <p className="mt-3 text-[15px] text-[#5a6270]">Let&apos;s figure it out together.</p>

            <button
              type="button"
              className="mx-auto mt-8 flex w-fit items-center gap-1.5 rounded-lg bg-[#3525cd] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2a1ea3]"
              onClick={() => navigate('/question')}
            >
              Find My Course
              <LuChevronRight size={18} />
            </button>

            <p className="mt-4 text-[12px] text-[#8b93a3]">
              It takes about 3–5 minutes • 100% free • No credit card required
            </p>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};
