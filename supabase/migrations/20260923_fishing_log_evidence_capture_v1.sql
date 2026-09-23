-- Source-only capture envelope; NULL means no versioned evidence was captured.
-- No default, backfill, interpretation, or change to existing report access.
alter table public.fishing_day_reports add column evidence_capture jsonb null;
