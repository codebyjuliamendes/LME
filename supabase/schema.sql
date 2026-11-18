-- LME · esquema do banco no Supabase
-- Como usar: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- Depois, em Authentication → URL Configuration, adicione o endereço do app (ex.: https://SEU-USUARIO.github.io/LME/app/).
-- Para criar a primeira pessoa da coordenação, depois que ela fizer o cadastro no app:
--   update public.profiles set role = 'coordination' where email = 'email@exemplo.com';
-- O banco começa vazio: a coordenação cadastra eventos, Círculos, desafios, especialistas, benefícios e oportunidades pelo painel.

create extension if not exists pgcrypto;

-- ---------- Tabelas ----------
-- Todos os ids são texto: o app usa ids compostos (ex.: "evento:pessoa") para evitar duplicidade.
create table if not exists public.profiles (
  id text primary key, created_at timestamptz not null default now(),
  name text not null, age int, email text, whatsapp text, city text, org text, area text,
  perfis jsonb not null default '[]', interest text, skills jsonb not null default '[]',
  business text, innovation text, seeking text, offering text,
  consent boolean not null default false,
  onboarded boolean not null default false, role text not null default 'member' check (role in ('member', 'coordination')),
  ambassador text default '', mentor boolean not null default false
);
alter table public.profiles add column if not exists age int;
alter table public.profiles add column if not exists consent boolean not null default false;

create table if not exists public.events (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  title text not null, format text, starts_at timestamptz not null, place text, city text, mode text default 'Presencial',
  capacity int default 0, audience text, description text, agenda jsonb not null default '[]');
create table if not exists public.rsvps (id text primary key, created_at timestamptz not null default now(),
  event_id text not null references public.events(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade on update cascade);

create table if not exists public.circles (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  name text not null, kind text, city text, cadence text, capacity int not null default 10, next_meeting timestamptz, place text,
  facilitator_id text references public.profiles(id) on delete set null on update cascade);
create table if not exists public.circle_members (id text primary key, created_at timestamptz not null default now(),
  circle_id text not null references public.circles(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade on update cascade);
create unique index if not exists one_circle_per_person on public.circle_members(user_id);
create table if not exists public.goals (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  circle_id text references public.circles(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade on update cascade,
  text text not null, status text not null default 'Em andamento');
create table if not exists public.learnings (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  circle_id text references public.circles(id) on delete cascade, text text not null);

create table if not exists public.posts (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  author_id text not null references public.profiles(id) on delete cascade on update cascade, channel text not null, type text not null default 'conversa',
  text text not null, tags jsonb not null default '[]');
create table if not exists public.replies (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  post_id text not null references public.posts(id) on delete cascade, author_id text not null references public.profiles(id) on delete cascade on update cascade,
  kind text not null default 'resposta', text text not null);

create table if not exists public.connection_requests (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  from_id text not null references public.profiles(id) on delete cascade on update cascade, type text, text text not null, until text,
  status text not null default 'curadoria', suggested_ids jsonb not null default '[]');
create table if not exists public.connections (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  a_id text not null references public.profiles(id) on delete cascade on update cascade, b_id text not null references public.profiles(id) on delete cascade on update cascade,
  request_id text references public.connection_requests(id) on delete set null, note text);

create table if not exists public.opportunities (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  type text, title text not null, description text, deadline text not null, audience text, url text);
create table if not exists public.saved_opps (id text primary key, created_at timestamptz not null default now(),
  opp_id text not null references public.opportunities(id) on delete cascade, user_id text not null references public.profiles(id) on delete cascade on update cascade);
create table if not exists public.suggestions (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  author_id text not null references public.profiles(id) on delete cascade on update cascade, title text not null, url text, text text, status text not null default 'nova');

create table if not exists public.benefits (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  category text, offer text not null, description text, partner text, how text);
create table if not exists public.benefit_uses (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  benefit_id text references public.benefits(id) on delete set null, user_id text not null references public.profiles(id) on delete cascade on update cascade,
  savings numeric not null default 0 check (savings >= 0));
create table if not exists public.impact (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  user_id text not null references public.profiles(id) on delete cascade on update cascade, kind text, amount numeric not null default 0 check (amount >= 0), description text);

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
  user_id text not null references public.profiles(id) on delete cascade on update cascade, module text not null, done boolean not null default true);

create table if not exists public.partners (id text primary key default gen_random_uuid()::text, created_at timestamptz not null default now(),
  name text not null, kind text, stage text not null default 'Primeiro contato', contact text, notes text);
create table if not exists public.settings (id text primary key, created_at timestamptz not null default now(),
  survey_url text, edition text, status text, updated_at timestamptz);

-- ---------- Índices ----------
create index if not exists profiles_email_lower_idx on public.profiles (lower(email));
create index if not exists rsvps_event_idx on public.rsvps(event_id);
create index if not exists rsvps_user_idx on public.rsvps(user_id);
create index if not exists circle_members_circle_idx on public.circle_members(circle_id);
create index if not exists goals_circle_idx on public.goals(circle_id);
create index if not exists goals_user_idx on public.goals(user_id);
create index if not exists learnings_circle_idx on public.learnings(circle_id);
create index if not exists posts_author_idx on public.posts(author_id);
create index if not exists posts_channel_idx on public.posts(channel);
create index if not exists replies_post_idx on public.replies(post_id);
create index if not exists connection_requests_from_idx on public.connection_requests(from_id);
create index if not exists connections_a_idx on public.connections(a_id);
create index if not exists connections_b_idx on public.connections(b_id);
create index if not exists saved_opps_user_idx on public.saved_opps(user_id);
create index if not exists benefit_uses_user_idx on public.benefit_uses(user_id);
create index if not exists impact_user_idx on public.impact(user_id);
create index if not exists teams_challenge_idx on public.teams(challenge_id);
create index if not exists slots_expert_idx on public.slots(expert_id);
create index if not exists progress_user_idx on public.progress(user_id);

-- ---------- Funções auxiliares ----------
create or replace function public.me() returns text language sql stable as $$ select auth.uid()::text $$;
create or replace function public.is_coord() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid()::text and role = 'coordination')
$$;

-- Ninguém se promove sozinho: papel, embaixador e mentoria só mudam pela coordenação (ou SQL administrativo).
create or replace function public.protect_profile() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if nullif(current_setting('request.jwt.claim.role', true), '') is null
     and auth.uid() is null
     and current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if not public.is_coord() then
    if tg_op = 'INSERT' then new.role := 'member'; new.ambassador := ''; new.mentor := false;
    else new.role := old.role; new.ambassador := old.ambassador; new.mentor := old.mentor; end if;
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

-- Agenda pública: o site mostra os próximos eventos sem login.
drop policy if exists public_events on public.events;
create policy public_events on public.events for select to anon using (true);

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

-- ---------- Permissões explícitas na Data API ----------
grant usage on schema public to anon, authenticated;
grant select on public.events to anon;
grant select, insert, update, delete on
  public.profiles, public.events, public.rsvps, public.circles, public.circle_members,
  public.goals, public.learnings, public.posts, public.replies,
  public.connection_requests, public.connections, public.opportunities, public.saved_opps,
  public.suggestions, public.benefits, public.benefit_uses, public.impact,
  public.challenges, public.teams, public.experts, public.slots,
  public.progress, public.partners, public.settings
  to authenticated;

-- ---------- Funções RPC públicas e vinculação de perfil ----------
create or replace function public.submit_partner_interest(
  p_name text,
  p_org text,
  p_kind text,
  p_contact text,
  p_notes text default ''
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_org), '') = '' or coalesce(trim(p_contact), '') = '' then
    raise exception 'Dados obrigatórios ausentes para interesse de parceria.';
  end if;
  insert into public.partners (name, kind, stage, contact, notes)
  values (
    trim(p_org),
    nullif(trim(p_kind), ''),
    'Primeiro contato',
    trim(p_name) || ' · ' || trim(p_contact),
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.submit_public_profile(
  p_name text,
  p_age int,
  p_city text,
  p_email text,
  p_whatsapp text default '',
  p_org text default '',
  p_area text default '',
  p_perfis jsonb default '[]'::jsonb,
  p_interest text default '',
  p_business text default '',
  p_innovation text default '',
  p_skills jsonb default '[]'::jsonb,
  p_seeking text default '',
  p_offering text default ''
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_id text;
begin
  v_email := lower(trim(coalesce(p_email, '')));
  if coalesce(trim(p_name), '') = '' or v_email = '' then
    raise exception 'Nome e e-mail são obrigatórios.';
  end if;

  select id into v_id
  from public.profiles
  where lower(email) = v_email
  order by created_at asc
  limit 1;

  if v_id is not null then
    update public.profiles
    set
      name = trim(p_name),
      age = coalesce(p_age, age),
      whatsapp = coalesce(nullif(trim(coalesce(p_whatsapp, '')), ''), whatsapp),
      city = coalesce(nullif(trim(coalesce(p_city, '')), ''), city),
      org = coalesce(nullif(trim(coalesce(p_org, '')), ''), org),
      area = coalesce(nullif(trim(coalesce(p_area, '')), ''), area),
      perfis = case when jsonb_array_length(coalesce(p_perfis, '[]'::jsonb)) > 0 then p_perfis else perfis end,
      interest = coalesce(nullif(trim(coalesce(p_interest, '')), ''), interest),
      business = coalesce(nullif(trim(coalesce(p_business, '')), ''), business),
      innovation = coalesce(nullif(trim(coalesce(p_innovation, '')), ''), innovation),
      skills = case when jsonb_array_length(coalesce(p_skills, '[]'::jsonb)) > 0 then p_skills else skills end,
      seeking = coalesce(nullif(trim(coalesce(p_seeking, '')), ''), seeking),
      offering = coalesce(nullif(trim(coalesce(p_offering, '')), ''), offering),
      consent = true,
      onboarded = true
    where id = v_id;
    return v_id;
  end if;

  v_id := gen_random_uuid()::text;
  insert into public.profiles (
    id, name, age, email, whatsapp, city, org, area, perfis, interest,
    skills, business, innovation, seeking, offering, consent, onboarded, role
  ) values (
    v_id,
    trim(p_name),
    p_age,
    v_email,
    nullif(trim(coalesce(p_whatsapp, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_org, '')), ''),
    nullif(trim(coalesce(p_area, '')), ''),
    coalesce(p_perfis, '[]'::jsonb),
    nullif(trim(coalesce(p_interest, '')), ''),
    coalesce(p_skills, '[]'::jsonb),
    nullif(trim(coalesce(p_business, '')), ''),
    nullif(trim(coalesce(p_innovation, '')), ''),
    nullif(trim(coalesce(p_seeking, '')), ''),
    nullif(trim(coalesce(p_offering, '')), ''),
    true,
    true,
    'member'
  );
  return v_id;
end $$;

create or replace function public.claim_profile_by_email()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid text;
  v_email text;
  v_current public.profiles%rowtype;
  v_existing public.profiles%rowtype;
begin
  if auth.uid() is null then
    return null;
  end if;

  v_uid := auth.uid()::text;
  v_email := lower(trim(coalesce(auth.jwt()->>'email', '')));
  if v_email = '' then
    return null;
  end if;

  select * into v_current from public.profiles where id = v_uid;
  select * into v_existing
  from public.profiles
  where lower(email) = v_email and id <> v_uid
  order by (role = 'coordination') desc, onboarded desc, created_at asc
  limit 1;

  if v_existing.id is not null then
    if v_current.id is null then
      update public.profiles
      set id = v_uid, email = v_email
      where id = v_existing.id
      returning * into v_current;
      return to_jsonb(v_current);
    elsif not v_current.onboarded then
      delete from public.profiles where id = v_uid;
      update public.profiles
      set id = v_uid, email = v_email
      where id = v_existing.id
      returning * into v_current;
      return to_jsonb(v_current);
    end if;
  end if;

  if v_current.id is not null then
    return to_jsonb(v_current);
  end if;

  return null;
end $$;

revoke all on function public.submit_partner_interest(text, text, text, text, text) from public;
grant execute on function public.submit_partner_interest(text, text, text, text, text) to anon, authenticated;

revoke all on function public.submit_public_profile(text, int, text, text, text, text, text, jsonb, text, text, text, jsonb, text, text) from public;
grant execute on function public.submit_public_profile(text, int, text, text, text, text, text, jsonb, text, text, text, jsonb, text, text) to anon, authenticated;

revoke all on function public.claim_profile_by_email() from public;
grant execute on function public.claim_profile_by_email() to authenticated;
