import { render, screen } from '@testing-library/react';
import { FlowHeader } from './FlowHeader';

describe('FlowHeader', () => {
  it('is the page banner', () => {
    render(<FlowHeader label="Beginner path" />);

    expect(screen.getByRole('banner')).toHaveTextContent('Beginner path');
  });

  it('leaves the brand name out by default', () => {
    render(<FlowHeader label="Beginner path" />);

    expect(screen.queryByText('CareerLine AI')).not.toBeInTheDocument();
  });

  it('shows the brand name when asked', () => {
    render(<FlowHeader label="Beginner path" showBrand />);

    expect(screen.getByText('CareerLine AI')).toBeInTheDocument();
  });
});
