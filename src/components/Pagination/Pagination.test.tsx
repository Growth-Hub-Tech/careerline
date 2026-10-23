import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

const setup = (props: Partial<Parameters<typeof Pagination>[0]> = {}) => {
  const onPageChange = vi.fn();
  const utils = render(
    <Pagination page={1} pageCount={5} onPageChange={onPageChange} {...props} />,
  );
  return { onPageChange, ...utils };
};

const pageButton = (n: number) => screen.queryByRole('button', { name: `Page ${n}` });

describe('Pagination', () => {
  it('is a navigation landmark named Pagination', () => {
    setup();

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('renders nothing when there is one page or none', () => {
    const { container, rerender, onPageChange } = setup({ pageCount: 1 });
    expect(container).toBeEmptyDOMElement();

    rerender(<Pagination page={1} pageCount={0} onPageChange={onPageChange} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows every page when there are few', () => {
    setup({ pageCount: 5 });

    [1, 2, 3, 4, 5].forEach((n) => expect(pageButton(n)).toBeInTheDocument());
    expect(screen.queryByText('…')).not.toBeInTheDocument();
  });

  it('marks the current page', () => {
    setup({ page: 3 });

    expect(pageButton(3)).toHaveAttribute('aria-current', 'page');
    expect(pageButton(2)).not.toHaveAttribute('aria-current');
  });

  it('reports the page that was clicked', async () => {
    const { onPageChange } = setup();

    await userEvent.click(pageButton(4) as HTMLElement);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('does nothing when the current page is clicked', async () => {
    const { onPageChange } = setup({ page: 2 });

    await userEvent.click(pageButton(2) as HTMLElement);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('goes to the next and previous pages', async () => {
    const { onPageChange } = setup({ page: 3 });

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('disables Previous on the first page', () => {
    setup({ page: 1 });

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('disables Next on the last page', () => {
    setup({ page: 5 });

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
  });

  it('collapses the end of a long list when near the start', () => {
    setup({ page: 1, pageCount: 10 });

    [1, 2, 3, 4, 5, 10].forEach((n) => expect(pageButton(n)).toBeInTheDocument());
    [6, 7, 8, 9].forEach((n) => expect(pageButton(n)).not.toBeInTheDocument());
    expect(screen.getAllByText('…')).toHaveLength(1);
  });

  it('collapses both sides of a long list when in the middle', () => {
    setup({ page: 5, pageCount: 10 });

    [1, 4, 5, 6, 10].forEach((n) => expect(pageButton(n)).toBeInTheDocument());
    [2, 3, 7, 8, 9].forEach((n) => expect(pageButton(n)).not.toBeInTheDocument());
    expect(screen.getAllByText('…')).toHaveLength(2);
  });

  it('collapses the start of a long list when near the end', () => {
    setup({ page: 10, pageCount: 10 });

    [1, 6, 7, 8, 9, 10].forEach((n) => expect(pageButton(n)).toBeInTheDocument());
    [2, 3, 4, 5].forEach((n) => expect(pageButton(n)).not.toBeInTheDocument());
    expect(screen.getAllByText('…')).toHaveLength(1);
  });

  it('shows more neighbours with a larger siblingCount', () => {
    setup({ page: 5, pageCount: 10, siblingCount: 2 });

    [1, 3, 4, 5, 6, 7, 10].forEach((n) => expect(pageButton(n)).toBeInTheDocument());
    expect(pageButton(2)).not.toBeInTheDocument();
  });

  it('hides the ellipsis from assistive tech', () => {
    setup({ page: 1, pageCount: 10 });

    expect(screen.getByText('…')).toHaveAttribute('aria-hidden', 'true');
  });
});
