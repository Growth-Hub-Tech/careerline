interface LinkGroup {
  readonly heading: string;
  readonly links: readonly string[];
}

const LINK_GROUPS: readonly LinkGroup[] = [
  { heading: 'Explore', links: ['Career Clusters', 'Course Catalog', 'Skills Assessment'] },
  { heading: 'Platform', links: ['How It Works', 'Milestone Tracking', 'Methodology'] },
  { heading: 'Company', links: ['About Us', 'Privacy Policy', 'Terms of Service'] },
];

export const Footer = () => (
  <footer className="w-full bg-white pt-12 pb-8 sm:pt-16">
    <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-[32px]">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-[#e6e7ee] pb-10 sm:grid-cols-3 sm:pb-12 lg:grid-cols-[auto_auto_auto_auto] lg:gap-x-20">
        <div className="col-span-2 max-w-[32ch] sm:col-span-3 lg:col-span-1">
          <span className="text-[17px] font-bold tracking-tight text-[#1f2a44]">CareerLine AI</span>
          <p className="mt-3 text-[13px] leading-relaxed text-[#6b7280]">
            Empowering ambitious minds to navigate modern education and career pathways through
            rigorous, intelligent recommendations and milestone mapping.
          </p>
        </div>

        {LINK_GROUPS.map(({ heading, links }) => (
          <div key={heading}>
            <h3 className="text-[12px] font-semibold tracking-[0.12em] text-[#1f2a44] uppercase">
              {heading}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {links.map((label) => (
                <li key={label}>
                  <a href="#" className="text-[13px] text-[#6b7280] hover:text-[#063ccd]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-[#9aa1b0]">
        © {new Date().getFullYear()} Pathfinder Inc. All rights reserved. Precision career
        navigation.
      </p>
    </div>
  </footer>
);

export default Footer;
