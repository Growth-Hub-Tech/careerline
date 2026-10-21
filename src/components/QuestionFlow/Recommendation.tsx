import { useState } from 'react';
import { PageTitleText, BodyText, HeadingText, SmallText } from '../index';
import { apiService } from '../../services/api';
import type { RecommendationItem } from '../../types/api';
import './Recommendation.scss';
import { Button } from '../Button';

interface RecommendationProps {
  items: RecommendationItem[];
  recommendationId: string;
}

type PdfState = 'idle' | 'loading' | 'error';

export const Recommendation = ({ items, recommendationId }: RecommendationProps) => {
  const [pdfState, setPdfState] = useState<PdfState>('idle');

  const handleDownloadPDF = async () => {
    console.log('[Recommendation] Requesting PDF generation for:', recommendationId);
    setPdfState('loading');
    try {
      const genResp = await apiService.generateReport(recommendationId);
      console.log('[Recommendation] Generate report response:', genResp);
      const reportId = (genResp['report_id'] as string | undefined) ?? recommendationId;

      const deadline = Date.now() + 30_000;
      let pollCount = 0;
      while (Date.now() < deadline) {
        pollCount += 1;
        const report = await apiService.getReport(reportId);
        console.log(
          `[Recommendation] Poll #${pollCount} — status: "${report.status}", url: ${report.report_url ?? 'none'}`,
        );
        if (report.report_url && ['ready', 'completed'].includes(report.status)) {
          console.log('[Recommendation] Report ready. Opening:', report.report_url);
          window.open(report.report_url, '_blank', 'noopener,noreferrer');
          setPdfState('idle');
          return;
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      }
      throw new Error('Timeout waiting for report');
    } catch (err) {
      console.error('[Recommendation] PDF generation failed:', err);
      setPdfState('error');
    }
  };

  const pdfLabel =
    pdfState === 'loading'
      ? 'Generating PDF…'
      : pdfState === 'error'
        ? 'Retry Download'
        : 'Download PDF Report';

  return (
    <div className="recommendationWrapper">
      <div className="recommendationHeader">
        <div className="recommendationBadge">
          <svg className="badgeIcon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.2" />
            <circle cx="50" cy="50" r="35" fill="currentColor" />
            <path
              d="M35 50L45 60L65 40"
              stroke="white"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <PageTitleText weight="bold" className="titleText">
          You have successfully completed your Test
        </PageTitleText>

        <BodyText className="subtitleText">
          Here are your top {items.length} career recommendations based on your profile
        </BodyText>
      </div>

      <div className="coursesList">
        {items.map((item) => (
          <div key={item.career_id} className="courseCard">
            <div className="courseHeader">
              <HeadingText weight="semibold" className="courseTitle">
                {item.career_name ?? item.career_id}
              </HeadingText>
              <SmallText weight="semibold" className="coursePercentage">
                {item.fitness_pct}% fit
              </SmallText>
            </div>

            <div className="progressBar">
              <div className="progressFill" style={{ width: `${item.fitness_pct}%` }} />
            </div>

            {item.reasons.length > 0 && (
              <div className="careerSection">
                <SmallText weight="semibold" className="sectionLabel">
                  Why this fits you
                </SmallText>
                <ul className="bulletList">
                  {item.reasons.map((reason, i) => (
                    <li key={i}>
                      <BodyText as="span">{reason}</BodyText>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.next_steps.length > 0 && (
              <div className="careerSection">
                <SmallText weight="semibold" className="sectionLabel">
                  Next steps
                </SmallText>
                <ul className="bulletList">
                  {item.next_steps.map((step, i) => (
                    <li key={i}>
                      <BodyText as="span">{step}</BodyText>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="actionBar">
        <Button
          variant="secondary"
          className="pdfButton"
          onClick={handleDownloadPDF}
          disabled={pdfState === 'loading'}
        >
          {pdfLabel}
        </Button>
      </div>
    </div>
  );
};
