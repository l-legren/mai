-- LEG-52: lets an authenticated user delete their own auth.users row, which the client can't do
-- directly (requires the service role). profiles/expenses/recurring all cascade off auth.users.id
-- (LEG-48), so no extra cleanup is needed here.

create function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
