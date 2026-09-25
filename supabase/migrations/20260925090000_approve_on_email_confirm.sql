-- Reverses LEG-139's manual-dashboard-approval intent: access is gated by email confirmation
-- alone now, not an admin flipping `approved` by hand. profiles.approved / RLS
-- (is_current_user_approved()) stay in place, but every new profile is approved on creation —
-- Supabase itself already refuses to issue a session to an unconfirmed user (with email
-- confirmations required), so there's no session, and therefore no way to reach anything this
-- gate protects, until the confirmation link is clicked. A second manual gate on top was redundant.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, approved)
  values (new.id, new.email, true);
  return new;
end;
$$;

-- Unblock anyone stuck behind the old manual gate before this migration shipped.
update public.profiles set approved = true where approved = false;
