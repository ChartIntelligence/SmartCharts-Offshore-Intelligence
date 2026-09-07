create extension if not exists pgcrypto;


create table if not exists public.governed_opportunity_history (
  id uuid primary key
    default gen_random_uuid(),

  history_id text not null,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  species text not null,

  opportunity_id text not null,

  evaluated_at timestamptz not null,

  history_schema_version text not null,

  history_payload jsonb not null,

  created_at timestamptz not null
    default now(),

  constraint governed_opportunity_history_user_history_unique
    unique (
      user_id,
      history_id
    )
);


create index if not exists
  governed_opportunity_history_user_evaluated_at_idx
on public.governed_opportunity_history (
  user_id,
  evaluated_at desc
);


create index if not exists
  governed_opportunity_history_user_species_time_idx
on public.governed_opportunity_history (
  user_id,
  species,
  evaluated_at desc
);


create index if not exists
  governed_opportunity_history_user_species_opportunity_time_idx
on public.governed_opportunity_history (
  user_id,
  species,
  opportunity_id,
  evaluated_at desc
);


alter table public.governed_opportunity_history
  enable row level security;


drop policy if exists
  "Captains can read private governed opportunity history"
on public.governed_opportunity_history;


create policy
  "Captains can read private governed opportunity history"
on public.governed_opportunity_history
for select
to authenticated
using (
  auth.uid() = user_id
);


drop policy if exists
  "Captains can create private governed opportunity history"
on public.governed_opportunity_history;


create policy
  "Captains can create private governed opportunity history"
on public.governed_opportunity_history
for insert
to authenticated
with check (
  auth.uid() = user_id
);


revoke all
on public.governed_opportunity_history
from anon;


revoke all
on public.governed_opportunity_history
from authenticated;


grant select, insert
on public.governed_opportunity_history
to authenticated;


comment on table public.governed_opportunity_history is
  'Private immutable Pelora history of opportunities that actually passed governed ranking and presentation for an authenticated captain.';


comment on column public.governed_opportunity_history.history_id is
  'Deterministic governed opportunity history identity. Retries of the same governed evaluation resolve to the same captain-owned history identity.';


comment on column public.governed_opportunity_history.evaluated_at is
  'Original governed opportunity evaluation time. This must not be replaced by storage or retrieval time.';


comment on column public.governed_opportunity_history.history_payload is
  'Immutable Governed Opportunity History record preserving the original governed decision. Storage must not recompute eligibility, score, confidence, rank, evidence, or scientific interpretation.';


comment on column public.governed_opportunity_history.opportunity_id is
  'Original governed opportunity identity preserved for historical lookup. Presence in this table does not establish a current opportunity.';


comment on column public.governed_opportunity_history.species is
  'Species associated with the original governed opportunity decision. Historical species context must not be interpreted as current eligibility.';