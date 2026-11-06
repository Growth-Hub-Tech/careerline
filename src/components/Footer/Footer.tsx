import { Link } from 'react-router-dom';
import logo from '../../assets/careerline.png';

interface FooterLink {
  readonly label: string;
  readonly to?: string;
}

interface LinkGroup {
  readonly heading: string;
  readonly to?: string;
  readonly links: readonly FooterLink[];
}

const LINK_CLASS =
  'inline-block py-0.5 text-[13px] break-words text-[#4b5568] transition-colors hover:text-[#6C5CCF] sm:text-[12px]';

const LINK_GROUPS: readonly LinkGroup[] = [
  {
    heading: 'For Individuals',
    to: '/for-individuals',
    links: [
      { label: 'Career Discovery' },
      { label: 'Skill Assessments' },
      { label: 'Benchmark Reports' },
      { label: 'Development Roadmaps' },
    ],
  },
  {
    heading: 'For Organizations',
    to: '/for-organizations',
    links: [
      { label: 'Workforce Capability Audit' },
      { label: 'Role Benchmarking' },
      { label: 'Team Heatmaps' },
      { label: 'Enterprise Skills API' },
    ],
  },
  {
    heading: 'For Recruiters',
    to: '/for-recruiters',
    links: [
      { label: 'Candidate Skill Validation' },
      { label: 'Role Standards' },
      { label: 'Verified Reports' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Pricing', to: '/pricing' },
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Help Center', to: '/help' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

export const Footer = () => (
  <footer className="w-full bg-white pt-10 pb-8 sm:pt-16">
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <img
            src={logo}
            alt="CareerLine AI"
            decoding="async"
            className="h-9 w-auto object-contain sm:h-10"
          />
          <p className="mt-3 text-[12px] text-[#2f3347]">Discover. Assess. Develop.</p>
        </div>

        {LINK_GROUPS.map(({ heading, to, links }) => (
          <div key={heading} className="min-w-0">
            <h3 className="font-heading text-[15px] font-bold text-[#1f2230]">
              {to ? (
                <Link to={to} className="transition-colors hover:text-[#6C5CCF]">
                  {heading}
                </Link>
              ) : (
                heading
              )}
            </h3>
            <ul className="mt-3 flex flex-col gap-3 sm:mt-4">
              {links.map(({ label, to: href }) => (
                <li key={label}>
                  {href ? (
                    <Link to={href} className={LINK_CLASS}>
                      {label}
                    </Link>
                  ) : (
                    <span className={LINK_CLASS}>{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-2 text-[12px] text-[#2f3347] sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} CareerLine AI. All rights reserved. Precision career
          intelligence &amp; skill benchmarking.
        </p>
        <p className="shrink-0">
          Powered by <span className="font-semibold text-[#3525cd]">Salesplat</span>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
