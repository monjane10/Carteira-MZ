-- ============================================================
-- ESQUEMA COMPLETO CARTEIRA MZ — Supabase / PostgreSQL
-- ============================================================
-- Gera este ficheiro e executa no SQL Editor do Supabase
-- ============================================================

-- ============================================================
-- 1. EXTENSÕES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. ENUMS
-- ============================================================

CREATE TYPE account_type AS ENUM (
  'BANK',
  'MOBILE_MONEY',
  'CASH',
  'SAVINGS',
  'INVESTMENT',
  'OTHER'
);

CREATE TYPE transaction_type AS ENUM (
  'INCOME',
  'EXPENSE',
  'TRANSFER',
  'ADJUSTMENT',
  'LOAN_GIVEN',
  'LOAN_TAKEN',
  'LOAN_PAYMENT'
);

CREATE TYPE loan_type AS ENUM ('GIVEN', 'TAKEN');

CREATE TYPE loan_status AS ENUM (
  'PENDING',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE'
);

CREATE TYPE budget_period AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

CREATE TYPE recurring_frequency AS ENUM (
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY'
);

CREATE TYPE goal_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TYPE notification_type AS ENUM (
  'BUDGET_LIMIT',
  'GOAL_COMPLETED',
  'GOAL_CONTRIBUTION',
  'LOW_BALANCE',
  'LOAN_DUE',
  'LOAN_RECEIVED',
  'SYSTEM'
);

-- ============================================================
-- 3. TABELAS
-- ============================================================

-- 3.1. Profiles (estende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150),
  email VARCHAR(255),
  phone VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'MZN',
  timezone VARCHAR(100) DEFAULT 'Africa/Maputo',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2. Financial Institutions
CREATE TABLE financial_institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type account_type NOT NULL,
  icon TEXT,
  color VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3. Accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES financial_institutions(id),
  name VARCHAR(100) NOT NULL,
  type account_type NOT NULL,
  currency VARCHAR(10) DEFAULT 'MZN',
  balance NUMERIC(15,2) DEFAULT 0,
  initial_balance NUMERIC(15,2) DEFAULT 0,
  color VARCHAR(20),
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4. Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type transaction_type NOT NULL,
  icon TEXT,
  color VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5. Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  type transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  reference_code VARCHAR(100),
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_recurring BOOLEAN DEFAULT false,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6. Transfers
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES accounts(id),
  to_account_id UUID NOT NULL REFERENCES accounts(id),
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  fee NUMERIC(15,2) DEFAULT 0,
  description TEXT,
  transfer_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7. Loans
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  person_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  type loan_type NOT NULL,
  total_amount NUMERIC(15,2) NOT NULL,
  paid_amount NUMERIC(15,2) DEFAULT 0,
  remaining_amount NUMERIC(15,2) NOT NULL,
  interest_amount NUMERIC(15,2) DEFAULT 0,
  description TEXT,
  due_date DATE,
  status loan_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8. Loan Payments
CREATE TABLE loan_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9. Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE,
  color VARCHAR(20),
  icon TEXT,
  status goal_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.10. Goal Contributions
CREATE TABLE goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  amount NUMERIC(15,2) NOT NULL,
  contribution_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.11. Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  amount_limit NUMERIC(15,2) NOT NULL,
  period budget_period NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.12. Recurring Transactions
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  category_id UUID REFERENCES categories(id),
  type transaction_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  frequency recurring_frequency NOT NULL,
  start_date DATE NOT NULL,
  next_execution DATE NOT NULL,
  last_execution DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.13. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.14. Attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. INDEXES
-- ============================================================

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_transfers_user ON transfers(user_id);
CREATE INDEX idx_transfers_from ON transfers(from_account_id);
CREATE INDEX idx_transfers_to ON transfers(to_account_id);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_payments_loan ON loan_payments(loan_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_recurring_user ON recurring_transactions(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================================
-- 5. TRIGGER: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON accounts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_loans_updated_at
  BEFORE UPDATE ON loans FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_goals_updated_at
  BEFORE UPDATE ON goals FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_budgets_updated_at
  BEFORE UPDATE ON budgets FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE financial_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS POLICIES
-- ============================================================

-- Profiles: cada um vê/edit apenas o seu
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Financial Institutions (dados de referência — toda a gente autenticada pode ler)
CREATE POLICY "Anyone can view financial institutions"
  ON financial_institutions FOR SELECT
  USING (true);

-- Accounts
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can view own or default categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Transfers
CREATE POLICY "Users can view own transfers"
  ON transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transfers"
  ON transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Loans
CREATE POLICY "Users can view own loans"
  ON loans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own loans"
  ON loans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
  ON loans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans"
  ON loans FOR DELETE
  USING (auth.uid() = user_id);

-- Loan Payments
CREATE POLICY "Users can view own loan payments"
  ON loan_payments FOR SELECT
  USING (loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own loan payments"
  ON loan_payments FOR INSERT
  WITH CHECK (loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid()));

-- Goals
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- Goal Contributions
CREATE POLICY "Users can view own goal contributions"
  ON goal_contributions FOR SELECT
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

CREATE POLICY "Users can create own goal contributions"
  ON goal_contributions FOR INSERT
  WITH CHECK (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));

-- Budgets
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Recurring Transactions
CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recurring transactions"
  ON recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Attachments
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attachments"
  ON attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. SEED DATA — Instituições Financeiras
-- ============================================================

INSERT INTO financial_institutions (name, type, icon, color) VALUES
  ('BCI', 'BANK', 'building-bank', '#F59E0B'),
  ('BIM', 'BANK', 'building-bank', '#EC4899'),
  ('ABSA', 'BANK', 'building-bank', '#3B82F6'),
  ('Standard Bank', 'BANK', 'building-bank', '#64748B'),
  ('Millennium BIM', 'BANK', 'building-bank', '#EC4899'),
  ('M-Pesa', 'MOBILE_MONEY', 'smartphone', '#10B981'),
  ('e-Mola', 'MOBILE_MONEY', 'smartphone', '#F59E0B'),
  ('mKesh', 'MOBILE_MONEY', 'smartphone', '#0D9488');

-- ============================================================
-- 9. SEED DATA — Categorias Padrão (globais, user_id = NULL)
-- ============================================================

INSERT INTO categories (name, type, icon, color, is_default) VALUES
  -- Receitas
  ('Salário', 'INCOME', 'wallet', '#10B981', true),
  ('Freelance', 'INCOME', 'briefcase', '#3B82F6', true),
  ('Investimentos', 'INCOME', 'trending-up', '#8B5CF6', true),
  ('Vendas', 'INCOME', 'shopping-bag', '#F59E0B', true),
  ('Outras Receitas', 'INCOME', 'plus-circle', '#64748B', true),

  -- Despesas
  ('Alimentação', 'EXPENSE', 'shopping-cart', '#0F172A', true),
  ('Transporte', 'EXPENSE', 'car', '#1E293B', true),
  ('Moradia', 'EXPENSE', 'home', '#334155', true),
  ('Saúde', 'EXPENSE', 'heart-pulse', '#EF4444', true),
  ('Educação', 'EXPENSE', 'book-open', '#3B82F6', true),
  ('Lazer', 'EXPENSE', 'film', '#F59E0B', true),
  ('Utilidades', 'EXPENSE', 'zap', '#475569', true),
  ('Vestuário', 'EXPENSE', 'shirt', '#EC4899', true),
  ('Outras Despesas', 'EXPENSE', 'minus-circle', '#64748B', true);

-- ============================================================
-- 10. FUNÇÃO AUXILIAR: Criar perfil após registo
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, currency, timezone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'MZN',
    'Africa/Maputo'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger automático: quando um user se regista, cria o perfil
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 11. FUNÇÃO: Saldo total do utilizador
-- ============================================================

CREATE OR REPLACE FUNCTION get_total_balance(p_user_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(balance), 0)
  FROM accounts
  WHERE user_id = p_user_id AND is_active = true;
$$ LANGUAGE SQL;

-- ============================================================
-- 9. SUPABASE REALTIME — Publicar notificações
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
