begin;

create table if not exists public.water_intake (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  intake_date date not null,
  amount_ml integer not null check (amount_ml > 0 and amount_ml <= 5000),
  created_at timestamptz not null default now()
);

create index if not exists water_intake_user_date_idx
  on public.water_intake (user_id, intake_date);

alter table public.water_intake enable row level security;

revoke all on public.water_intake from anon;
grant select, insert, delete on public.water_intake to authenticated;

create policy "Users can view own water intake"
  on public.water_intake for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can add own water intake"
  on public.water_intake for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can delete own water intake"
  on public.water_intake for delete to authenticated
  using (user_id = (select auth.uid()));

commit;
