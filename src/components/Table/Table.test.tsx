import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, type TableColumn } from './Table';

interface Row {
  id: string;
  name: string;
  role: string;
  score: number;
}

const ROWS: Row[] = [
  { id: '1', name: 'Ada Obi', role: 'Frontend Engineer', score: 82 },
  { id: '2', name: 'Tunde Bello', role: 'Product Designer', score: 74 },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
  { key: 'score', header: 'Score', sortable: true, align: 'right' },
];

const setup = (props: Partial<Parameters<typeof Table<Row>>[0]> = {}) =>
  render(
    <Table
      caption="Team results"
      columns={COLUMNS}
      rows={ROWS}
      getRowKey={(r) => r.id}
      {...props}
    />,
  );

describe('Table', () => {
  it('is named by its caption', () => {
    setup();

    expect(screen.getByRole('table', { name: 'Team results' })).toBeInTheDocument();
  });

  it('renders a column header per column', () => {
    setup();

    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
  });

  it('renders a row per item with its cell values', () => {
    setup();

    expect(screen.getAllByRole('row')).toHaveLength(3);
    const row = screen.getByRole('row', { name: /Ada Obi/ });
    expect(within(row).getByRole('cell', { name: 'Frontend Engineer' })).toBeInTheDocument();
    expect(within(row).getByRole('cell', { name: '82' })).toBeInTheDocument();
  });

  it('uses a custom cell renderer when given', () => {
    setup({
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'score', header: 'Score', render: (row) => <strong>{row.score}%</strong> },
      ],
    });

    expect(screen.getByText('82%').tagName).toBe('STRONG');
  });

  it('makes only sortable headers buttons', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Score' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Role' })).not.toBeInTheDocument();
  });

  it('marks the active sort column with aria-sort', () => {
    setup({ sort: { key: 'name', direction: 'asc' } });

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(screen.getByRole('columnheader', { name: 'Score' })).not.toHaveAttribute('aria-sort');
  });

  it('reports descending order', () => {
    setup({ sort: { key: 'score', direction: 'desc' } });

    expect(screen.getByRole('columnheader', { name: 'Score' })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
  });

  it('asks for ascending order when a new column is clicked', async () => {
    const onSortChange = vi.fn();
    setup({ sort: { key: 'name', direction: 'asc' }, onSortChange });

    await userEvent.click(screen.getByRole('button', { name: 'Score' }));

    expect(onSortChange).toHaveBeenCalledWith({ key: 'score', direction: 'asc' });
  });

  it('flips to descending when the ascending column is clicked again', async () => {
    const onSortChange = vi.fn();
    setup({ sort: { key: 'name', direction: 'asc' }, onSortChange });

    await userEvent.click(screen.getByRole('button', { name: 'Name' }));

    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
  });

  it('flips back to ascending when the descending column is clicked again', async () => {
    const onSortChange = vi.fn();
    setup({ sort: { key: 'name', direction: 'desc' }, onSortChange });

    await userEvent.click(screen.getByRole('button', { name: 'Name' }));

    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });

  it('shows a default message when there are no rows', () => {
    setup({ rows: [] });

    expect(screen.getByText('No results found.')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('shows a custom empty state when there are no rows', () => {
    setup({ rows: [], empty: <p>No staff tested yet.</p> });

    expect(screen.getByText('No staff tested yet.')).toBeInTheDocument();
    expect(screen.queryByText('No results found.')).not.toBeInTheDocument();
  });
});
