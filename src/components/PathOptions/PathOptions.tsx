import { Button } from '../Button';
import './PathOptions.scss';
import { PageContainer } from '../PageContainer';
import { useNavigate } from 'react-router-dom';

interface PathOption {
  key: string;
  title: string;
  description: string;
  cta: string;
  accent: 'coral' | 'teal' | 'purple' | 'gold';
  path: string;
}

const paths: PathOption[] = [
  {
    key: 'explore',
    title: 'I am exploring a career',
    description: 'Take a short assessment and get a ranked list of tech paths that fit you.',
    cta: 'Start your assessment',
    accent: 'coral',
    path: '/beginner/sign-up', //I will change this later based on if user is signed in already or not(if session has not expired yet)
    // path: '/question',
  },
  {
    key: 'audit',
    title: 'I am auditing my team',
    description: 'Test your staff against the Global Standard for their roles and titles.',
    cta: 'Set up your organization',
    accent: 'teal',
    path: '/organization/sign-up', // I will change this later based on if user is signed in already or not(if session has not expired yet)
    // path: '/organization',
  },
  {
    key: 'hire',
    title: 'I am hiring a candidate',
    description: "Verify a candidate's real skill level before you make an offer.",
    cta: 'Start recruiter testing',
    accent: 'purple',
    path: '/recruiter/sign-up', //I will change this later based on if user is signed in already or not(if session has not expired yet)
  },
  {
    key: 'self-test',
    title: 'I want to test myself',
    description: 'Take a skill test on your own and download a shareable report.',
    cta: 'Take a self-test',
    accent: 'gold',
    path: '/self-test',
  },
];

export const PathOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="path-options w-full">
      <PageContainer className="path-options-main">
        <h2 className="path-options-title">Choose the path that matches what you need today.</h2>

        <div className="path-grid">
          {paths.map((option) => (
            <div key={option.key} className={`path-card path-card--${option.accent}`}>
              <div className="path-card-top" />
              <div className="path-card-body">
                <h3 className="path-card-title">{option.title}</h3>
                <p className="path-card-desc">{option.description}</p>
              </div>
              <div className="path-card-btn-wrap">
                <Button
                  variant="primary"
                  className={`path-card-btn path-card-btn--${option.accent}`}
                  onClick={() => navigate(option.path)}
                >
                  {option.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
};
