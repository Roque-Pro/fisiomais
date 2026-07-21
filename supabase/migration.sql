-- =============================================================================
-- Migração: adicionar colunas de pagamento e ajustar plan_status
-- Execute este SQL no SQL Editor do Supabase
-- =============================================================================

-- 1. Adicionar colunas de pagamento na tabela profiles (se não existirem)
alter table public.profiles
  add column if not exists mp_subscription_id text,
  add column if not exists mp_plan_id text,
  add column if not exists mp_email text,
  add column if not exists payment_date timestamptz;

-- 2. Ajustar plan_status dos usuários existentes que estavam como 'active'
--    (para manter consistência: quem já estava ativo continua ativo)
--    Quem está como 'active' e nunca pagou, definimos como 'trial'
update public.profiles
set plan_status = 'trial'
where plan_status = 'active'
  and payment_date is null
  and (trial_started_at is not null);

-- 3. Criar índices para as novas colunas
create index if not exists idx_profiles_plan_status on public.profiles(plan_status);
create index if not exists idx_profiles_trial_started_at on public.profiles(trial_started_at);

-- 4. Verificar se o trigger handle_new_user existe
-- (caso não exista, criar)
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
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
  end if;
end;
$$;

-- 5. Garantir RLS está habilitado e políticas existem
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.assessments enable row level security;
alter table public.evolutions enable row level security;
alter table public.news enable row level security;

-- 6. Recriar políticas (ignora se já existir)
do $$
begin
  -- profiles
  if not exists (select 1 from pg_policies where policyname = 'Profile owner read' and tablename = 'profiles') then
    create policy "Profile owner read" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Profile owner update' and tablename = 'profiles') then
    create policy "Profile owner update" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Admin update all' and tablename = 'profiles') then
    create policy "Admin update all" on public.profiles for update using (
      exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Profile insert self' and tablename = 'profiles') then
    create policy "Profile insert self" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Admin read all' and tablename = 'profiles') then
    create policy "Admin read all" on public.profiles for select using (
      exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    );
  end if;

  -- patients
  if not exists (select 1 from pg_policies where policyname = 'Patients owner all' and tablename = 'patients') then
    create policy "Patients owner all" on public.patients for all
      using (auth.uid() = profile_id)
      with check (auth.uid() = profile_id);
  end if;

  -- assessments
  if not exists (select 1 from pg_policies where policyname = 'Assessments owner all' and tablename = 'assessments') then
    create policy "Assessments owner all" on public.assessments for all
      using (auth.uid() = profile_id)
      with check (auth.uid() = profile_id);
  end if;

  -- evolutions
  if not exists (select 1 from pg_policies where policyname = 'Evolutions owner all' and tablename = 'evolutions') then
    create policy "Evolutions owner all" on public.evolutions for all
      using (auth.uid() = profile_id)
      with check (auth.uid() = profile_id);
  end if;

  -- news
  if not exists (select 1 from pg_policies where policyname = 'Anyone can read news' and tablename = 'news') then
    create policy "Anyone can read news" on public.news for select using (auth.uid() is not null);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Admin can insert/update news' and tablename = 'news') then
    create policy "Admin can insert/update news" on public.news for all using (
      exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    );
  end if;
end;
$$;

-- 7. Criar índices que podem estar faltando
create index if not exists idx_patients_profile on public.patients(profile_id);
create index if not exists idx_assessments_patient on public.assessments(patient_id);
create index if not exists idx_assessments_profile on public.assessments(profile_id);
create index if not exists idx_evolutions_patient on public.evolutions(patient_id);
