begin;

alter table public.user_data
  add column if not exists birth_year integer,
  add column if not exists weight_kg numeric(5, 1);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_data_birth_year_check'
  ) then
    alter table public.user_data
      add constraint user_data_birth_year_check
      check (birth_year is null or birth_year between 1900 and 2100);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'user_data_weight_kg_check'
  ) then
    alter table public.user_data
      add constraint user_data_weight_kg_check
      check (weight_kg is null or weight_kg between 20 and 400);
  end if;
end;
$$;

commit;
