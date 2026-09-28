import { useState } from 'react';
import type { CSSProperties } from 'react';
import { BeginnerHeader } from '../components/BeginnerHeader';
import { AssessmentSidebar } from '../components/AssessmentSidebar';
import { questions, sections } from '../data/questions';

interface IntakeProps {
  answers: Record<string, string>;
  onAnswer: (questionId: string, option: string) => void;
  onComplete: () => void;
  startAt?: number;
}

const BORDER = '#dfe1e7';
const PURPLE = '#4A3F8C';

const wrapperStyle: CSSProperties = {
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
};

const optionStyle = (selected: boolean): CSSProperties => ({
  border: `1px solid ${selected ? PURPLE : BORDER}`,
  borderRadius: 8,
});

const radioStyle = (selected: boolean): CSSProperties => ({
  border: `5px solid ${selected ? PURPLE : '#d9d9d9'}`,
  backgroundColor: selected ? '#ffffff' : '#d9d9d9',
});

const backStyle: CSSProperties = {
  border: `1px solid ${PURPLE}`,
};

export const Intake = ({ answers, onAnswer, onComplete, startAt = 0 }: IntakeProps) => {
  const [index, setIndex] = useState(startAt);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const selected = answers[question.id];
  const sectionIndex = sections.findIndex((s) => s.id === question.section);

  const handleNext = () => (isLast ? onComplete() : setIndex(index + 1));

  return (
    <div className="flex min-h-screen flex-col bg-[#CBC6E0]">
      <BeginnerHeader />

      <div className="flex flex-1 gap-6 p-[50px] pt-7">
        <AssessmentSidebar sections={sections} currentIndex={sectionIndex} />

        <main className="flex flex-1 flex-col rounded-lg bg-white px-14 py-10">
          <div className="mx-auto w-full max-w-[848px]">
            <p className="text-xs font-semibold text-[#1f2a44]">
              Question {index + 1} of {questions.length}
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#f0f1f5]">
              <div
                className="h-full rounded-full bg-[#D99A1B] transition-all"
                style={{ width: `${((index + 1) / questions.length) * 100}%` }}
              />
            </div>

            <p className="mt-8 text-xs text-[#6b7280]">
              There are no right or wrong answers here. Choose the option that resonates most with
              you.
            </p>
            <h1 className="mt-5 text-[26px] font-bold text-[#1f2a44]">{question.prompt}</h1>

            <div role="radiogroup" className="mt-5 flex flex-col gap-2 p-6" style={wrapperStyle}>
              {question.options.map((option) => {
                const isSelected = selected === option;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onAnswer(question.id, option)}
                    style={optionStyle(isSelected)}
                    className={
                      'flex h-14 w-full items-center justify-between px-4 text-left text-lg transition-colors ' +
                      (isSelected
                        ? 'bg-[#f4f2fb] text-[#4A3F8C]'
                        : 'bg-white text-[#1f2a44] hover:bg-[#f9f8fd]')
                    }
                  >
                    {option}
                    <span className="h-5 w-5 rounded-full" style={radioStyle(isSelected)} />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                disabled={index === 0}
                style={backStyle}
                className="h-10 w-40 rounded-full bg-white text-sm font-medium text-[#4A3F8C] transition-colors hover:bg-[#f4f2fb] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!selected}
                className={
                  'h-10 w-40 rounded-md text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ' +
                  (isLast ? 'bg-[#D99A1B] hover:bg-[#c48b16]' : 'bg-[#4A3F8C] hover:bg-[#3d3375]')
                }
              >
                {isLast ? 'Generate Result →' : 'Next →'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
