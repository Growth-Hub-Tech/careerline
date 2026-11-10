import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HELP_TOPICS } from '../content/help';
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from '../content/legal';
import { Help } from './Help';
import { PrivacyPolicy, Terms } from './Legal';

const inRouter = (element: ReactElement) => render(<MemoryRouter>{element}</MemoryRouter>);

describe('Help', () => {
  it('groups the common questions by topic', () => {
    inRouter(<Help />);

    expect(screen.getByRole('heading', { level: 1, name: 'Help Center' })).toBeInTheDocument();
    HELP_TOPICS.forEach((topic) =>
      expect(screen.getByRole('heading', { level: 2, name: topic.title })).toBeInTheDocument(),
    );
  });

  it('opens an answer when the question is chosen', async () => {
    inRouter(<Help />);

    const [first] = HELP_TOPICS[0].questions;
    const question = screen.getByText(first.question);
    expect(screen.getByText(first.answer)).not.toBeVisible();

    await userEvent.click(question);

    expect(screen.getByText(first.answer)).toBeVisible();
  });

  it('offers support when the answer is not there', () => {
    inRouter(<Help />);

    expect(screen.getByRole('link', { name: 'Contact support' })).toHaveAttribute(
      'href',
      '/contact?topic=support',
    );
  });
});

describe.each([
  ['Privacy policy', <PrivacyPolicy key="privacy" />, PRIVACY_SECTIONS],
  ['Terms of service', <Terms key="terms" />, TERMS_SECTIONS],
])('%s', (title, element, sections) => {
  it('shows every section and when it was last updated', () => {
    inRouter(element);

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText('Last updated 4 Nov 2026')).toBeInTheDocument();
    sections.forEach((section) =>
      expect(screen.getByRole('heading', { level: 2, name: section.title })).toBeInTheDocument(),
    );
  });

  it('says how to get in touch', () => {
    inRouter(element);

    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact');
  });
});

describe('PrivacyPolicy', () => {
  it('points to the privacy centre', () => {
    inRouter(<PrivacyPolicy />);

    expect(screen.getByRole('link', { name: 'privacy centre' })).toHaveAttribute(
      'href',
      '/settings/privacy',
    );
  });
});
