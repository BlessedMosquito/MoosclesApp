begin;

do $$
declare
  workout_type_id_type text;
  exercise_list_id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
  into workout_type_id_type
  from pg_attribute a
  where a.attrelid = 'public.workout_types'::regclass
    and a.attname = 'id';

  select format_type(a.atttypid, a.atttypmod)
  into exercise_list_id_type
  from pg_attribute a
  where a.attrelid = 'public.exercises_list'::regclass
    and a.attname = 'id';

  execute format(
    'create table if not exists public.workout_templates (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
      name text not null check (char_length(btrim(name)) between 1 and 100),
      workout_type_id %s not null references public.workout_types (id),
      created_at timestamptz not null default now()
    )',
    workout_type_id_type
  );

  execute format(
    'create table if not exists public.workout_template_exercises (
      id uuid primary key default gen_random_uuid(),
      template_id uuid not null references public.workout_templates (id) on delete cascade,
      name text not null check (char_length(btrim(name)) between 1 and 200),
      exercise_list_id %s references public.exercises_list (id) on delete set null,
      exercise_order integer not null default 1,
      created_at timestamptz not null default now()
    )',
    exercise_list_id_type
  );
end;
$$;

create index if not exists workout_templates_user_idx
  on public.workout_templates (user_id);

create index if not exists workout_template_exercises_template_idx
  on public.workout_template_exercises (template_id, exercise_order);

alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;

revoke all on public.workout_templates from anon;
revoke all on public.workout_template_exercises from anon;
grant select, insert, update, delete on public.workout_templates to authenticated;
grant select, insert, update, delete on public.workout_template_exercises to authenticated;

create or replace function public.owns_workout_template(p_template_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workout_templates t
    where t.id = p_template_id
      and t.user_id = (select auth.uid())
  );
$$;

revoke all on function public.owns_workout_template(uuid) from public;
grant execute on function public.owns_workout_template(uuid) to authenticated;

drop policy if exists "Users can view own templates" on public.workout_templates;
create policy "Users can view own templates"
  on public.workout_templates for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can add own templates" on public.workout_templates;
create policy "Users can add own templates"
  on public.workout_templates for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own templates" on public.workout_templates;
create policy "Users can update own templates"
  on public.workout_templates for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own templates" on public.workout_templates;
create policy "Users can delete own templates"
  on public.workout_templates for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can view own template exercises" on public.workout_template_exercises;
create policy "Users can view own template exercises"
  on public.workout_template_exercises for select to authenticated
  using (public.owns_workout_template(template_id));

drop policy if exists "Users can add own template exercises" on public.workout_template_exercises;
create policy "Users can add own template exercises"
  on public.workout_template_exercises for insert to authenticated
  with check (public.owns_workout_template(template_id));

drop policy if exists "Users can update own template exercises" on public.workout_template_exercises;
create policy "Users can update own template exercises"
  on public.workout_template_exercises for update to authenticated
  using (public.owns_workout_template(template_id))
  with check (public.owns_workout_template(template_id));

drop policy if exists "Users can delete own template exercises" on public.workout_template_exercises;
create policy "Users can delete own template exercises"
  on public.workout_template_exercises for delete to authenticated
  using (public.owns_workout_template(template_id));

commit;

notify pgrst, 'reload schema';
