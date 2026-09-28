import type { Section } from '../types';

interface AssessmentSidebarProps {
  sections: Section[];
  currentIndex: number;
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth="2.5">
    <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AssessmentSidebar = ({ sections, currentIndex }: AssessmentSidebarProps) => (
  <aside className="flex w-76 shrink-0 flex-col rounded-lg bg-white p-6">
    <div className="flex h-12 items-center rounded-xl border border-[#1f2a44] px-4 text-sm font-semibold text-[#1f2a44]">
      {sections[currentIndex].label}
    </div>

    <ol className="mt-10 flex-1">
      {sections.map((section, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === sections.length - 1;

        return (
          <li key={section.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 ' +
                  (done
                    ? 'border-[#0E8C74] bg-[#0E8C74]'
                    : active
                      ? 'border-[#4A3F8C] bg-[#4A3F8C]'
                      : 'border-[#c9ccd6] bg-white')
                }
              >
                {done && <CheckIcon />}
              </span>
              <span className={'w-px flex-1 bg-[#c9ccd6] ' + (isLast ? 'min-h-8' : 'min-h-12')} />
            </div>
            <span
              className={
                'pt-1 text-xs ' + (active ? 'font-semibold text-[#4A3F8C]' : 'text-[#1f2a44]')
              }
            >
              {section.label}
            </span>
          </li>
        );
      })}
    </ol>

    <div className="mt-6 flex items-center gap-3 self-end rounded-full bg-[#4A3F8C] px-4 py-3">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5 shrink-0"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
      >
        <path
          d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.500 1-2A6 6 0 0012 3z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[11px] leading-snug text-white">Tip: Be honest for best results</span>
    </div>
  </aside>
);
