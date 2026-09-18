import girl from '../../assests/smiling-girl.png';

const CONTAINER = 'mx-auto w-full max-w-[1200px] px-6 lg:px-8';

const AUDIENCES = [
  ['Beginners', 'Find the right career path.'],
  ['Professionals', 'Understand your skills and gaps.'],
  ['Recruiters', 'Verify skills before hiring.'],
  ['Organizations', 'Understand the skills across your team.'],
];

export const AboutUs = () => (
  <section className="w-full bg-[#f7f7fb] py-20 lg:py-28">
    <div className={CONTAINER}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Content */}
        <div>
          <p className="text-sm font-semibold text-[#4a3f8c]">ABOUT CAREERLINE AI</p>

          <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-tight text-[#1f2a44] lg:text-5xl">
            Know where you stand.
            <span className="block text-[#4a3f8c]">Know what comes next.</span>
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#6b7280]">
            CareerLine AI helps people understand their skills, find the right direction, and make
            better career decisions.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7">
            {AUDIENCES.map(([who, need]) => (
              <div key={who}>
                <h3 className="text-sm font-semibold text-[#1f2a44]">{who}</h3>
                <p className="mt-1 text-sm leading-5 text-[#6b7280]">{need}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="absolute -bottom-3 -right-3 h-full w-full rounded-3xl border border-[#4a3f8c]/20" />

          <img
            src={girl}
            alt="CareerLine AI user"
            loading="lazy"
            className="relative aspect-[4/5] w-full rounded-3xl object-cover"
          />
        </div>
      </div>
    </div>
  </section>
);
