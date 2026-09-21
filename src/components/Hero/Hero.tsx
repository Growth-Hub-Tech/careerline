import { useNavigate } from 'react-router-dom';
import heroImage from '../../assests/hero-team.png';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="flex w-full items-center bg-white py-10 sm:py-14 lg:h-[800px] lg:py-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-5 sm:px-6 lg:flex-row lg:gap-16 lg:px-[32px]">
        <div className="flex w-full flex-col gap-5 lg:w-1/2 lg:gap-6">
          <h1 className="text-[32px] leading-[1.15] font-bold tracking-tight text-[#1f2a44] sm:text-[36px] lg:text-[46px]">
            Find the course that fits your future.
          </h1>

          <p className="max-w-[46ch] text-[15px] leading-relaxed text-[#6b7280] lg:text-[16px]">
            Not sure what to learn next? Take a short assessment and discover the tech or business
            course that matches your interests, goals, experience, and career aspirations.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              className="h-12 rounded-full border border-transparent bg-[#1f2a44] px-6 text-sm font-semibold text-white hover:bg-[#152036]"
              onClick={() => navigate('/question')}
            >
              Find my course
            </button>
            <button
              type="button"
              className="h-12 bg-[#E2E7FF] rounded-full border border-[#1f2a44]/15 px-6 text-sm font-semibold text-[#1f2a44] hover:bg-[#1f2a44]/5"
              onClick={() => navigate('/sign-in')}
            >
              Log in
            </button>
          </div>
        </div>

        <div className="relative flex w-full justify-center lg:w-1/2 lg:justify-end">
          <img
            src={heroImage}
            alt="Two colleagues reviewing course options together"
            fetchPriority="high"
            className="aspect-[37/40] w-full max-w-[592px] object-cover lg:aspect-auto lg:h-160 lg:w-148"
          />
        </div>
      </div>
    </section>
  );
};
