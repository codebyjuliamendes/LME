-- LME · esquema do banco no Supabase
-- Como usar: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- Depois, em Authentication → URL Configuration, adicione o endereço do app (ex.: https://SEU-USUARIO.github.io/LME/app/).
-- Para criar a primeira pessoa da coordenação, depois que ela fizer o cadastro no app:
--   update public.profiles set role = 'coordination' where email = 'email@exemplo.com';

create extension if not exists pgcrypto;

-- ---------- Tabelas ----------
-- Todos os ids são texto: o app usa ids compostos (ex.: "evento:pessoa") para evitar duplicidade.
create table if not exists public.profiles (
  id text primary key, created_at timestamptz not null default now(),
  name text not null, email text, whatsapp text, city text, org text, area text,
  perfis jsonb not null default '[]', interest text, skills jsonb not null default '[]',
  business text, innovation text, seeking text, offering text,
  onboarded boolean not null default false, role text not null default 'member' check (role in ('member', 'coordination')),
  ambassador text default '', mentor boolean not null default false, demo_login boolean not null default false
);

create table if not exists public.events (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  title text not null, format text, starts_at timestamptz not null, place text, city text, mode text default 'Presencial',
  capacity int default 0, audience text, description text, agenda jsonb not null default '[]');
create table if not exists public.rsvps (id text primary key, created_at timestamptz not null default now(),
  event_id text not null references public.events(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade);

create table if not exists public.circles (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  name text not null, kind text, city text, cadence text, capacity int not null default 10, next_meeting timestamptz, place text,
  facilitator_id text references public.profiles(id) on delete set null);
create table if not exists public.circle_members (id text primary key, created_at timestamptz not null default now(),
  circle_id text not null references public.circles(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade);
create unique index if not exists one_circle_per_person on public.circle_members(user_id);
create table if not exists public.goals (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  circle_id text references public.circles(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade,
  text text not null, status text not null default 'Em andamento');
create table if not exists public.learnings (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  circle_id text references public.circles(id) on delete cascade, text text not null);

create table if not exists public.posts (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  author_id text not null references public.profiles(id) on delete cascade, channel text not null, type text not null default 'conversa',
  text text not null, tags jsonb not null default '[]');
create table if not exists public.replies (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  post_id text not null references public.posts(id) on delete cascade, author_id text not null references public.profiles(id) on delete cascade,
  kind text not null default 'resposta', text text not null);

create table if not exists public.connection_requests (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  from_id text not null references public.profiles(id) on delete cascade, type text, text text not null, until text,
  status text not null default 'curadoria', suggested_ids jsonb not null default '[]');
create table if not exists public.connections (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  a_id text not null references public.profiles(id) on delete cascade, b_id text not null references public.profiles(id) on delete cascade,
  request_id text references public.connection_requests(id) on delete set null, note text);

create table if not exists public.opportunities (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  type text, title text not null, description text, deadline text not null, audience text, url text);
create table if not exists public.saved_opps (id text primary key, created_at timestamptz not null default now(),
  opp_id text not null references public.opportunities(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade);
create table if not exists public.suggestions (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  author_id text not null references public.profiles(id) on delete cascade, title text not null, url text, text text, status text not null default 'nova');

create table if not exists public.benefits (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  category text, offer text not null, description text, partner text, how text);
create table if not exists public.benefit_uses (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  benefit_id text references public.benefits(id) on delete set null, user_id text not null references public.profiles(id) on delete cascade,
  savings numeric not null default 0 check (savings >= 0));
create table if not exists public.impact (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  user_id text not null references public.profiles(id) on delete cascade, kind text, amount numeric not null default 0 check (amount >= 0), description text);

create table if not exists public.challenges (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  title text not null, org text, status text, format text, team_slots int default 10, closes text, demo_day text, description text);
create table if not exists public.teams (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  challenge_id text not null references public.challenges(id) on delete cascade, name text not null,
  member_ids jsonb not null default '[]', looking boolean not null default true);

create table if not exists public.experts (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  name text not null, role text, area text, topics text);
create table if not exists public.slots (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  expert_id text not null references public.experts(id) on delete cascade, starts_at timestamptz not null, booked_by text not null default '', topic text default '');

create table if not exists public.progress (id text primary key, created_at timestamptz not null default now(),
  user_id text not null references public.profiles(id) on delete cascade, module text not null, done boolean not null default true);

create table if not exists public.partners (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  name text not null, kind text, stage text not null default 'Primeiro contato', contact text, notes text);
create table if not exists public.settings (id text primary key, created_at timestamptz not null default now(),
  survey_url text, edition text, status text, updated_at timestamptz);

-- ---------- Funções auxiliares ----------
create or replace function public.me() returns text language sql stable as $$ select auth.uid()::text $$;
create or replace function public.is_coord() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid()::text and role = 'coordination')
$$;

-- Ninguém se promove sozinho: papel, embaixador e mentoria só mudam pela coordenação.
create or replace function public.protect_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_coord() then
    if tg_op = 'INSERT' then new.role := 'member'; new.ambassador := ''; new.mentor := false; new.demo_login := false;
    else new.role := old.role; new.ambassador := old.ambassador; new.mentor := old.mentor; new.demo_login := old.demo_login; end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before insert or update on public.profiles for each row execute function public.protect_profile();

-- ---------- Segurança (RLS) ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','events','rsvps','circles','circle_members','goals','learnings','posts','replies','connection_requests','connections',
    'opportunities','saved_opps','suggestions','benefits','benefit_uses','impact','challenges','teams','experts','slots','progress','partners','settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists coord_all on public.%I', t);
    execute format('create policy coord_all on public.%I for all to authenticated using (public.is_coord()) with check (public.is_coord())', t);
  end loop;

  -- Leitura para qualquer membro logado (parcerias e indicações ficam só com a coordenação).
  foreach t in array array['profiles','events','rsvps','circles','circle_members','goals','learnings','posts','replies','connection_requests','connections',
    'opportunities','saved_opps','benefits','benefit_uses','impact','challenges','teams','experts','slots','progress','settings'] loop
    execute format('drop policy if exists read_all on public.%I', t);
    execute format('create policy read_all on public.%I for select to authenticated using (true)', t);
  end loop;

  -- Registros da própria pessoa: cria, edita e apaga só o que é seu.
  foreach t in array array['rsvps:user_id','circle_members:user_id','goals:user_id','saved_opps:user_id','benefit_uses:user_id','impact:user_id',
    'progress:user_id','posts:author_id','replies:author_id','connection_requests:from_id','suggestions:author_id'] loop
    execute format('drop policy if exists own_rows on public.%I', split_part(t, ':', 1));
    execute format('create policy own_rows on public.%I for all to authenticated using (%I = public.me()) with check (%I = public.me())',
      split_part(t, ':', 1), split_part(t, ':', 2), split_part(t, ':', 2));
  end loop;
end $$;

drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles for all to authenticated using (id = public.me()) with check (id = public.me());

drop policy if exists own_suggestions_read on public.suggestions;
create policy own_suggestions_read on public.suggestions for select to authenticated using (author_id = public.me());

-- Aprendizados: quem está no Círculo registra.
drop policy if exists circle_learnings on public.learnings;
create policy circle_learnings on public.learnings for insert to authenticated
  with check (exists (select 1 from public.circle_members m where m.circle_id = learnings.circle_id and m.user_id = public.me()));

-- Times dos Challenges: cria um time com você dentro; entra e sai de times que procuram gente.
drop policy if exists team_create on public.teams;
create policy team_create on public.teams for insert to authenticated with check (member_ids ? public.me());
drop policy if exists team_join on public.teams;
create policy team_join on public.teams for update to authenticated using (looking or member_ids ? public.me()) with check (true);
drop policy if exists team_delete on public.teams;
create policy team_delete on public.teams for delete to authenticated using (member_ids = jsonb_build_array(public.me()));

-- Office Hours: marca um horário livre ou desmarca o seu.
drop policy if exists slot_book on public.slots;
create policy slot_book on public.slots for update to authenticated
  using (booked_by = '' or booked_by = public.me()) with check (booked_by = '' or booked_by = public.me());
