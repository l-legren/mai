// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Pagination from './Pagination';

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
});
