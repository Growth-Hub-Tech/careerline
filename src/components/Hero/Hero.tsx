import { useNavigate } from 'react-router-dom';
import heroImage from '../../assests/hero-team.png';

// Update these to match your real route and WhatsApp number (international format, no + or spaces).
const ASSESSMENT_PATH = '/question';
const WHATSAPP_URL =
  'https://wa.me/234XXXXXXXXXX?text=Hi%20CareerLine%20AI%2C%20I%27d%20like%20to%20take%20the%20assessment';

const CTA_BASE =
  'flex h-12 w-full items-center justify-center rounded-full px-6 text-[15px] font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="flex w-full items-center bg-white py-10 sm:py-14 lg:h-[800px] lg:py-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-5 sm:px-6 lg:flex-row lg:gap-16 lg:px-[32px]">
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

          {/* Stacked, equal-width CTAs centered in the text column */}
          <div className="mt-3 flex w-full max-w-[435px] flex-col gap-5 self-center lg:gap-[30px]">
            <button
              type="button"
              className={`${CTA_BASE} bg-amber-500 hover:bg-amber-600 focus-visible:outline-amber-500`}
              onClick={() => navigate(ASSESSMENT_PATH)}
            >
              Start your Free Assessment
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${CTA_BASE} bg-[#0e8f6e] hover:bg-[#0b7a5e] focus-visible:outline-[#0e8f6e]`}
            >
              Prefer Whatsapp? Take assessment here
            </a>
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
