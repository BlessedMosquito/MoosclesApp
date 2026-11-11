begin;

create or replace function public.prevent_completed_workout_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.completed_at is not null then
    raise exception 'This workout is completed and can no longer be edited.'
      using errcode = 'MS002';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_completed_workout_changes() from public;

drop trigger if exists workouts_lock_completed on public.workouts;
create trigger workouts_lock_completed
  before update on public.workouts
  for each row execute function public.prevent_completed_workout_changes();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sets_reps_range_check'
  ) then
    alter table public.sets
      add constraint sets_reps_range_check
      check (reps between 1 and 999) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'sets_weight_range_check'
  ) then
    alter table public.sets
      add constraint sets_weight_range_check
      check (weight is null or weight between 0 and 999) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'workout_metrics_duration_range_check'
  ) then
    alter table public.workout_metrics
      add constraint workout_metrics_duration_range_check
      check (duration_minutes is null or duration_minutes between 0 and 1440) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'workout_metrics_distance_range_check'
  ) then
    alter table public.workout_metrics
      add constraint workout_metrics_distance_range_check
      check (distance_meters is null or distance_meters between 0 and 1000000) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'workout_metrics_well_being_range_check'
  ) then
    alter table public.workout_metrics
      add constraint workout_metrics_well_being_range_check
      check (well_being is null or well_being between 1 and 10) not valid;
  end if;
end;
$$;

create or replace function public.limit_sets_per_exercise()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (
    select count(*) from public.sets s where s.exercise_id = new.exercise_id
  ) >= 50 then
    raise exception 'An exercise can have at most 50 sets.'
      using errcode = 'MS003';
  end if;

  return new;
end;
$$;

create or replace function public.limit_exercises_per_workout()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (
    select count(*) from public.exercises e where e.workout_id = new.workout_id
  ) >= 50 then
    raise exception 'A workout can have at most 50 exercises.'
      using errcode = 'MS003';
  end if;

  return new;
end;
$$;

revoke all on function public.limit_sets_per_exercise() from public;
revoke all on function public.limit_exercises_per_workout() from public;

drop trigger if exists sets_limit_per_exercise on public.sets;
create trigger sets_limit_per_exercise
  before insert on public.sets
  for each row execute function public.limit_sets_per_exercise();

drop trigger if exists exercises_limit_per_workout on public.exercises;
create trigger exercises_limit_per_workout
  before insert on public.exercises
  for each row execute function public.limit_exercises_per_workout();

revoke insert, update on public.user_data from anon, authenticated;

grant insert (
  user_id,
  weekly_distance_goal_meters,
  weekly_duration_goal_minutes,
  daily_water_goal_ml,
  birth_year,
  weight_kg
) on public.user_data to authenticated;

grant update (
  user_id,
  weekly_distance_goal_meters,
  weekly_duration_goal_minutes,
  daily_water_goal_ml,
  birth_year,
  weight_kg,
  updated_at
) on public.user_data to authenticated;

commit;
