create extension if not exists pgcrypto;


create table if not exists public.governed_opportunity_observation (
  id uuid primary key
    default gen_random_uuid(),

  observation_id text not null,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  species text not null,

  candidate_id text not null,

  evaluated_at timestamptz not null,

  observation_schema_version text not null,

  observation_payload jsonb not null,

  created_at timestamptz not null
    default now(),

  constraint governed_opportunity_observation_user_observation_unique
    unique (
      user_id,
      observation_id
    )
);


create index if not exists
  governed_opportunity_observation_user_evaluated_at_idx
on public.governed_opportunity_observation (
  user_id,
  evaluated_at desc
);


create index if not exists
  governed_opportunity_observation_user_species_time_idx
on public.governed_opportunity_observation (
  user_id,
  species,
  evaluated_at desc
);


create index if not exists
  governed_opportunity_observation_user_species_candidate_time_idx
on public.governed_opportunity_observation (
  user_id,
  species,
  candidate_id,
  evaluated_at desc
);


alter table public.governed_opportunity_observation
  enable row level security;


drop policy if exists
  "Captains can read private governed opportunity observations"
on public.governed_opportunity_observation;


create policy
  "Captains can read private governed opportunity observations"
on public.governed_opportunity_observation
for select
to authenticated
using (
  auth.uid() = user_id
);


drop policy if exists
  "Captains can create private governed opportunity observations"
on public.governed_opportunity_observation;


create policy
  "Captains can create private governed opportunity observations"
on public.governed_opportunity_observation
for insert
to authenticated
with check (
  auth.uid() = user_id
);


revoke all
on public.governed_opportunity_observation
from anon;


revoke all
on public.governed_opportunity_observation
from authenticated;


grant select, insert
on public.governed_opportunity_observation
to authenticated;


comment on table public.governed_opportunity_observation is
  'Private immutable Pelora observations of governed candidate/species evaluations for an authenticated captain, including evaluations that did not qualify for ranking.';


comment on column public.governed_opportunity_observation.observation_id is
  'Deterministic governed candidate/species evaluation identity. Retries of the same evaluation resolve to the same captain-owned observation identity.';


comment on column public.governed_opportunity_observation.evaluated_at is
  'Authoritative governed candidate/species evaluation time. This must not be replaced by storage or retrieval time.';


comment on column public.governed_opportunity_observation.observation_payload is
  'Immutable Governed Opportunity Observation payload preserving the original governed candidate/species evaluation. Storage must not recompute evidence, eligibility, score, confidence, persistence, lifecycle state, opportunity status, or rank.';


comment on column public.governed_opportunity_observation.candidate_id is
  'Governed candidate identity preserved for temporal observation lookup. Presence in this table does not establish a captain-facing opportunity.';


comment on column public.governed_opportunity_observation.species is
  'Species associated with the governed candidate evaluation. Presence in this table does not establish species opportunity eligibility.';