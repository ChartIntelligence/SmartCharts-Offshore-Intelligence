begin;

revoke all privileges on table
  public.fishing_day_reports,
  public.ocean_snapshots,
  public.captain_access,
  public.early_access_signups,
  public.governed_opportunity_history,
  public.governed_opportunity_observation
from anon, authenticated
restrict;

grant select, insert, update, delete
on table public.fishing_day_reports
to authenticated;

grant select, insert
on table
  public.ocean_snapshots,
  public.governed_opportunity_history,
  public.governed_opportunity_observation
to authenticated;

grant select
on table public.captain_access
to authenticated;

commit;
