import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SAMPLE_MATCHES } from '../data/sampleResults';
import { AssessmentResults } from './AssessmentResults';

const setup = () =>
  render(
    <MemoryRouter>
      <AssessmentResults />
    </MemoryRouter>,
  );

const items = () =>
  within(screen.getByRole('list', { name: 'Recommended career paths' })).getAllByRole('listitem');

describe('AssessmentResults', () => {
  it('congratulates the person', () => {
    setup();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Congratulations... You have successfully completed your test',
      }),
    ).toBeInTheDocument();
  });

  it('introduces the ranked paths', () => {
    setup();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: `Here are your top ${SAMPLE_MATCHES.length} recommended career paths`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'These paths are ranked based on your personality, your goals, your available time, and your financial capacity.',
      ),
    ).toBeInTheDocument();
  });

  it('lists every path in ranked order', () => {
    setup();

    expect(items()).toHaveLength(SAMPLE_MATCHES.length);
    expect(items()[0]).toHaveTextContent(SAMPLE_MATCHES[0].title);
    expect(items()[2]).toHaveTextContent(SAMPLE_MATCHES[2].title);
  });

  it('shows the reason and the match for each path', () => {
    setup();

    SAMPLE_MATCHES.forEach((match, index) => {
      expect(within(items()[index]).getByText(match.reason)).toBeInTheDocument();
      expect(within(items()[index]).getByText(`${match.score}% match`)).toBeInTheDocument();
    });
  });

  it('highlights only the top match', () => {
    setup();

    expect(items()[0]).toHaveAttribute('data-top', 'true');
    expect(items()[1]).toHaveAttribute('data-top', 'false');
  });

  it('draws each score as a bar named after the path', () => {
    setup();

    const bar = screen.getByRole('progressbar', { name: SAMPLE_MATCHES[1].title });

    expect(bar).toHaveAttribute('aria-valuenow', String(SAMPLE_MATCHES[1].score));
    expect(bar).toHaveAttribute('data-variant', 'teal');
  });

  it('starts learning with the top match', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Start Learning' })).toHaveAttribute(
      'href',
      `/programmes/${SAMPLE_MATCHES[0].programmeId}`,
    );
  });

  it('downloads the report from the Download PDF Report button', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Download PDF Report' }));

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });
});
