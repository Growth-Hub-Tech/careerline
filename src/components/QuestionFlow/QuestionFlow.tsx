import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageTitleText, BodyText, HeadingText, MediumText } from '../index';
import { apiService } from '../../services/api';
import type { ServerQuestion } from '../../types/api';
import './QuestionFlow.scss';
import { Button } from '../Button';

interface QuestionFlowProps {
  onComplete: (answers: Record<string, string>) => void;
}

export const QuestionFlow = ({ onComplete }: QuestionFlowProps) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['onboard-questions'],
    queryFn: () => {
      console.log('[QuestionFlow] Fetching questions from API…');
      return apiService.getQuestions().then((res) => {
        console.log(`[QuestionFlow] Loaded ${res.total} questions`, res.questions);
        return res;
      });
    },
  });

  const questions: ServerQuestion[] = data?.questions ?? [];

  if (isLoading) {
    return (
      <div className="questionWrapper">
        <div className="skeletonCard">
          <div className="skeletonBackLink" />

          <div className="skeletonTitle">
            <div className="skeletonLine" />
            <div className="skeletonLine" />
          </div>

          <div className="skeletonSubtitle" />

          <div className="skeletonProgressArea">
            <div className="skeletonProgressLabels">
              <span />
              <span />
            </div>
            <div className="skeletonProgressBar" />
          </div>

          <div className="d-flex flex-column gap-4">
            <div className="skeletonQuestion" />
            <div className="skeletonOptions">
              {[100, 75, 88, 60].map((w) => (
                <div key={w} className="skeletonOption">
                  <div className="skeletonRadio" />
                  <div className="skeletonLabel" style={{ maxWidth: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>

          <div className="skeletonActions">
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('[QuestionFlow] Failed to load questions');
    return (
      <div className="questionWrapper">
        <div className="questionCard">
          <div className="d-flex flex-column gap-4">
            <HeadingText weight="semibold">Failed to load questions</HeadingText>
            <BodyText>Please check your connection and try again.</BodyText>
            <div className="w-33">
              <Button variant="primary" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;
  const isChoiceType = currentQuestion.type === 'choice';
  const canProceed = isChoiceType ? selectedOption !== null : true;

  const applyAnswerForQuestion = (q: ServerQuestion, saved: Record<string, string>) => {
    const val = saved[q.id] ?? '';
    if (q.type === 'choice') {
      setSelectedOption(val || null);
      setInputValue('');
    } else {
      setInputValue(val);
      setSelectedOption(null);
    }
  };

  const handleNext = () => {
    const value = isChoiceType ? selectedOption : inputValue;
    const updated = value ? { ...answers, [currentQuestion.id]: value } : { ...answers };
    setAnswers(updated);

    console.log(
      `[QuestionFlow] Q${currentIndex + 1} "${currentQuestion.id}" answered:`,
      value ?? '(skipped)',
    );

    if (currentIndex < totalQuestions - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      applyAnswerForQuestion(questions[nextIndex], updated);
    } else {
      console.log('[QuestionFlow] All questions answered. Submitting answers:', updated);
      onComplete(updated);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      navigate('/');
      return;
    }
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    applyAnswerForQuestion(questions[prevIndex], answers);
  };

  return (
    <div className="questionWrapper">
      <div className="questionCard">
        <div className="d-flex flex-column gap-4">
          <button className="backLink" onClick={() => navigate('/')}>
            <BodyText as="span">← Back To Homepage</BodyText>
          </button>

          <PageTitleText weight="bold" className="text-secondary">
            Take the CareerLine AI Assessment Test
          </PageTitleText>

          <MediumText>Answer a few simple questions to discover your best career path.</MediumText>
        </div>

        <div className="d-flex flex-column gap-3">
          <div className="d-flex justify-between items-center">
            <BodyText variant="secondary" weight="medium">
              Question {currentIndex + 1} of {totalQuestions}
            </BodyText>
            <BodyText variant="secondary" weight="medium">
              {Math.round(progressPercentage)}%
            </BodyText>
          </div>

          <div className="progressBar">
            <div className="progressFill" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className="d-flex flex-column gap-6">
          <HeadingText weight="semibold" className="text-primary">
            {currentQuestion.text}
          </HeadingText>

          {currentQuestion.type === 'choice' && currentQuestion.options && (
            <div className="d-flex flex-column gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  className={`optionItem ${selectedOption === option.id ? 'optionSelected' : ''}`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <div
                    className={`optionRadio ${selectedOption === option.id ? 'radioSelected' : ''}`}
                  />
                  <BodyText as="span">{option.label}</BodyText>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'text' && (
            <textarea
              className="textInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer here… (optional)"
              rows={4}
            />
          )}

          {currentQuestion.type === 'number' && (
            <input
              type="number"
              className="numberInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a number… (optional)"
              min={0}
            />
          )}
        </div>

        <div className="d-flex justify-between gap-4 mt-4">
          <div className="w-33">
            <Button variant="transparent" border="solid" onClick={handleBack}>
              ← Back
            </Button>
          </div>

          <div className="w-33">
            <Button variant="primary" onClick={handleNext} disabled={!canProceed}>
              {currentIndex === totalQuestions - 1 ? 'Submit' : 'Next'} →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
