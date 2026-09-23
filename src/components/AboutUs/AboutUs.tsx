import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import girl from '../../assests/smiling-girl.png';

const CONTAINER = 'mx-auto w-full max-w-[1200px] px-6 lg:px-8';

// Fades a block up the first time it comes into view, once. Skipped entirely
// for anyone whose system asks for reduced motion.
const Reveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const AboutUs = () => (
  <section className="w-full bg-[#f7f7fb] py-20 lg:py-28">
    <div className={CONTAINER}>
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <h2 className="text-[34px] leading-[1.15] font-bold tracking-tight text-[#1f2a44] lg:text-[40px]">
            Who we are
          </h2>

          <p className="mt-6 max-w-[48ch] text-[19px] leading-relaxed text-[#1f2a44]">
            CareerLine AI helps you work out what to do next in tech.
          </p>

          <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-[#6b7280]">
            If you are starting out, we ask about your interests, your time and what you can spend.
            Then we show you three paths that fit, and why we picked each one.
          </p>

          <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-[#6b7280]">
            If you run a team, we test what your people can actually do and show you where the gaps
            are. Either way, you leave with a clear next step.
          </p>

          <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-[#6b7280]">
            It works for people starting out in tech, companies checking where their team stands,
            recruiters sizing up a candidate, and anyone who just wants to test themselves.
          </p>
        </Reveal>

        <Reveal delay={120} className="relative lg:col-span-5">
          {/* Flat offset panel rather than a drop shadow — a frame, not a card
              floating for no reason. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-[20px] bg-[#4a3f8c]/12"
          />
          <img
            src={girl}
            alt="A CareerLine AI user looking at her results"
            loading="lazy"
            className="relative h-full max-h-[440px] w-full rounded-[20px] object-cover"
          />
        </Reveal>
      </div>
    </div>
  </section>
);
