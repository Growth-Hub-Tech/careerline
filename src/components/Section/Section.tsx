import type { ReactNode } from 'react';
import { LuArrowRight } from 'react-icons/lu';

export const CARD = 'rounded-2xl bg-white shadow-[0_4px_24px_rgba(53,37,205,0.06)]';

export const Container = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

export const Section = ({
  id,
  bg = 'bg-white',
  children,
  className = '',
}: {
  id?: string;
  bg?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section id={id} className={`w-full scroll-mt-20 py-16 sm:py-20 lg:py-24 ${bg} ${className}`}>
    <Container>{children}</Container>
  </section>
);

interface SectionHeaderProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly accent?: string;
  readonly lead?: ReactNode;
  readonly center?: boolean;
  readonly accentClass?: string;
}

export const SectionHeader = ({
  eyebrow,
  title,
  accent,
  lead,
  center = false,
  accentClass = 'text-[#4f46e5]',
}: SectionHeaderProps) => (
  <div className={center ? 'mx-auto text-center' : ''}>
    <span className="block text-[11px] font-bold tracking-[0.12em] text-[#3525cd] uppercase">
      {eyebrow}
    </span>
    <h2 className="font-heading mt-3 text-[28px] leading-[1.15] font-bold tracking-tight text-[#141b34] sm:text-[34px] lg:text-[40px]">
      {title}
      {accent && <span className={`block ${accentClass}`}>{accent}</span>}
    </h2>
    {lead && (
      <p
        className={`mt-4 max-w-[62ch] text-[15px] leading-relaxed text-[#525a6b] sm:text-[17px] ${
          center ? 'mx-auto' : ''
        }`}
      >
        {lead}
      </p>
    )}
  </div>
);

type Variant = 'solid' | 'dark' | 'soft';

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-[#4f46e5] text-white hover:bg-[#4338ca]',
  dark: 'bg-[#3525cd] text-white hover:bg-[#2a1ea3]',
  soft: 'bg-[#e8eaff] text-[#1f2a44] hover:bg-[#dcdffc]',
};

export const ArrowButton = ({
  variant = 'solid',
  onClick,
  children,
  className = '',
}: {
  variant?: Variant;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] ${VARIANTS[variant]} ${className}`}
  >
    {children}
    <LuArrowRight size={14} />
  </button>
);
