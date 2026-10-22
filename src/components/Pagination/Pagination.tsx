import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

type PageItem = number | 'left-ellipsis' | 'right-ellipsis';

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const getPageItems = (page: number, pageCount: number, siblingCount: number): PageItem[] => {
  const totalNumbers = siblingCount * 2 + 5;
  if (pageCount <= totalNumbers) return range(1, pageCount);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;
  const edgeCount = 3 + 2 * siblingCount;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, edgeCount), 'right-ellipsis', pageCount];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'left-ellipsis', ...range(pageCount - edgeCount + 1, pageCount)];
  }
  return [1, 'left-ellipsis', ...range(left, right), 'right-ellipsis', pageCount];
};

const CONTROL =
  'inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40';

interface PaginationProps {
  readonly page: number;
  readonly pageCount: number;
  readonly onPageChange: (page: number) => void;
  readonly siblingCount?: number;
  readonly className?: string;
}

export const Pagination = ({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className = '',
}: PaginationProps) => {
  if (pageCount <= 1) return null;

  const items = getPageItems(page, pageCount, siblingCount);

  return (
    <nav aria-label="Pagination" className={className}>
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={`${CONTROL} border border-slate-200 text-slate-700 hover:bg-gray-50`}
          >
            <LuChevronLeft size={18} aria-hidden="true" />
          </button>
        </li>

        {items.map((item) =>
          typeof item === 'string' ? (
            <li key={item} aria-hidden="true" className="px-1 text-slate-500">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => item !== page && onPageChange(item)}
                className={`${CONTROL} ${
                  item === page ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className={`${CONTROL} border border-slate-200 text-slate-700 hover:bg-gray-50`}
          >
            <LuChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
