-- Insights previously fetched every raw expense row in a period (paginated in 1000-row chunks to
-- work around PostgREST's max_rows cap) just to sum them into ~12 monthly totals and a handful of
-- category totals in Node. This RPC does the sum in Postgres instead — the response is at most
-- (months × categories) rows regardless of how many expenses a user has, so bandwidth per request
-- stays flat as history grows instead of scaling with row count. No month column exists on
-- `expenses` (`spent_on` is a plain date) — date_trunc('month', spent_on) buckets it at query time.
create function public.get_expense_monthly_category_totals(from_date date, to_date date)
returns table (month text, category text, amount numeric)
language sql
stable
as $$
  select
    to_char(date_trunc('month', spent_on), 'YYYY-MM') as month,
    category,
    sum(-amount) as amount
  from public.expenses
  where user_id = (select auth.uid())
    and (from_date is null or spent_on >= from_date)
    and spent_on <= to_date
    and amount < 0 -- positive amounts are income/credits, not spend (same rule as the old JS aggregation)
  group by date_trunc('month', spent_on), category
  order by month;
$$;

revoke execute on function public.get_expense_monthly_category_totals(date, date) from public;
grant execute on function public.get_expense_monthly_category_totals(date, date) to authenticated;
