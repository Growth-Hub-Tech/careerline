import { DisplayText, MediumText } from '../Text';
import { PageContainer } from '../PageContainer';

export const Hero = () => (
  /* .hero — overflow-hidden is what clips the orb against the top edge */
  <div className="relative w-full overflow-hidden bg-[#4a3f8c] py-10 md:min-h-70 md:py-12">
    {/* .hero-main */}
    <PageContainer className="mx-auto flex h-[280px] w-full max-w-7xl flex-col items-center justify-start px-4 md:flex-row md:px-8">
      {/* .text-box */}
      <div className="relative z-1 max-w-175 flex w-full flex-col gap-4 md:w-3/5">
        <DisplayText weight="bold" variant="white" size="3xl">
          Get Guidance for Career Path or Measure Skill Level, at a Global Standard.
        </DisplayText>

        <MediumText weight="light" variant="white" size="sm">
          CareerLine AI tells you which career path fits you, tells organizations how their team
          measures up, and tells recruiters whether a candidate is truly ready.
        </MediumText>
      </div>
    </PageContainer>

    {/* .hero-orb — decorative, so it stays hidden from screen readers */}
    <div
      aria-hidden="true"
      className="absolute -top-[50px] -right-[60px] z-0 hidden h-[260px] w-[260px] rounded-full bg-[#5c4fa1] md:block"
    />
  </div>
);
