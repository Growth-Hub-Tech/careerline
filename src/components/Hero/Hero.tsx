import { useNavigate } from 'react-router-dom';
import heroImage from '../../assests/hero-team.png';

// const TEST_SKILLS_PATH = '/question';
const TEST_SKILLS_PATH = '/beginner/sign-up';
const CAREER_PATH_PATH = '/beginner/sign-up';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="flex w-full items-center bg-white py-10 sm:py-14 lg:h-[800px] lg:py-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-5 sm:px-6 lg:flex-row lg:gap-16 lg:px-[32px]">
        <div className="flex w-full flex-col gap-6 lg:w-1/2 lg:gap-7">
          <h1 className="text-[34px] leading-[1.15] font-bold tracking-tight text-[#2b2a3a] sm:text-[40px] lg:text-[50px]">
            Know where you fit.
            <br />
            <span className="text-[#7B6FDB]">Know where you stand.</span>
            <br />
            Know what to do next.
          </h1>

          <p className="max-w-[46ch] text-[15px] leading-relaxed text-[#4b5568] lg:text-[17px]">
            CareerLine AI helps you discover the right career path, measure your real-world skills,
            and turn skill gaps into actionable next steps.
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              className="h-[50px] rounded-full border-2 border-solid border-[#d3d7e4] bg-white px-6 text-[15px] font-medium text-[#1a1a2e] transition-colors hover:bg-[#f7f7fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C5CCF]"
              onClick={() => navigate(TEST_SKILLS_PATH)}
            >
              Test Your Skills
            </button>
            <button
              type="button"
              className="h-[50px] w-[275px] rounded-full bg-[#6C5CCF] px-6 py-4 items-center justify-center flex text-[15px] font-medium text-white transition-colors hover:bg-[#5a4bb8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C5CCF]"
              onClick={() => navigate(CAREER_PATH_PATH)}
            >
              Discover Your Career Path
            </button>
          </div>
        </div>

        <div className="relative flex w-full justify-center lg:w-1/2 lg:justify-end">
          <img
            src={heroImage}
            alt="Two colleagues working at their desks in a bright office"
            fetchPriority="high"
            className="aspect-37/40 w-full max-w-148 object-cover lg:aspect-auto lg:h-160 lg:w-148"
          />
        </div>
      </div>
    </section>
  );
};
