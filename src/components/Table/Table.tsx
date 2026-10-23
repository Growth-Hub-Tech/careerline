import type { ReactNode } from 'react';
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from 'react-icons/lu';

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  readonly key: string;
  readonly direction: SortDirection;
}

export interface TableColumn<T> {
  readonly key: string;
  readonly header: string;
  readonly sortable?: boolean;
  readonly align?: 'left' | 'center' | 'right';
  readonly render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  readonly caption: string;
  readonly columns: readonly TableColumn<T>[];
  readonly rows: readonly T[];
  readonly getRowKey: (row: T) => string;
  readonly sort?: TableSort;
  readonly onSortChange?: (sort: TableSort) => void;
  readonly empty?: ReactNode;
  readonly className?: string;
}

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const JUSTIFY = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const;

export const Table = <T extends object>({
  caption,
  columns,
  rows,
  getRowKey,
  sort,
  onSortChange,
  empty,
  className = '',
}: TableProps<T>) => {
  const nextSort = (key: string): TableSort => ({
    key,
    direction: sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc',
  });

  return (
    <div
      className={`w-full overflow-x-auto rounded-lg border border-slate-200 bg-white ${className}`}
    >
      <table className="w-full border-collapse text-[14px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ key, header, sortable, align = 'left' }) => {
              const active = sort?.key === key;
              const ariaSort = active
                ? sort.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined;
              const SortIcon = !active
                ? LuArrowUpDown
                : sort.direction === 'asc'
                  ? LuArrowUp
                  : LuArrowDown;

              return (
                <th
                  key={key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={`px-4 py-3 text-[13px] font-semibold text-slate-700 ${ALIGN[align]}`}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange?.(nextSort(key))}
                      className={`inline-flex w-full cursor-pointer items-center gap-1.5 rounded-md font-semibold transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${JUSTIFY[align]}`}
                    >
                      {header}
                      <SortIcon
                        size={14}
                        aria-hidden="true"
                        className={active ? 'text-indigo-700' : 'text-slate-400'}
                      />
                    </button>
                  ) : (
                    header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-slate-100">
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                {empty ?? 'No results found.'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="border-t border-slate-100 hover:bg-gray-50/60">
                {columns.map(({ key, align = 'left', render }) => (
                  <td key={key} className={`px-4 py-3 text-slate-800 ${ALIGN[align]}`}>
                    {render ? render(row) : String((row as Record<string, unknown>)[key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
