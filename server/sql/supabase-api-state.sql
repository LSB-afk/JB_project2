create table if not exists public.jb_backend_state (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_jb_backend_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_jb_backend_state_updated_at on public.jb_backend_state;

create trigger trg_jb_backend_state_updated_at
before update on public.jb_backend_state
for each row
execute function public.set_jb_backend_state_updated_at();

alter table public.jb_backend_state enable row level security;

grant select, insert, update on table public.jb_backend_state to service_role;
