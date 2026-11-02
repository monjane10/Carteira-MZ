-- Saldos das contas actualizados pela base de dados (triggers), de forma atómica.
-- Cada INSERT/UPDATE/DELETE em transactions, transfers e goal_contributions ajusta
-- accounts.balance na mesma transacção, com "balance = balance + delta" (sem
-- leituras intermédias, por isso sem perdas em operações simultâneas).
--
-- IMPORTANTE: correr no SQL Editor do Supabase logo após publicar a versão da app
-- que deixou de actualizar saldos no cliente. Os saldos actuais não são alterados;
-- os triggers só afectam operações feitas a partir de agora.
-- Os triggers são SECURITY INVOKER: o RLS de accounts continua a aplicar-se.

CREATE OR REPLACE FUNCTION transaction_balance_delta(p_type transaction_type, p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_type
    WHEN 'INCOME' THEN p_amount
    WHEN 'EXPENSE' THEN -p_amount
    WHEN 'LOAN_GIVEN' THEN -p_amount
    WHEN 'LOAN_TAKEN' THEN p_amount
    WHEN 'ADJUSTMENT' THEN p_amount
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION adjust_account_balance(p_account_id UUID, p_delta NUMERIC)
RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE accounts
  SET balance = balance + p_delta, updated_at = NOW()
  WHERE id = p_account_id AND p_delta <> 0;
$$;

-- Transacções
CREATE OR REPLACE FUNCTION trg_transactions_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM adjust_account_balance(OLD.account_id, -transaction_balance_delta(OLD.type, OLD.amount));
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM adjust_account_balance(NEW.account_id, transaction_balance_delta(NEW.type, NEW.amount));
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS transactions_balance ON transactions;
CREATE TRIGGER transactions_balance
  AFTER INSERT OR DELETE OR UPDATE OF account_id, type, amount ON transactions
  FOR EACH ROW EXECUTE FUNCTION trg_transactions_balance();

-- Transferências (a taxa sai da conta de origem)
CREATE OR REPLACE FUNCTION trg_transfers_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM adjust_account_balance(OLD.from_account_id, OLD.amount + COALESCE(OLD.fee, 0));
    PERFORM adjust_account_balance(OLD.to_account_id, -OLD.amount);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM adjust_account_balance(NEW.from_account_id, -(NEW.amount + COALESCE(NEW.fee, 0)));
    PERFORM adjust_account_balance(NEW.to_account_id, NEW.amount);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS transfers_balance ON transfers;
CREATE TRIGGER transfers_balance
  AFTER INSERT OR DELETE OR UPDATE OF from_account_id, to_account_id, amount, fee ON transfers
  FOR EACH ROW EXECUTE FUNCTION trg_transfers_balance();

-- Contribuições para metas (debitam a conta; ao apagar, o valor volta à conta)
CREATE OR REPLACE FUNCTION trg_goal_contributions_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.account_id IS NOT NULL THEN
    PERFORM adjust_account_balance(OLD.account_id, OLD.amount);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.account_id IS NOT NULL THEN
    PERFORM adjust_account_balance(NEW.account_id, -NEW.amount);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS goal_contributions_balance ON goal_contributions;
CREATE TRIGGER goal_contributions_balance
  AFTER INSERT OR DELETE OR UPDATE OF account_id, amount ON goal_contributions
  FOR EACH ROW EXECUTE FUNCTION trg_goal_contributions_balance();

-- A edição de transferências precisava de uma policy de UPDATE que não existia
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'transfers' AND cmd = 'UPDATE'
  ) THEN
    CREATE POLICY "Users can update own transfers"
      ON transfers FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;
