import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowLeft } from 'react-icons/lu';
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
      navigate('/assessment/results');
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <main className="min-h-dvh bg-indigo-600 px-5 py-6 sm:px-8 sm:py-10">
      <h1 className="sr-only">Career assessment</h1>

      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="flex w-full shrink-0 flex-col gap-8 rounded-2xl bg-white p-6 lg:w-[280px]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md text-[14px] font-medium text-slate-700 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <LuArrowLeft size={16} aria-hidden="true" />
            Back to Homepage
          </Link>
          <StepList steps={SAMPLE_SECTIONS} currentId={question.sectionId} />
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
  );
};
