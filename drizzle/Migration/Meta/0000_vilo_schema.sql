create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
create table public.services (
  id text primary key,
  name text not null,
  description text not null default '',
  icon text not null default '🛠️',
  color text not null default '#0f7a3d',
  details text[] not null default '{}',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create table public.workers (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references public.services(id) on delete cascade,
  name text not null,
  rating numeric not null default 5,
  reviews int not null default 0,
  years int not null default 1,
  rate int not null default 300,
  created_at timestamptz not null default now()
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  worker_id uuid references public.workers(id) on delete set null,
  service_name text not null,
  worker_name text not null,
  date date not null,
  time text not null,
  address text not null,
  status text not null default 'Upcoming',
  created_at timestamptz not null default now()
);

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
grant select on public.services, public.workers to anon, authenticated;
grant insert, update, delete on public.services, public.workers to authenticated;
grant all on public.services, public.workers to service_role;
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.services enable row level security;
alter table public.workers enable row level security;
alter table public.bookings enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own or admin read profile" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own update profile" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own or admin read roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "public read services" on public.services for select to anon, authenticated using (true);
create policy "admin write services" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read workers" on public.workers for select to anon, authenticated using (true);
create policy "admin write workers" on public.workers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "own or admin read bookings" on public.bookings for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own insert bookings" on public.bookings for insert to authenticated with check (user_id = auth.uid());
create policy "own or admin update bookings" on public.bookings for update to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin delete bookings" on public.bookings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- New users get a profile + 'user' role; the very first user becomes admin.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.services (id,name,description,icon,color,details,sort) values
('electrician','Electrician','Electrical repair & installation','⚡','#f15a24','{"Electrical repair","Wiring & installation","Switch & socket fix"}',1),
('plumber','Plumber','Water & plumbing service','💧','#2f80ed','{"Pipe leak repair","Tap & shower fitting","Drain cleaning"}',2),
('ac','AC Repair','AC service & maintenance','❄️','#27ae60','{"AC servicing","Gas refill","Installation"}',3),
('cleaning','Cleaning','Home & office cleaning','🧹','#8e44ad','{"Deep home cleaning","Office cleaning","Kitchen & bathroom"}',4),
('carpenter','Carpenter','Furniture & woodwork','🪚','#e74c3c','{"Furniture repair","Door & window fix","Custom woodwork"}',5),
('car','Car Service','Car repair & maintenance','🚗','#f2b705','{"Engine check","Oil change","Car wash"}',6);

insert into public.workers (service_id,name,rating,reviews,years,rate)
select s.id, w.name, w.rating, w.reviews, w.years, w.rate from public.services s
cross join (values ('Rafiq Ahmed',4.8,124,5,300),('Hasan Mia',4.6,98,3,250),('Jamal Uddin',4.5,76,4,300)) as w(name,rating,reviews,years,rate);