import heroImage from '../../assets/hero-team.png';
import { HeroCard } from './HeroCard';

export const Hero = () => (
  <section className="w-full overflow-hidden bg-white">
    <div className="mx-auto grid w-full max-w-[1440px] lg:grid-cols-[1fr_480px]">
      <div className="flex items-center px-5 py-10 sm:px-6 lg:py-16 lg:pr-10 lg:pl-8 min-[1440px]:pl-20">
        <HeroCard />
      </div>
      <div className="relative overflow-hidden lg:self-stretch">
        <img
          src={heroImage}
          alt="Smiling professional working on a laptop outdoors"
          fetchPriority="high"
          className="block h-auto w-full lg:absolute lg:inset-0 lg:h-full lg:object-cover"
        />
      </div>
    </div>
  </section>
);
