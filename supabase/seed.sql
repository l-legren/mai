-- LEG-49: local/dev seed. Applied on `supabase db reset`. NOT run against production.
-- Mirrors the current first-launch seed in src/data/seed.ts for a fixed test user.

create extension if not exists pgcrypto;

do $$
declare
  test_user_id uuid := '11111111-1111-1111-1111-111111111111';
  test_email text := 'dev@mai.app';
begin

-- Test user: dev@mai.app / password123 (local Supabase auth only).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, recovery_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  test_user_id,
  'authenticated',
  'authenticated',
  test_email,
  crypt('password123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(), now(),
  '', '', '', ''
);

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) values (
  test_user_id,
  test_user_id,
  format('{"sub":"%s","email":"%s"}', test_user_id, test_email)::jsonb,
  'email',
  test_user_id,
  now(), now(), now()
);

-- handle_new_user() already created the profiles row (LEG-48); set the seeded savings goal.
update public.profiles
set savings_goal = 350
where id = test_user_id;

-- Recurring: income + fixed costs (all perpetual/monthly, matching src/data/seed.ts).
insert into public.recurring (user_id, type, name, amount, cadence, term_kind) values
  (test_user_id, 'income', 'Salary', 2400, 'monthly', 'perpetual'),
  (test_user_id, 'income', 'Freelance', 350, 'monthly', 'perpetual'),
  (test_user_id, 'expense', 'Rent', 950, 'monthly', 'perpetual'),
  (test_user_id, 'expense', 'Health insurance', 120, 'monthly', 'perpetual'),
  (test_user_id, 'expense', 'Transit pass', 59, 'monthly', 'perpetual'),
  (test_user_id, 'expense', 'Gym', 30, 'monthly', 'perpetual'),
  (test_user_id, 'expense', 'Phone', 29, 'monthly', 'perpetual'),
  (test_user_id, 'expense', 'Spotify', 11, 'monthly', 'perpetual');

-- Expenses: a handful spread across recent days/weeks so Insights has real data to chart.
-- Stored negative, matching add-expense.ts's convention (a positive amount is a credit/income
-- row, e.g. a bank-imported deposit) — lib/insights.ts's spend aggregation depends on this sign.
insert into public.expenses (user_id, category, amount, spent_on, spent_at) values
  (test_user_id, 'groceries', -42.50, current_date, now()),
  (test_user_id, 'transport', -12.00, current_date, now()),
  (test_user_id, 'restaurants', -28.90, current_date - 1, now() - interval '1 day'),
  (test_user_id, 'drinks', -8.50, current_date - 2, now() - interval '2 days'),
  (test_user_id, 'groceries', -35.20, current_date - 3, now() - interval '3 days'),
  (test_user_id, 'clothing', -64.00, current_date - 5, now() - interval '5 days'),
  (test_user_id, 'other', -15.00, current_date - 6, now() - interval '6 days'),
  (test_user_id, 'groceries', -39.80, current_date - 8, now() - interval '8 days'),
  (test_user_id, 'restaurants', -22.30, current_date - 9, now() - interval '9 days'),
  (test_user_id, 'transport', -12.00, current_date - 12, now() - interval '12 days'),
  (test_user_id, 'groceries', -47.10, current_date - 15, now() - interval '15 days'),
  (test_user_id, 'drinks', -6.00, current_date - 20, now() - interval '20 days'),
  (test_user_id, 'other', -18.75, current_date - 25, now() - interval '25 days');

-- Category budgets for the current month (LEG-146) — mixed over/under so Budget vs actual has
-- something to show: groceries/drinks/other come in under, transport/restaurants/clothing over.
insert into public.category_budgets (user_id, category, period_month, amount) values
  (test_user_id, 'groceries', to_char(current_date, 'YYYY-MM'), 200),
  (test_user_id, 'drinks', to_char(current_date, 'YYYY-MM'), 20),
  (test_user_id, 'restaurants', to_char(current_date, 'YYYY-MM'), 40),
  (test_user_id, 'clothing', to_char(current_date, 'YYYY-MM'), 50),
  (test_user_id, 'transport', to_char(current_date, 'YYYY-MM'), 20),
  (test_user_id, 'other', to_char(current_date, 'YYYY-MM'), 40);

end $$;
