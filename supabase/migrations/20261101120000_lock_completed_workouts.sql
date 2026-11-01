begin;

create or replace function public.can_edit_workout(p_workout_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.workouts w
    where w.id = p_workout_id
      and w.user_id = (select auth.uid())
      and w.completed_at is null
  );
$$;

create or replace function public.can_edit_exercise(p_exercise_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.exercises e
    join public.workouts w on w.id = e.workout_id
    where e.id = p_exercise_id
      and w.user_id = (select auth.uid())
      and w.completed_at is null
  );
$$;

revoke all on function public.can_edit_workout(uuid) from public, anon;
revoke all on function public.can_edit_exercise(uuid) from public, anon;
grant execute on function public.can_edit_workout(uuid) to authenticated;
grant execute on function public.can_edit_exercise(uuid) to authenticated;

drop policy if exists "Users can insert own exercises" on public.exercises;
drop policy if exists "Users can update own exercises" on public.exercises;
drop policy if exists "Users can delete own exercises" on public.exercises;

create policy "Users can insert exercises into open workouts"
  on public.exercises for insert to authenticated
  with check (public.can_edit_workout(workout_id));

create policy "Users can update exercises in open workouts"
  on public.exercises for update to authenticated
  using (public.can_edit_workout(workout_id))
  with check (public.can_edit_workout(workout_id));

create policy "Users can delete exercises from open workouts"
  on public.exercises for delete to authenticated
  using (public.can_edit_workout(workout_id));

drop policy if exists "Users can insert own sets" on public.sets;
drop policy if exists "Users can update own sets" on public.sets;
drop policy if exists "Users can delete own sets" on public.sets;

create policy "Users can insert sets into open workouts"
  on public.sets for insert to authenticated
  with check (public.can_edit_exercise(exercise_id));

create policy "Users can update sets in open workouts"
  on public.sets for update to authenticated
  using (public.can_edit_exercise(exercise_id))
  with check (public.can_edit_exercise(exercise_id));

create policy "Users can delete sets from open workouts"
  on public.sets for delete to authenticated
  using (public.can_edit_exercise(exercise_id));

drop policy if exists "Users can insert own workout metrics" on public.workout_metrics;
drop policy if exists "Users can update own workout metrics" on public.workout_metrics;
drop policy if exists "Users can delete own workout metrics" on public.workout_metrics;

create policy "Users can insert metrics for open workouts"
  on public.workout_metrics for insert to authenticated
  with check (
    public.can_edit_workout(workout_id)
    and user_id = (select auth.uid())
  );

create policy "Users can update metrics for open workouts"
  on public.workout_metrics for update to authenticated
  using (public.can_edit_workout(workout_id))
  with check (
    public.can_edit_workout(workout_id)
    and user_id = (select auth.uid())
  );

create policy "Users can delete metrics for open workouts"
  on public.workout_metrics for delete to authenticated
  using (public.can_edit_workout(workout_id));

drop policy if exists "Users can delete own workouts" on public.workouts;

create policy "Users can delete own open workouts"
  on public.workouts for delete to authenticated
  using (user_id = (select auth.uid()) and completed_at is null);

commit;
