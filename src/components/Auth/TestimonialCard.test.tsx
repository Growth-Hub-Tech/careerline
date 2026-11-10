import { render, screen } from '@testing-library/react';
import { TestimonialCard } from './TestimonialCard';

describe('TestimonialCard', () => {
  it('says it is an example, not a real customer', () => {
    render(<TestimonialCard />);

    expect(screen.getByText('Example profile')).toBeInTheDocument();
  });
});
