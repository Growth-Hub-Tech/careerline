import { useState } from 'react';
import { LuPlus, LuMinus } from 'react-icons/lu';
import avatar1 from '../../assests/avatar1.png';
import avatar2 from '../../assests/avatar2.png';
import avatar3 from '../../assests/avatar3.png';
import { PageContainer } from '../PageContainer';

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'Is the assessment genuinely free?',
    answer:
      'Yes, you can try us for free for 30 days. If you want, we\u2019ll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.',
  },
  {
    question: 'What if I have zero previous experience in tech or business?',
    answer:
      'That\u2019s exactly who the assessment is built for. We start from your interests and transferable skills, not a resume, so a first-time switcher gets a path just as clear as a specialist.',
  },
  {
    question: 'Can I retake the assessment later?',
    answer:
      'Yes. As your skills or goals change, retake it any time and we\u2019ll recalculate your recommended paths against the latest catalog.',
  },
  {
    question: 'How are courses in the catalog vetted?',
    answer:
      'Every course is reviewed against verified job market demand, completion outcomes, and instructor track record before it\u2019s added to a track.',
  },
  {
    question: 'How long does each recommended course track take?',
    answer:
      'Most tracks run 8 to 16 weeks depending on weekly availability, which you set during the assessment so pacing matches your real schedule.',
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-white py-20 lg:py-24">
      <PageContainer>
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-[28px] leading-[1.2] font-bold tracking-tight text-[#1f2a44] lg:text-[32px]">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-[15px] text-[#5a6270]">
            Everything you need to know about the CareerLine.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-[720px] divide-y divide-[#e6e7ee] border-t border-b border-[#e6e7ee]">
          {FAQ_ITEMS.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={question} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-semibold text-[#1f2a44]">{question}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px]  border-gray-400 bg-transparent p-1.5 text-gray-400">
                    {isOpen ? <LuMinus size={16} /> : <LuPlus size={16} />}
                  </span>
                </button>

                {isOpen && (
                  <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-[#6b7280]">
                    {answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-14 flex h-[298px] w-full flex-col items-center justify-center bg-[#F1F2FC] text-center rounded-2xl">
          <div className="flex -space-x-2">
            {[avatar1, avatar2, avatar3].map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt=""
                aria-hidden="true"
                className="h-9 w-9 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          <h3 className="mt-4 text-[16px] font-bold text-[#1f2a44]">Still have questions?</h3>
          <p className="mt-1 text-[14px] text-[#6b7280]">
            Can&apos;t find the answer you&apos;re looking for? Please chat to our friendly team.
          </p>

          <button
            // variant="primary"
            className="mt-5 rounded-lg bg-[#063ccd] px-5 py-2.5 w-[134px] h-[48px] text-sm font-semibold text-white hover:bg-[#052fa3]"
          >
            Get in touch
          </button>
        </div>
      </PageContainer>
    </section>
  );
};
