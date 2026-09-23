-- Canonical reconstruction from Task 6A deployed catalog metadata, not row data.
-- Fresh environments only: an existing table must fail, not silently skip drift.
-- Existing deployments require separate migration-ledger reconciliation; see ../README.md.
begin;

create table public.fishing_day_reports (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  trip_date date not null,
  captain_private text null,
  boat_private text null,
  tournament_private text null,
  lines_in time without time zone null,
  lines_out time without time zone null,
  hours_fished numeric null,
  miles_run numeric null,
  areas_fished jsonb null default '[]'::jsonb,
  bait_observed jsonb null default '[]'::jsonb,
  bird_activity jsonb null default '[]'::jsonb,
  water_color text null,
  weed_condition text null,
  floating_structure jsonb null default '[]'::jsonb,
  species_results jsonb null default '{}'::jsonb,
  trip_outcome text null,
  information_source text null,
  notes_private text null,
  share_intelligence boolean null default false,
  created_at timestamptz null default now(),
  updated_at timestamptz null default now(),
  constraint fishing_day_reports_pkey primary key (id),
  constraint fishing_day_reports_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade
);

alter table public.fishing_day_reports enable row level security;

create policy "Captains can create their own reports"
on public.fishing_day_reports for insert to authenticated
with check (auth.uid() = user_id);

create policy "Captains can read their own reports"
on public.fishing_day_reports for select to authenticated
using (auth.uid() = user_id);

create policy "Captains can update their own reports"
on public.fishing_day_reports for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Captains can delete their own reports"
on public.fishing_day_reports for delete to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete
on public.fishing_day_reports to authenticated;

commit;
