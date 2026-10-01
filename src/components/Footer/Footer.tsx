import { LuTrendingUp } from 'react-icons/lu';
import { Container } from '../Section';

interface LinkGroup {
  readonly heading: string;
  readonly links: readonly string[];
}

const LINK_GROUPS: readonly LinkGroup[] = [
  {
    heading: 'For Individuals',
    links: ['Career Discovery', 'Skill Assessments', 'Benchmark Reports', 'Development Roadmaps'],
  },
  {
    heading: 'For Organizations',
    links: [
      'Workforce Capability Audit',
      'Role Benchmarking',
      'Team Heatmaps',
      'Enterprise Skills API',
    ],
  },
  {
    heading: 'For Recruiters',
    links: ['Candidate Skill Validation', 'Role Standards', 'Verified Reports'],
  },
  {
    heading: 'Platform & Company',
    links: [
      'How It Works',
      'Responsible AI',
      'Methodology',
      'Resources',
      'Help Center',
      'Privacy',
      'Terms',
      'Contact',
    ],
  },
];

export const Footer = () => (
  <footer className="w-full border-t border-[#eceef4] bg-white pt-12 pb-8 sm:pt-16">
    <Container>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c1f4a] text-white">
              <LuTrendingUp size={16} />
            </span>
            <span className="font-heading text-[15px] font-semibold text-[#141b34]">
              CareerLine AI
            </span>
          </div>
          <p className="mt-3 text-[12px] text-[#5a6270]">Discover. Assess. Develop.</p>
        </div>

        {LINK_GROUPS.map(({ heading, links }) => (
          <div key={heading}>
            <h3 className="font-heading text-[14px] font-semibold text-[#141b34]">{heading}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {links.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-[11.5px] text-[#5a6270] transition-colors hover:text-[#3525cd]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[11px] text-[#5a6270]">
        © {new Date().getFullYear()} CareerLine AI. All rights reserved. Precision career
        intelligence &amp; skill benchmarking.
      </p>
    </Container>
  </footer>
);

export default Footer;
