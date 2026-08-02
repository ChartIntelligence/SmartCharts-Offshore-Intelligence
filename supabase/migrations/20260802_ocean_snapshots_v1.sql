create extension if not exists pgcrypto;

create table if not exists public.ocean_snapshots (
  id uuid primary key default gen_random_uuid(),

  snapshot_id text not null,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  fishing_day_report_id uuid null
    references public.fishing_day_reports(id)
    on delete set null,

  observed_at timestamptz not null,

  generated_at timestamptz null,

  latitude double precision not null,

  longitude double precision not null,

  capture_mode text not null
    check (
      capture_mode in (
        'live',
        'historical-backfill',
        'reprocessed',
        'simulation'
      )
    ),

  lifecycle_state text not null
    check (
      lifecycle_state in (
        'live',
        'historical-backfill',
        'reprocessed',
        'archived',
        'deprecated'
      )
    ),

  availability_classification text not null
    check (
      availability_classification in (
        'complete',
        'partial',
        'unavailable'
      )
    ),

  snapshot_schema_version text not null,

  snapshot_contract_version text not null,

  snapshot_payload jsonb not null,

  created_at timestamptz not null
    default now(),

  constraint ocean_snapshots_user_snapshot_unique
    unique (
      user_id,
      snapshot_id
    )
);


create index if not exists
  ocean_snapshots_user_observed_at_idx
on public.ocean_snapshots (
  user_id,
  observed_at desc
);


create index if not exists
  ocean_snapshots_user_location_time_idx
on public.ocean_snapshots (
  user_id,
  latitude,
  longitude,
  observed_at desc
);


create index if not exists
  ocean_snapshots_report_idx
on public.ocean_snapshots (
  fishing_day_report_id
)
where fishing_day_report_id is not null;


create index if not exists
  ocean_snapshots_capture_mode_idx
on public.ocean_snapshots (
  user_id,
  capture_mode,
  observed_at desc
);


alter table public.ocean_snapshots
  enable row level security;


drop policy if exists
  "Captains can read private ocean snapshots"
on public.ocean_snapshots;

create policy
  "Captains can read private ocean snapshots"
on public.ocean_snapshots
for select
to authenticated
using (
  auth.uid() = user_id
);


drop policy if exists
  "Captains can create private ocean snapshots"
on public.ocean_snapshots;

create policy
  "Captains can create private ocean snapshots"
on public.ocean_snapshots
for insert
to authenticated
with check (
  auth.uid() = user_id
);


comment on table public.ocean_snapshots is
  'Private immutable Pelora Ocean Memory snapshots owned by individual authenticated captains.';


comment on column public.ocean_snapshots.snapshot_payload is
  'Canonical immutable Ocean Snapshot Assembly contract. Scientific interpretation must not be recomputed or modified by storage.';


comment on column public.ocean_snapshots.observed_at is
  'Time represented by the ocean observations. For historical backfills this is the original trip observation time.';


comment on column public.ocean_snapshots.generated_at is
  'Time Pelora assembled or reconstructed the snapshot. This may differ from observed_at.';


comment on column public.ocean_snapshots.fishing_day_report_id is
  'Optional private link to the captain fishing-day report associated with this snapshot.';
