alter table public.fishing_day_reports add column if not exists fishing_locations jsonb default '[]'::jsonb;
