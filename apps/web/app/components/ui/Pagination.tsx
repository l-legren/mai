import Link from 'next/link';
import { cn } from '@/lib/utils';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Path pages link back to, e.g. '/transactions' — page 1 gets no query string. */
  basePath: string;
  navLabel: string;
  previousLabel: string;
  nextLabel: string;
};

function hrefForPage(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

const Pagination = ({
  currentPage,
  totalPages,
  basePath,
  navLabel,
  previousLabel,
  nextLabel,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav aria-label={navLabel} className="flex items-center justify-center gap-1.5">
      <Link
        href={hrefForPage(basePath, currentPage - 1)}
        aria-disabled={isFirstPage}
        tabIndex={isFirstPage ? -1 : undefined}
        className={cn(
          'rounded-full px-3 py-1.5 text-[13px] font-medium text-text-2 hover:text-text',
          isFirstPage && 'pointer-events-none opacity-40'
        )}
      >
        {previousLabel}
      </Link>

      {pages.map((page) => (
        <Link
          key={page}
          href={hrefForPage(basePath, page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium',
            page === currentPage ? 'bg-accent text-accent-ink' : 'text-text-2 hover:text-text'
          )}
        >
          {page}
        </Link>
      ))}

      <Link
        href={hrefForPage(basePath, currentPage + 1)}
        aria-disabled={isLastPage}
        tabIndex={isLastPage ? -1 : undefined}
        className={cn(
          'rounded-full px-3 py-1.5 text-[13px] font-medium text-text-2 hover:text-text',
          isLastPage && 'pointer-events-none opacity-40'
        )}
      >
        {nextLabel}
      </Link>
    </nav>
  );
};

export default Pagination;
