-- ============================================================
-- PUSH SUBSCRIPTIONS — Notificações Push no Dispositivo
-- ============================================================
-- Executa no SQL Editor do Supabase (após o schema principal)
-- ============================================================

-- 1. TABELA push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- 2. ROW LEVEL SECURITY
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Cada utilizador vê/apenas as suas subscrições
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Para a API do servidor conseguir enviar pushes (bypass RLS com service_role)
-- Nota: a API route usa a chave de serviço (service_role), não precisa destas policies
