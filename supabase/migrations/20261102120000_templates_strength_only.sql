begin;

create or replace function public.enforce_strength_template()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.workout_types wt
    where wt.id = new.workout_type_id
      and wt.workout_group = 'RepetitionBased'
  ) then
    raise exception 'Templates are available for strength workouts only.'
      using errcode = 'MS001';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_strength_template_exercise()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.workout_templates t
    join public.workout_types wt on wt.id = t.workout_type_id
    where t.id = new.template_id
      and wt.workout_group = 'RepetitionBased'
  ) then
    raise exception 'Templates are available for strength workouts only.'
      using errcode = 'MS001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_strength_template() from public;
revoke all on function public.enforce_strength_template_exercise() from public;

drop trigger if exists workout_templates_strength_only
  on public.workout_templates;
create trigger workout_templates_strength_only
  before insert or update of workout_type_id on public.workout_templates
  for each row execute function public.enforce_strength_template();

drop trigger if exists workout_template_exercises_strength_only
  on public.workout_template_exercises;
create trigger workout_template_exercises_strength_only
  before insert or update of template_id on public.workout_template_exercises
  for each row execute function public.enforce_strength_template_exercise();

commit;
