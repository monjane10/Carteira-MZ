-- Migration: Adicionar novos tipos de notificação e política de inserção
-- 2026-05-18

-- 1. Novos valores no enum notification_type
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'GOAL_CONTRIBUTION';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'LOAN_RECEIVED';

-- 2. Política RLS para permitir que utilizadores criem as próprias notificações
CREATE POLICY "Users can create own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Adicionar tabela notifications à publicação Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
