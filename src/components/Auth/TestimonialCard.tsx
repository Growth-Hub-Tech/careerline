import { LuBadgeCheck, LuStar } from 'react-icons/lu';

type Tone = 'teal' | 'indigo' | 'slate' | 'amber' | 'terracotta';

interface Skill {
  readonly label: string;
  readonly tone: Tone;
}

export interface Testimonial {
  readonly name: string;
  readonly rating: number;
  readonly role: string;
  readonly company: string;
  readonly skills: readonly Skill[];
}

const TONES: Record<Tone, string> = {
  teal: 'border-teal-600 bg-teal-50 text-teal-700',
  indigo: 'border-indigo-500 bg-indigo-50 text-indigo-700',
  slate: 'border-slate-500 bg-slate-50 text-slate-700',
  amber: 'border-amber-600 bg-amber-50 text-amber-800',
  terracotta: 'border-terracotta-600 bg-terracotta-50 text-terracotta-700',
};

export const DEFAULT_TESTIMONIAL: Testimonial = {
  name: 'Skye Favour',
  rating: 4.9,
  role: 'Founder, Catalog',
  company: 'Web Design Agency',
  skills: [
    { label: 'Design Systems', tone: 'teal' },
    { label: 'Product Design', tone: 'indigo' },
    { label: 'Vibe-Coding', tone: 'slate' },
    { label: 'Product Management', tone: 'amber' },
    { label: 'Team Mentorship', tone: 'terracotta' },
  ],
};

export const TestimonialCard = ({
  testimonial = DEFAULT_TESTIMONIAL,
}: {
  testimonial?: Testimonial;
}) => {
  const { name, rating, role, company, skills } = testimonial;

  return (
    <figure className="border border-white/40 bg-slate-950/25 p-6 text-white backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption className="text-[28px] leading-tight font-semibold xl:text-[34px]">
          {name}
        </figcaption>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 text-amber-400" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <LuStar key={i} size={18} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span className="text-[18px] font-medium">
            <span className="sr-only">Rated </span>
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      <p className="mt-4 text-[18px] font-semibold">{role}</p>
      <p className="mt-1 text-[16px] text-white/90">{company}</p>

      <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-3">
        {skills.map(({ label, tone }) => (
          <li
            key={label}
            className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-[15px] font-medium xl:text-[16px] ${TONES[tone]}`}
          >
            <LuBadgeCheck size={18} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </figure>
  );
};
