begin;

alter table public.user_data
  add column if not exists daily_water_goal_ml integer not null default 2000;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_data_daily_water_goal_ml_check'
  ) then
    alter table public.user_data
      add constraint user_data_daily_water_goal_ml_check
      check (daily_water_goal_ml between 250 and 10000);
  end if;
end;
$$;

commit;
