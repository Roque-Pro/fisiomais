-- =============================================================================
-- Fisio+ - Esquema do banco de dados (Supabase / Postgres)
-- Execute este arquivo no SQL Editor do Supabase.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ------------------------------ profiles -------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  crefito text not null,
  whatsapp text not null,
  email text,
  city text,
  workplace text,
  bio text,
  photo_url text,
  specialties text[] default '{}',
  theme jsonb default '{
    "primary": "#0ea5e9",
    "accent": "#22d3ee",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a",
    "font": "Inter",
    "radius": "lg",
    "buttonStyle": "solid"
  }'::jsonb,
  trial_started_at timestamptz not null default now(),
  plan_status text not null default 'active', -- trial | active | expired | canceled
  referral_code text unique default substr(md5(random()::text), 0, 8),
  referred_by uuid references public.profiles(id) on delete set null,
  role text not null default 'user', -- user | admin
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------ patients -------------------------------------
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  birthdate date,
  gender text,
  whatsapp text,
  email text,
  address text,
  occupation text,
  chief_complaint text,
  functional_objective text,
  objective_assessment text,
  medical_history text,
  medications text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patients_profile on public.patients(profile_id);

-- ----------------------------- assessments -----------------------------------
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  specialty text not null, -- pilates | hidroterapia | rpg | ortopedia | neurofuncional | esportiva
  title text,
  data jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_assessments_patient on public.assessments(patient_id);
create index if not exists idx_assessments_profile on public.assessments(profile_id);

-- ----------------------------- evolutions ------------------------------------
create table if not exists public.evolutions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_number int,
  session_date date not null default current_date,
  pain_level int check (pain_level between 0 and 10),
  mobility_level int check (mobility_level between 0 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_evolutions_patient on public.evolutions(patient_id);

-- =========================== RLS ============================================
alter table public.profiles    enable row level security;
alter table public.patients    enable row level security;
alter table public.assessments enable row level security;
alter table public.evolutions  enable row level security;

-- profiles
create policy "Profile owner read"   on public.profiles for select using (auth.uid() = id);
create policy "Profile owner update" on public.profiles for update using (auth.uid() = id);
create policy "Admin update all"   on public.profiles for update using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Profile insert self"  on public.profiles for insert with check (auth.uid() = id);
create policy "Admin read all"       on public.profiles for select using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- patients
create policy "Patients owner all" on public.patients for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- assessments
create policy "Assessments owner all" on public.assessments for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- evolutions
create policy "Evolutions owner all" on public.evolutions for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ================ Trigger: cria profile a partir de auth.users ===============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, crefito, whatsapp, email, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Profissional'),
    coalesce(new.raw_user_meta_data->>'crefito', ''),
    coalesce(new.raw_user_meta_data->>'whatsapp', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'referred_by','')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================= Storage =======================================
-- Crie um bucket público "avatars" no Storage do Supabase para fotos de perfil.
-- insert into storage.buckets (id, name, public) values ('avatars','avatars', true);

-- ------------------------------ news -----------------------------------------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  url text unique not null,
  source text,
  published_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.news enable row level security;

create policy "Anyone can read news" on public.news for select using (auth.uid() is not null);
create policy "Admin can insert/update news" on public.news for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ------------------------------ products -------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  image_url text not null,
  affiliate_url text not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can read products" on public.products for select using (auth.uid() is not null);
create policy "Admin can manage products" on public.products for all using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
