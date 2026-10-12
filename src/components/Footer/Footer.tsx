import logo from '../../assests/careerline.png';

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
    heading: 'Company',
    links: ['How It Works', 'Help Center', 'Privacy', 'Terms', 'Contact'],
  },
];

export const Footer = () => (
  <footer className="w-full bg-white pt-12 pb-8 sm:pt-16">
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <img
            src={logo}
            alt="CareerLine AI"
            decoding="async"
            className="h-10 w-auto object-contain"
          />
          <p className="mt-3 text-[12px] text-[#2f3347]">Discover. Assess. Develop.</p>
        </div>

        {LINK_GROUPS.map(({ heading, links }) => (
          <div key={heading}>
            <h3 className="font-serif text-[15px] font-semibold text-[#1f2230]">{heading}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {links.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-[12px] text-[#4b5568] transition-colors hover:text-[#6C5CCF]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col gap-2 text-[12px] text-[#2f3347] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} CareerLine AI. All rights reserved. Precision career
          intelligence &amp; skill benchmarking.
        </p>
        <p>
          Powered by <span className="font-semibold text-[#3525cd]">Salesplat</span>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
