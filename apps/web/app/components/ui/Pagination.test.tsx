// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Pagination, { getPaginationRange } from './Pagination';

afterEach(cleanup);

const labels = { navLabel: 'Transactions', previousLabel: 'Previous', nextLabel: 'Next' };

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} basePath="/transactions" {...labels} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders a link per page and marks the current one', () => {
    render(<Pagination currentPage={2} totalPages={3} basePath="/transactions" {...labels} />);

    expect(screen.getByRole('link', { name: '1' }).getAttribute('href')).toBe('/transactions');
    expect(screen.getByRole('link', { name: '2' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: '3' }).getAttribute('href')).toBe(
      '/transactions?page=3'
    );
  });

  it('disables Previous on the first page', () => {
    render(<Pagination currentPage={1} totalPages={3} basePath="/transactions" {...labels} />);

    expect(screen.getByRole('link', { name: 'Previous' }).getAttribute('aria-disabled')).toBe(
      'true'
    );
    expect(screen.getByRole('link', { name: 'Next' }).getAttribute('aria-disabled')).toBe('false');
  });

  it('disables Next on the last page', () => {
    render(<Pagination currentPage={3} totalPages={3} basePath="/transactions" {...labels} />);

    expect(screen.getByRole('link', { name: 'Next' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('link', { name: 'Previous' }).getAttribute('aria-disabled')).toBe(
      'false'
    );
  });

  it('truncates a large page count instead of rendering a link per page', () => {
    render(<Pagination currentPage={1} totalPages={233} basePath="/transactions" {...labels} />);

    // Previous/Next + a handful of numbered links/ellipses — nowhere near 233 links.
    expect(screen.getAllByRole('link').length).toBeLessThan(10);
    expect(screen.queryByRole('link', { name: '150' })).toBeNull();
    expect(screen.getByRole('link', { name: '233' })).toBeTruthy();
  });
});

describe('getPaginationRange', () => {
  it('returns every page when the total fits without truncation', () => {
    expect(getPaginationRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('shows the tail as first, second and last plus an ellipsis near the start', () => {
    expect(getPaginationRange(1, 233)).toEqual([1, 2, 'ellipsis', 233]);
  });

  it('surrounds the current page with siblings and an ellipsis on both sides in the middle', () => {
    expect(getPaginationRange(117, 233)).toEqual([1, 'ellipsis', 116, 117, 118, 'ellipsis', 233]);
  });

  it('shows the tail as first plus the last two pages with an ellipsis near the end', () => {
    expect(getPaginationRange(233, 233)).toEqual([1, 'ellipsis', 232, 233]);
  });
});
