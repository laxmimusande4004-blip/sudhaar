
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Citizen',
  role text not null default 'citizen'
    check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id)
    on delete restrict,
  title text not null
    check (char_length(trim(title)) between 5 and 120),
  category text not null check (
    category in (
      'roads',
      'sanitation',
      'water',
      'drainage',
      'streetlights',
      'footpaths',
      'public_spaces',
      'other'
    )
  ),
  description text not null
    check (char_length(trim(description)) between 20 and 2000),
  address text not null check (char_length(trim(address)) between 3 and 300),
  latitude double precision,
  longitude double precision,
  photo_path text,
  status text not null default 'submitted'
    check (status in ('submitted', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_latitude check (
    latitude is null or latitude between -90 and 90
  ),
  constraint valid_longitude check (
    longitude is null or longitude between -180 and 180
  ),
  constraint coordinates_together check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  )
);

create index complaints_created_at_idx
  on public.complaints (created_at desc);

create index complaints_status_idx
  on public.complaints (status);

create index complaints_reporter_id_idx
  on public.complaints (reporter_id);

create table public.complaint_updates (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id)
    on delete cascade,
  actor_id uuid references public.profiles(id)
    on delete set null,
  status text not null
    check (status in ('submitted', 'in_progress', 'resolved')),
  note text not null
    check (char_length(trim(note)) between 1 and 2000),
  proof_path text,
  created_at timestamptz not null default now()
);

create index complaint_updates_complaint_idx
  on public.complaint_updates (complaint_id, created_at desc);

create table public.complaint_votes (
  complaint_id uuid not null references public.complaints(id)
    on delete cascade,
  user_id uuid not null references public.profiles(id)
    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (complaint_id, user_id)
);

create index complaint_votes_user_idx
  on public.complaint_votes (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      'Citizen'
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger complaints_updated_at
  before update on public.complaints
  for each row execute function public.set_updated_at();


create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_updates enable row level security;
alter table public.complaint_votes enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.complaints from anon, authenticated;
revoke all on public.complaint_updates from anon, authenticated;
revoke all on public.complaint_votes from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

grant select on public.complaints to anon, authenticated;
grant insert (
  reporter_id, title, category, description, address,
  latitude, longitude, photo_path
) on public.complaints to authenticated;
grant delete on public.complaints to authenticated;

grant select on public.complaint_updates to anon, authenticated;

grant select on public.complaint_votes to anon, authenticated;
grant insert (complaint_id, user_id)
  on public.complaint_votes to authenticated;
grant delete on public.complaint_votes to authenticated;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own display name"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Public can view submitted complaints"
on public.complaints for select
to anon, authenticated
using (true);

create policy "Citizens can submit their own complaints"
on public.complaints for insert
to authenticated
with check (
  reporter_id = (select auth.uid())
  and status = 'submitted'
);

create policy "Citizens can delete their own submitted complaints"
on public.complaints for delete
to authenticated
using (
  reporter_id = (select auth.uid())
  and status = 'submitted'
);

create policy "Admins can update complaints"
on public.complaints for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can view complaint updates"
on public.complaint_updates for select
to anon, authenticated
using (true);

create policy "Admins can record complaint updates"
on public.complaint_updates for insert
to authenticated
with check ((select private.is_admin()));

create policy "Public can view support votes"
on public.complaint_votes for select
to anon, authenticated
using (true);

create policy "Citizens can support a complaint once"
on public.complaint_votes for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Citizens can remove their own support"
on public.complaint_votes for delete
to authenticated
using (user_id = (select auth.uid()));
