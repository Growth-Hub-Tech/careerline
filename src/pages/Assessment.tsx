import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowLeft, LuLightbulb } from 'react-icons/lu';
import { FlowHeader } from '../components/FlowHeader';
import { QuestionCard } from '../components/QuestionCard';
import { StepList } from '../components/StepList';
import { SAMPLE_QUESTIONS, SAMPLE_SECTIONS } from '../data/sampleQuestions';

export const Assessment = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = SAMPLE_QUESTIONS[index];
  const isLast = index === SAMPLE_QUESTIONS.length - 1;

  const onNext = () => {
    if (isLast) {
      navigate('/assessment/processing');
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-indigo-200">
      <FlowHeader label="Beginner path" />

      <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <h1 className="sr-only">Career assessment</h1>

        <div className="flex w-full max-w-[1280px] flex-col gap-6 lg:flex-row lg:items-stretch">
          <aside className="flex w-full shrink-0 flex-col justify-between gap-10 rounded-xl bg-white p-6 lg:w-[274px]">
            <div className="flex flex-col gap-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-md text-[15px] font-medium text-indigo-800 transition-colors hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <LuArrowLeft size={16} aria-hidden="true" />
                Back To Homepage
              </Link>
              <StepList steps={SAMPLE_SECTIONS} currentId={question.sectionId} />
            </div>

            <p className="inline-flex items-center gap-2 self-end rounded-2xl bg-indigo-800 px-4 py-3 text-[12px] leading-tight text-white">
              <LuLightbulb size={18} aria-hidden="true" className="shrink-0" />
              Tip: Be honest for best results
            </p>
          </aside>

          <div className="min-w-0 flex-1">
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionCount={SAMPLE_QUESTIONS.length}
              text={question.text}
              options={question.options}
              value={answers[question.id]}
              onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
              onNext={onNext}
              onBack={index > 0 ? () => setIndex((current) => current - 1) : undefined}
              isLast={isLast}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
