create table if not exists public.site_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username = 'onkarbsawant11@gmail.com'),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.site_admins add column if not exists username text;
alter table public.site_admins add column if not exists email text;
update public.site_admins as admins
set username = 'onkarbsawant11@gmail.com', email = auth_users.email
from auth.users as auth_users
where auth_users.id = admins.user_id
  and lower(auth_users.email) = 'onkarbsawant11@gmail.com';
create unique index if not exists site_admins_username_unique on public.site_admins (lower(username)) where username is not null;
create unique index if not exists site_admins_email_unique on public.site_admins (lower(email)) where email is not null;

create table if not exists public.site_content (
  id text primary key check (id = 'main'),
  site_identity jsonb not null default '{"name":"Hackathon Runners","font":"serif","size":22}'::jsonb,
  profiles jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  text_sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_content (id)
values ('main')
on conflict (id) do nothing;

alter table public.site_admins enable row level security;
alter table public.site_content enable row level security;

revoke all on public.site_admins from anon, authenticated;
revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant select on public.site_admins to authenticated;

drop policy if exists "admins can read own admin record" on public.site_admins;
create policy "admins can read own admin record"
on public.site_admins
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "admins can update own username" on public.site_admins;

drop policy if exists "site content is publicly readable" on public.site_content;
create policy "site content is publicly readable"
on public.site_content
for select
to anon, authenticated
using (true);

drop policy if exists "admins can create site content" on public.site_content;
create policy "admins can create site content"
on public.site_content
for insert
to authenticated
with check (
  exists (
    select 1 from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

drop policy if exists "admins can update site content" on public.site_content;
create policy "admins can update site content"
on public.site_content
for update
to authenticated
using (
  exists (
    select 1 from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);
