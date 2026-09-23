import { HeroText, MediumText } from '../Text';
import styles from './Target.module.scss';
import { PageContainer } from '../PageContainer';

const items = [
  {
    label:
      'People exploring a tech career for the first time. Get a path recommendation grounded in your personality, goals, time, and budget, not a generic "top jobs" list.',
    tag: 'Beginners',
  },
  {
    label:
      'Organizations that want evidence, not assumption, on whether staff skill matches the roles and titles they hold, with bulk testing and a team-wide capability view.',
    tag: 'Organizations',
  },
  {
    label:
      'Recruiters who need to verify a candidate\u2019s real skill level before extending an offer, scoped to a single candidate or shortlist.',
    tag: 'Recruiters',
  },
  {
    label:
      'Independent professionals who want an objective, downloadable record of their skill level for a portfolio, LinkedIn, or a job search.',
    tag: 'Professionals',
  },
];

export const Target = () => (
  <PageContainer>
    <div className={styles.header}>
      <span className={styles.eyebrow}>Who We Serve</span>
      <HeroText variant="black" weight="bold">
        One engine. Four ways to prove your skill.
      </HeroText>
      <MediumText weight="medium" variant="secondary">
        From choosing a first tech path to auditing an entire team, CareerLine AI gives every stage
        a clear, data-driven answer.
      </MediumText>
    </div>
    <div className={styles.grid}>
      {items.map((item, index) => (
        <div className={styles.target} key={item.tag}>
          <div className={styles.top}>
            <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.tag}>{item.tag}</span>
          </div>
          <MediumText className={styles.label} variant="secondary">
            {item.label}
          </MediumText>
        </div>
      ))}
    </div>
  </PageContainer>
);
