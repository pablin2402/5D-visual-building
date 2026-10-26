create table if not exists public.docs (
  path text primary key,
  col text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  owner uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  constraint docs_path_ok check (path = col || '/' || id)
);
create index if not exists docs_col_idx on public.docs (col);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.es_mio(p text) returns boolean
language sql stable
as $$ select p like 'data/users/%' and split_part(p, '/', 3) = coalesce(auth.uid()::text, '-') $$;

alter table public.docs enable row level security;

drop policy if exists docs_leer on public.docs;
create policy docs_leer on public.docs for select to anon, authenticated
using (
  (path not like 'data/users/%' and col <> 'leads')
  or public.es_mio(path)
  or public.is_admin()
);

drop policy if exists docs_crear on public.docs;
create policy docs_crear on public.docs for insert to anon, authenticated
with check (public.es_mio(path) or public.is_admin() or col = 'leads');

drop policy if exists docs_editar on public.docs;
create policy docs_editar on public.docs for update to authenticated
using (public.es_mio(path) or public.is_admin())
with check (public.es_mio(path) or public.is_admin());

drop policy if exists docs_borrar on public.docs;
create policy docs_borrar on public.docs for delete to authenticated
using (public.es_mio(path) or public.is_admin());

drop policy if exists admins_leer on public.admins;
create policy admins_leer on public.admins for select to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on public.docs to anon, authenticated;
grant select on public.admins to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; when undefined_object then null;
end $$;

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;

drop policy if exists assets_subir on storage.objects;
create policy assets_subir on storage.objects for insert to authenticated
with check (bucket_id = 'assets' and public.is_admin());

drop policy if exists assets_editar on storage.objects;
create policy assets_editar on storage.objects for update to authenticated
using (bucket_id = 'assets' and public.is_admin());

drop policy if exists assets_borrar on storage.objects;
create policy assets_borrar on storage.objects for delete to authenticated
using (bucket_id = 'assets' and public.is_admin());

create or replace function public.admin_inicial() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if lower(new.email) = 'pabloperedo04@gmail.com' then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists admin_inicial on auth.users;
create trigger admin_inicial after insert on auth.users
for each row execute function public.admin_inicial();

insert into public.admins (user_id)
select id from auth.users where lower(email) = 'pabloperedo04@gmail.com'
on conflict do nothing;
