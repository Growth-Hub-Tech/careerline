import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SplitAuthLayout } from './AuthLayouts';

const setup = () =>
  render(
    <MemoryRouter>
      <SplitAuthLayout>
        <p>Form</p>
      </SplitAuthLayout>
    </MemoryRouter>,
  );

describe('SplitAuthLayout', () => {
  it('shows the create photo as a jpeg', () => {
    const { container } = setup();

    expect(container.querySelector('aside img')).toHaveAttribute(
      'src',
      expect.stringContaining('create.jpeg'),
    );
  });

  it('stretches the testimonial card across the whole photo', () => {
    setup();

    const wrapper = screen.getByText('Skye Favour').closest('figure')?.parentElement;

    expect(wrapper).toHaveClass('inset-x-0');
    expect(wrapper).not.toHaveClass('inset-x-10');
  });
});
