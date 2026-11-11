begin;

create or replace function public.complete_workout(p_workout_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
    v_user_id uuid;
    v_workout_group text;
    v_completed_at timestamptz;

    v_exercises_count integer := 0;
    v_sets_count integer := 0;
    v_reps_count integer := 0;

    v_duration_minutes integer := 0;
    v_distance_meters integer := 0;

    v_workout_exp integer := 0;
    v_exercises_exp integer := 0;
    v_sets_exp integer := 0;
    v_reps_exp integer := 0;
    v_duration_exp integer := 0;
    v_distance_exp integer := 0;

    v_total_exp integer := 0;
begin
    if auth.uid() is null then
        raise exception 'Not authenticated' using errcode = '42501';
    end if;

    select
        w.user_id,
        wt.workout_group,
        w.completed_at
    into
        v_user_id,
        v_workout_group,
        v_completed_at
    from public.workouts w
    left join public.workout_types wt
        on wt.id = w.workout_type_id
    where w.id = p_workout_id
    for update of w;

    if v_user_id is null then
        raise exception 'Workout not found';
    end if;

    if v_user_id is distinct from auth.uid() then
        raise exception 'Not allowed' using errcode = '42501';
    end if;

    if v_completed_at is not null then
        raise exception 'This workout is completed and can no longer be edited.'
            using errcode = 'MS002';
    end if;

    if v_workout_group = 'RepetitionBased' then
        select count(*)
        into v_exercises_count
        from public.exercises
        where workout_id = p_workout_id;

        select
            count(*),
            coalesce(sum(s.reps), 0)
        into
            v_sets_count,
            v_reps_count
        from public.sets s
        join public.exercises e
            on e.id = s.exercise_id
        where e.workout_id = p_workout_id;

        v_exercises_exp := v_exercises_count * 10;
        v_sets_exp := v_sets_count * 5;
        v_reps_exp := v_reps_count * 1;

        if v_sets_count > 0 then
            v_workout_exp := 50;
        end if;
    else
        select
            coalesce(duration_minutes, 0),
            coalesce(distance_meters, 0)
        into
            v_duration_minutes,
            v_distance_meters
        from public.workout_metrics
        where workout_id = p_workout_id
        limit 1;

        v_duration_minutes := coalesce(v_duration_minutes, 0);
        v_distance_meters := coalesce(v_distance_meters, 0);

        v_duration_exp := v_duration_minutes * 2;
        v_distance_exp := floor(v_distance_meters / 1000.0) * 20;

        if v_duration_minutes > 0 then
            v_workout_exp := 50;
        end if;
    end if;

    v_total_exp :=
        v_workout_exp
        + v_exercises_exp
        + v_sets_exp
        + v_reps_exp
        + v_duration_exp
        + v_distance_exp;

    update public.user_data
    set
        experience = coalesce(experience, 0) + v_total_exp,
        updated_at = now()
    where user_id = v_user_id;

    if not found then
        insert into public.user_data (user_id, experience)
        values (v_user_id, v_total_exp);
    end if;

    update public.workouts
    set completed_at = now()
    where id = p_workout_id;

    return jsonb_build_object(
        'total_exp', v_total_exp,
        'breakdown', jsonb_build_array(
            jsonb_build_object(
                'type', 'workout',
                'label', 'Workout completed',
                'amount', v_workout_exp
            ),
            jsonb_build_object(
                'type', 'exercises',
                'label', 'Exercises',
                'value', v_exercises_count,
                'amount', v_exercises_exp
            ),
            jsonb_build_object(
                'type', 'sets',
                'label', 'Sets',
                'value', v_sets_count,
                'amount', v_sets_exp
            ),
            jsonb_build_object(
                'type', 'reps',
                'label', 'Repetitions',
                'value', v_reps_count,
                'amount', v_reps_exp
            ),
            jsonb_build_object(
                'type', 'duration',
                'label', 'Duration',
                'value', v_duration_minutes,
                'amount', v_duration_exp
            ),
            jsonb_build_object(
                'type', 'distance',
                'label', 'Distance',
                'value', v_distance_meters,
                'amount', v_distance_exp
            )
        )
    );
end;
$function$;

revoke all on function public.complete_workout(uuid) from public, anon;
grant execute on function public.complete_workout(uuid) to authenticated;

drop function if exists public.get_workout_exp_data(uuid);

commit;
