import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../PageContainer';

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

/* ── Icons ────────────────────────────────────────────────────────────── */

const IconBadge = ({ children }: { children: ReactNode }) => (
  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2e2757]/8 text-[#2e2757]">
    {children}
  </span>
);

const IconDiagnose = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconBenchmark = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M4 19V6M4 19h16" strokeLinecap="round" />
    <path d="M8 16v-4M12 16V9M16 16v-6" strokeLinecap="round" />
  </svg>
);

const IconLoop = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M20 12a8 8 0 1 1-2.3-5.6" strokeLinecap="round" />
    <path d="M20 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconProfile = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Data ─────────────────────────────────────────────────────────────── */

interface SmallCardData {
  readonly icon: ReactNode;
  readonly title: string;
  readonly body: string;
}

const SMALL_CARDS: readonly SmallCardData[] = [
  {
    icon: <IconDiagnose />,
    title: 'Diagnosis before guessing',
    body: 'We ask about your interests, your time and what you can spend. Then we show you three paths that genuinely fit, and the reason behind each one.',
  },
  {
    icon: <IconBenchmark />,
    title: 'Benchmarked three ways',
    body: 'Every organizational score is measured against the Global Standard, against your own revenue targets, and against the expectations of the title held.',
  },
] as const;

/* ── Section ──────────────────────────────────────────────────────────── */

export const WhyChooseUs = () => (
  <section className="w-full bg-[#f7f7fb] py-16 sm:py-20 lg:py-28">
    <PageContainer>
      {/* Eyebrow pill */}
      <Reveal>
        <span className="inline-block rounded-full border border-[#2e2757]/20 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[#2e2757] uppercase sm:text-[12px]">
          Why choose us
        </span>
      </Reveal>

      {/* Heading with one accented word */}
      <Reveal delay={60}>
        <h2 className="mt-5 max-w-[22ch] text-[30px] leading-[1.12] font-bold tracking-tight text-[#1f2a44] sm:text-[38px] lg:text-[46px]">
          Why <span className="text-[#2e2757]">CareerLine AI</span> is the right choice for you
        </h2>
      </Reveal>

      {/* Grid: 2 small + 1 wide on the left, dark panel on the right */}
      <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3">
        <Reveal delay={120}>
          <SmallCard {...SMALL_CARDS[0]} />
        </Reveal>

        <Reveal delay={180}>
          <SmallCard {...SMALL_CARDS[1]} />
        </Reveal>

        {/* Dark panel spans both rows on desktop */}
        <Reveal delay={240} className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <ProfilePanel />
        </Reveal>

        {/* Wide card under the two small ones */}
        <Reveal delay={300} className="sm:col-span-2 lg:col-span-2">
          <WideCard />
        </Reveal>
      </div>
    </PageContainer>
  </section>
);

/* ── Card pieces ──────────────────────────────────────────────────────── */

const SmallCard = ({ icon, title, body }: SmallCardData) => (
  <div className="flex h-full flex-col rounded-2xl border border-[#e6e7ee] bg-white p-5 sm:p-7">
    <IconBadge>{icon}</IconBadge>
    <h3 className="mt-5 text-[19px] leading-snug font-bold tracking-tight text-[#1f2a44] sm:text-[21px]">
      {title}
    </h3>
    <p className="mt-3 text-[13px] leading-relaxed text-[#6b7280] sm:text-[14px]">{body}</p>
  </div>
);

const WideCard = () => (
  <div className="flex h-full flex-col rounded-2xl border border-[#e6e7ee] bg-white p-5 sm:p-7">
    <IconBadge>
      <IconLoop />
    </IconBadge>
    <h3 className="mt-5 text-[19px] leading-snug font-bold tracking-tight text-[#1f2a44] sm:text-[21px]">
      We close the loop we open
    </h3>
    <p className="mt-3 max-w-[70ch] text-[13px] leading-relaxed text-[#6b7280] sm:text-[14px]">
      A gap without a next step is just a number. Every weakness we surface is matched to a named
      Incubate programme or a partner organization where that fits better, and any test can be
      re-administered after training with the score delta calculated for you.
    </p>
  </div>
);

const ProfilePanel = () => (
  <div className="flex h-full flex-col justify-between rounded-2xl bg-[#2e2757] p-6 text-white sm:p-8">
    <div>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#dda01a]">
        <IconProfile />
      </span>

      <h3 className="mt-6 text-[22px] leading-[1.2] font-bold tracking-tight sm:text-[26px]">
        One skill profile,
        <br className="hidden sm:block" /> shared everywhere
      </h3>

      <p className="mt-4 text-[13px] leading-relaxed text-white/70 sm:text-[14px]">
        A result is never re-entered. It is immediately usable for a hiring decision and immediately
        actionable as a course recommendation.
      </p>

      <p className="mt-3 text-[13px] leading-relaxed text-white/70 sm:text-[14px]">
        Visible to AuxHR for hiring and performance, and actionable through Incubate without
        duplicate entry anywhere in the flow.
      </p>
    </div>

    <Link
      to="/beginner/sign-up"
      className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-[#dda01a] px-5 py-3 text-[14px] font-semibold text-[#2e2757] transition-colors duration-200 hover:bg-[#c78f14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dda01a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#2e2757]"
    >
      Take the free test
      <ArrowRight />
    </Link>
  </div>
);
