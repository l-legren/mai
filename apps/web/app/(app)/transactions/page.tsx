import { getPaginatedExpenses } from '@/lib/dal/expenses';
import { toTransaction } from '@/lib/format-expense';
import TransactionsView from './TransactionsView';

const PAGE_SIZE = 20;

type TransactionsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

const TransactionsPage = async ({ searchParams }: TransactionsPageProps) => {
  const { page: pageParam } = await searchParams;
  const requestedPage = Number(pageParam);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const { rows, total } = await getPaginatedExpenses(page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <TransactionsView
      transactions={rows.map(toTransaction)}
      currentPage={page}
      totalPages={totalPages}
    />
  );
};

export default TransactionsPage;
