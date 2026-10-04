-- Migration: Initial Schema for Profiles, Leads and Pending Checkouts
-- Description: Separação estrita entre dados de alunos confirmados e leads de pesquisa/abandono

-- 1. Tabela de Perfis de Alunos (Somente pós-confirmação Asaas)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  birth_date TEXT,
  age INTEGER,
  profession TEXT,
  address JSONB,
  asaas_customer_id TEXT,
  asaas_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Tabela de Leads e Pesquisa de Abandono / Recusa (Isolada de perfis de alunos)
CREATE TABLE IF NOT EXISTS public.checkout_abandonment_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  profession TEXT,
  status TEXT NOT NULL, -- 'abandono_carrinho' | 'pagamento_recusado'
  payment_method TEXT, -- 'cartao_credito' | 'pix'
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.checkout_abandonment_leads ENABLE ROW LEVEL SECURITY;
-- Apenas service role (backend) acessa a tabela de leads de pesquisa por padrão

-- 3. Tabela de Checkouts Pendentes (Dados em trânsito aguardando confirmação do Asaas)
CREATE TABLE IF NOT EXISTS public.pending_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE NOT NULL,
  asaas_customer_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date TEXT,
  age INTEGER,
  profession TEXT,
  address JSONB,
  amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;
