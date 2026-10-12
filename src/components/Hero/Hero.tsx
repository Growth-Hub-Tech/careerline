import heroImage from '../../assests/hero-team.png';
import { HeroCard } from './HeroCard';

export const Hero = () => (
  <section className="w-full bg-white py-10 lg:py-16">
    <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-[1fr_480px] lg:gap-10 lg:px-8">
      <HeroCard />
      <img
        src={heroImage}
        alt="Smiling professional working on a laptop outdoors"
        fetchPriority="high"
        className="h-64 w-full rounded-3xl object-cover sm:h-80 lg:h-[640px]"
      />
    </div>
  </section>
);
