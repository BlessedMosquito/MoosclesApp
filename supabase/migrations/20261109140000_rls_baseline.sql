begin;

alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.sets enable row level security;
alter table public.workout_metrics enable row level security;
alter table public.user_data enable row level security;
alter table public.exercises_list enable row level security;
alter table public.workout_types enable row level security;

do $$
begin
  if to_regclass('public.experience') is not null then
    execute 'alter table public.experience enable row level security';
    execute 'revoke all on public.experience from anon, authenticated';
  end if;
end;
$$;

do $$
declare
  stale record;
begin
  for stale in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'workouts', 'exercises', 'sets', 'workout_metrics',
        'user_data', 'exercises_list', 'workout_types'
      )
      and policyname <> all (array[
      'Authenticated users can read exercises',
      'Authenticated users can view workout types',
      'Users can delete exercises from open workouts',
      'Users can delete metrics for open workouts',
      'Users can delete own open workouts',
      'Users can delete sets from open workouts',
      'Users can insert exercises into open workouts',
      'Users can insert metrics for open workouts',
      'Users can insert own data',
      'Users can insert own workouts',
      'Users can insert sets into open workouts',
      'Users can update exercises in open workouts',
      'Users can update metrics for open workouts',
      'Users can update own data',
      'Users can update own workouts',
      'Users can update sets in open workouts',
      'Users can view own data',
      'Users can view own exercises',
      'Users can view own sets',
      'Users can view own workout metrics',
      'Users can view own workouts'
      ])
  loop
    execute format(
      'drop policy %I on public.%I',
      stale.policyname,
      stale.tablename
    );
  end loop;
end;
$$;

revoke all on public.workouts from anon;
revoke all on public.exercises from anon;
revoke all on public.sets from anon;
revoke all on public.workout_metrics from anon;
revoke all on public.user_data from anon;
revoke all on public.exercises_list from anon;
revoke all on public.workout_types from anon;

revoke insert, update on public.workouts from authenticated;
grant insert (user_id, name, workout_date, workout_type_id)
  on public.workouts to authenticated;
grant update (name, workout_date)
  on public.workouts to authenticated;

drop policy if exists "Users can view own workouts" on public.workouts;
create policy "Users can view own workouts"
  on public.workouts for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own workouts" on public.workouts;
create policy "Users can insert own workouts"
  on public.workouts for insert to authenticated
  with check (user_id = (select auth.uid()) and completed_at is null);

drop policy if exists "Users can update own workouts" on public.workouts;
create policy "Users can update own workouts"
  on public.workouts for update to authenticated
  using (user_id = (select auth.uid()) and completed_at is null)
  with check (user_id = (select auth.uid()) and completed_at is null);

drop policy if exists "Users can delete own open workouts" on public.workouts;
create policy "Users can delete own open workouts"
  on public.workouts for delete to authenticated
  using (user_id = (select auth.uid()) and completed_at is null);

drop policy if exists "Users can view own exercises" on public.exercises;
create policy "Users can view own exercises"
  on public.exercises for select to authenticated
  using (
    exists (
      select 1
      from public.workouts w
      where w.id = exercises.workout_id
        and w.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can view own sets" on public.sets;
create policy "Users can view own sets"
  on public.sets for select to authenticated
  using (
    exists (
      select 1
      from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = sets.exercise_id
        and w.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can view own workout metrics" on public.workout_metrics;
create policy "Users can view own workout metrics"
  on public.workout_metrics for select to authenticated
  using (
    exists (
      select 1
      from public.workouts w
      where w.id = workout_metrics.workout_id
        and w.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can view own data" on public.user_data;
create policy "Users can view own data"
  on public.user_data for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own data" on public.user_data;
create policy "Users can insert own data"
  on public.user_data for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own data" on public.user_data;
create policy "Users can update own data"
  on public.user_data for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Authenticated users can read exercises" on public.exercises_list;
create policy "Authenticated users can read exercises"
  on public.exercises_list for select to authenticated
  using (true);

drop policy if exists "Authenticated users can view workout types" on public.workout_types;
create policy "Authenticated users can view workout types"
  on public.workout_types for select to authenticated
  using (true);

revoke insert, update, delete on public.exercises_list from authenticated;
revoke insert, update, delete on public.workout_types from authenticated;

commit;
