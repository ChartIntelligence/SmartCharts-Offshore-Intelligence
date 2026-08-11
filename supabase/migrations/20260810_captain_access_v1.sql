create table if not exists public.captain_access (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text null,

  boat_name text null,

  access_role text not null
    default 'founding_captain'
    check (
      access_role in (
        'founder',
        'founding_captain'
      )
    ),

  access_status text not null
    default 'pending'
    check (
      access_status in (
        'approved',
        'pending',
        'revoked'
      )
    ),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now()
);


alter table public.captain_access
enable row level security;


drop policy if exists
  "captains can read own access"
on public.captain_access;


create policy
  "captains can read own access"
on public.captain_access
for select
to authenticated
using (
  auth.uid() = user_id
);


revoke all
on public.captain_access
from anon;


revoke all
on public.captain_access
from authenticated;


grant select
on public.captain_access
to authenticated;