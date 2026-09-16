// shadcn/ui pagination (new-york style) — customized: PaginationLink/Previous/Next render
// next/link's Link (not a bare <a>) for client-side navigation, and are composed with this app's
// own Button variants (buttonVariants from ./Button, not lucide-react icons/upstream's own
// outline-vs-ghost styling) — the active page uses the solid --mq-accent variant per
// design-system's one-filled-accent rule. shadcn's Pagination is otherwise unopinionated about
// the actual page list, so the default-exported Pagination below (this app's own addition, not
// upstream) adds getPaginationRange to truncate a large totalPages — e.g. a multi-thousand-row
// CSV import — into first/last + siblings + an ellipsis instead of one link per page.
import { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from './Button';

function hrefForPage(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export type PaginationNavProps = ComponentProps<'nav'>;

const PaginationNav = ({ className, ...props }: PaginationNavProps) => (
  <nav className={cn('flex items-center justify-center gap-1.5', className)} {...props} />
);

export type PaginationLinkProps = {
  page: number;
  basePath: string;
  isActive?: boolean;
} & Omit<ComponentProps<typeof Link>, 'href'>;

const PaginationLink = ({ page, basePath, isActive, className, ...props }: PaginationLinkProps) => (
  <Link
    href={hrefForPage(basePath, page)}
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({ variant: isActive ? 'solid' : 'ghost' }),
      'h-8 w-8 rounded-full p-0 text-[13px]',
      className
    )}
    {...props}
  />
);

export type PaginationEdgeLinkProps = {
  page: number;
  basePath: string;
  disabled: boolean;
  children: ReactNode;
};

const PaginationEdgeLink = ({ page, basePath, disabled, children }: PaginationEdgeLinkProps) => (
  <Link
    href={hrefForPage(basePath, page)}
    aria-disabled={disabled}
    tabIndex={disabled ? -1 : undefined}
    className={cn(
      buttonVariants({ variant: 'ghost' }),
      'h-8 rounded-full px-3 text-[13px]',
      disabled && 'pointer-events-none opacity-40'
    )}
  >
    {children}
  </Link>
);

const PaginationPrevious = (props: PaginationEdgeLinkProps) => <PaginationEdgeLink {...props} />;
const PaginationNext = (props: PaginationEdgeLinkProps) => <PaginationEdgeLink {...props} />;

const PaginationEllipsis = () => (
  <span
    aria-hidden="true"
    className="flex h-8 w-8 items-center justify-center text-[13px] text-text-2"
  >
    …
  </span>
);

type PaginationPageItem = number | 'ellipsis';

const SIBLING_COUNT = 1;
const MAX_PAGES_SHOWN_WITHOUT_TRUNCATION = SIBLING_COUNT * 2 + 5;

// Always shows the first and last page, plus up to SIBLING_COUNT pages either side of
// currentPage, collapsing any gap into a single 'ellipsis' marker rather than one link per page.
export function getPaginationRange(currentPage: number, totalPages: number): PaginationPageItem[] {
  if (totalPages <= MAX_PAGES_SHOWN_WITHOUT_TRUNCATION) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - SIBLING_COUNT, 1);
  const rightSibling = Math.min(currentPage + SIBLING_COUNT, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const items: PaginationPageItem[] = [1];

  if (showLeftEllipsis) {
    items.push('ellipsis');
  } else {
    for (let page = 2; page < leftSibling; page++) items.push(page);
  }

  for (
    let page = Math.max(leftSibling, 2);
    page <= Math.min(rightSibling, totalPages - 1);
    page++
  ) {
    items.push(page);
  }

  if (showRightEllipsis) {
    items.push('ellipsis');
  } else {
    for (let page = rightSibling + 1; page < totalPages; page++) items.push(page);
  }

  items.push(totalPages);

  return items;
}

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Path pages link back to, e.g. '/transactions' — page 1 gets no query string. */
  basePath: string;
  navLabel: string;
  previousLabel: string;
  nextLabel: string;
};

const Pagination = ({
  currentPage,
  totalPages,
  basePath,
  navLabel,
  previousLabel,
  nextLabel,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <PaginationNav aria-label={navLabel}>
      <PaginationPrevious page={currentPage - 1} basePath={basePath} disabled={isFirstPage}>
        {previousLabel}
      </PaginationPrevious>

      {getPaginationRange(currentPage, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <PaginationEllipsis key={`ellipsis-${index}`} />
        ) : (
          <PaginationLink
            key={item}
            page={item}
            basePath={basePath}
            isActive={item === currentPage}
          >
            {item}
          </PaginationLink>
        )
      )}

      <PaginationNext page={currentPage + 1} basePath={basePath} disabled={isLastPage}>
        {nextLabel}
      </PaginationNext>
    </PaginationNav>
  );
};

export default Pagination;
export { PaginationNav, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis };
