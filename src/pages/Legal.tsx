import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  LEGAL_UPDATED,
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  type LegalSection,
} from '../content/legal';
import { formatDate } from '../lib/format';

const LINK = 'font-medium text-indigo-700 underline hover:text-indigo-900';

interface LegalPageProps {
  readonly title: string;
  readonly intro: ReactNode;
  readonly sections: readonly LegalSection[];
}

const LegalPage = ({ title, intro, sections }: LegalPageProps) => (
  <article className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-5 py-14 sm:px-8">
    <header className="flex flex-col gap-3">
      <h1 className="font-heading text-[36px] leading-[1.15] font-bold text-slate-950">{title}</h1>
      <p className="text-[14px] text-slate-500">Last updated {formatDate(LEGAL_UPDATED)}</p>
      <p className="text-[17px] leading-[1.6] text-slate-700">{intro}</p>
    </header>

    {sections.map((section) => (
      <section key={section.title} className="flex flex-col gap-3">
        <h2 className="font-heading text-[22px] font-bold text-slate-950">{section.title}</h2>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-[16px] leading-[1.65] text-slate-700">
            {paragraph}
          </p>
        ))}
      </section>
    ))}

    <p className="text-[16px] text-slate-700">
      Questions?{' '}
      <Link to="/contact" className={LINK}>
        Contact us
      </Link>
    </p>
  </article>
);

export const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy policy"
    intro={
      <>
        This page explains what CareerLine AI collects, why, and who can see it. You can manage your
        data at any time in your{' '}
        <Link to="/settings/privacy" className={LINK}>
          privacy centre
        </Link>
        .
      </>
    }
    sections={PRIVACY_SECTIONS}
  />
);

export const Terms = () => (
  <LegalPage
    title="Terms of service"
    intro="These terms apply when you use CareerLine AI. By creating an account you agree to them."
    sections={TERMS_SECTIONS}
  />
);
