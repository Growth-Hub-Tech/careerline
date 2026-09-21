import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../PageContainer';
import heroImage from '../../assests/hero-team.png';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[800px] w-full items-center bg-white px-4 py-6">
      <PageContainer className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-col gap-6 lg:w-1/2">
          <h1 className="text-[36px] leading-[1.15] font-bold tracking-tight text-[#1f2a44] lg:text-[46px]">
            Find the course that fits your future.
          </h1>

          <p className="max-w-[46ch] text-[15px] leading-relaxed text-[#6b7280] lg:text-[16px]">
            Not sure what to learn next? Take a short assessment and discover the tech or business
            course that matches your interests, goals, experience, and career aspirations.
          </p>

          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              className="rounded-full border border-transparent bg-[#1f2a44] px-6 py-3 text-sm font-semibold text-white hover:bg-[#152036]"
              onClick={() => navigate('/question')}
            >
              Find my course
            </button>
            <button
              type="button"
              className="rounded-full border border-[#1f2a44]/15 bg-transparent px-6 py-3 text-sm font-semibold text-[#1f2a44] hover:bg-[#1f2a44]/5"
              onClick={() => navigate('/sign-in')}
            >
              Log in
            </button>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2">
          <img
            src={heroImage}
            alt="Two colleagues reviewing course options together"
            loading="lazy"
            className="h-160 w-148 object-cover lg:h-160"
          />
        </div>
      </PageContainer>
    </div>
  );
};
