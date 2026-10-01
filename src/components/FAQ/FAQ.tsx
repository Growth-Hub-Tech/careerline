import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { Section, SectionHeader } from '../Section';

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

// Answers are draft copy — edit to match your product.
const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'What is CareerLine AI?',
    answer:
      'CareerLine AI is a career discovery and skill assessment platform. It helps people find suitable career paths, measure real-world skills, and turn skill gaps into clear next steps.',
  },
  {
    question: 'Who is CareerLine AI for?',
    answer:
      'Beginners and career changers, independent professionals who want to verify their skills, recruiters validating candidates, and organizations auditing their teams.',
  },
  {
    question: 'Can CareerLine AI tell me which career I should choose?',
    answer:
      'It recommends paths that fit your interests, background, and constraints, and explains why. The recommendations are guidance, not a verdict — the decision stays with you.',
  },
  {
    question: 'What does the skill assessment measure?',
    answer:
      'Practical, role-specific skills. You complete realistic scenarios and your results are compared against defined standards for the role.',
  },
  {
    question: 'Can organizations test multiple employees?',
    answer:
      'Yes. Organizations can assess whole teams and see capability by role and competency, so skill gaps are visible before they affect delivery.',
  },
  {
    question: 'Can recruiters test candidates?',
    answer:
      'Yes. Recruiters can assess candidates against role-specific requirements. Results support hiring decisions but never make them automatically.',
  },
  {
    question: 'What happens after I receive my results?',
    answer:
      'You get a breakdown of strengths and development areas, plus recommended next steps and learning paths aimed at your specific gaps.',
  },
  {
    question: 'Can I retake a test?',
    answer: 'Yes. Retest after you have trained to see how much your scores have improved.',
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="faq" bg="bg-[#eeeffd]">
      <SectionHeader
        center
        eyebrow="Answers & Details"
        title="Frequently Asked Questions"
        lead="Everything you need to know about the assessments, benchmarks, and data."
      />

      <div className="mx-auto mt-10 flex max-w-[760px] flex-col gap-3">
        {FAQ_ITEMS.map(({ question, answer }, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          return (
            <div
              key={question}
              className="rounded-xl bg-white shadow-[0_2px_10px_rgba(53,37,205,0.05)]"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex min-h-[60px] w-full items-center justify-between gap-4 px-5 py-4 text-left sm:min-h-[64px] sm:px-6"
              >
                <span className="font-heading text-[14px] font-medium text-[#141b34] sm:text-[15px]">
                  {question}
                </span>
                <LuChevronDown
                  size={18}
                  className={`shrink-0 text-[#3525cd] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <p
                  id={panelId}
                  className="px-5 pb-5 text-[13.5px] leading-relaxed text-[#5a6270] sm:px-6"
                >
                  {answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
};
