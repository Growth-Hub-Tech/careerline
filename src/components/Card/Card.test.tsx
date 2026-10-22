import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Card body</Card>);

    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('renders no heading or region without a title', () => {
    render(<Card>Card body</Card>);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('renders the title as a level 3 heading by default', () => {
    render(<Card title="Your top 3 strengths" />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Your top 3 strengths' }),
    ).toBeInTheDocument();
  });

  it('lets the heading level be chosen', () => {
    render(<Card title="Your top 3 strengths" headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('becomes a region named by its title', () => {
    render(<Card title="Your top 3 strengths">Body</Card>);

    expect(screen.getByRole('region', { name: 'Your top 3 strengths' })).toHaveTextContent('Body');
  });

  it('renders a description under the title', () => {
    render(<Card title="Role fit" description="Roles that match your answers." />);

    expect(screen.getByText('Roles that match your answers.')).toBeInTheDocument();
  });

  it('shows a decorative icon', () => {
    render(<Card title="Role fit" icon={<svg data-testid="icon" />} />);

    expect(screen.getByTestId('card-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders a footer', () => {
    render(
      <Card title="Role fit" footer={<button type="button">View programme</button>}>
        Body
      </Card>,
    );

    expect(screen.getByRole('button', { name: 'View programme' })).toBeInTheDocument();
  });

  it('accepts extra classes on the card itself', () => {
    const { container } = render(<Card className="mt-6">Card body</Card>);

    expect(container.firstElementChild).toHaveClass('mt-6');
  });
});
