-- Empréstimos passam a reflectir-se no saldo da conta associada.
--   Emprestei (GIVEN): conta - valor; cada pagamento recebido: conta + pagamento
--   Pedi (TAKEN):      conta + valor; cada pagamento feito:    conta - pagamento
-- Os pagamentos também actualizam paid_amount/remaining_amount/status do empréstimo
-- na mesma transacção.
--
-- Requer migration-saldos.sql (função adjust_account_balance).
-- Correr no SQL Editor do Supabase logo após publicar a versão da app correspondente.
-- Na primeira execução aplica aos saldos os empréstimos e pagamentos já existentes;
-- se for corrida outra vez, não volta a aplicá-los.

CREATE OR REPLACE FUNCTION loan_direction(p_type loan_type)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_type WHEN 'GIVEN' THEN -1 ELSE 1 END::NUMERIC;
$$;

CREATE OR REPLACE FUNCTION loan_payments_total(p_loan_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(SUM(amount), 0) FROM loan_payments WHERE loan_id = p_loan_id;
$$;

-- 1. Aplicar empréstimos já existentes (só se os triggers ainda não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'loans_balance') THEN
    UPDATE accounts a
    SET balance = a.balance + t.delta, updated_at = NOW()
    FROM (
      SELECT l.account_id,
             SUM(loan_direction(l.type) * (l.total_amount - loan_payments_total(l.id))) AS delta
      FROM loans l
      WHERE l.account_id IS NOT NULL
      GROUP BY l.account_id
    ) t
    WHERE a.id = t.account_id AND t.delta <> 0;

    -- Alinhar o valor pago com os pagamentos registados
    UPDATE loans l
    SET paid_amount = p.total,
        remaining_amount = GREATEST(0, l.total_amount - p.total),
        status = CASE
          WHEN p.total >= l.total_amount THEN 'PAID'::loan_status
          WHEN p.total > 0 THEN 'PARTIALLY_PAID'::loan_status
          ELSE l.status
        END
    FROM (SELECT id, loan_payments_total(id) AS total FROM loans) p
    WHERE l.id = p.id AND l.paid_amount IS DISTINCT FROM p.total;
  END IF;
END;
$$;

-- 2. Empréstimos: criar / editar
CREATE OR REPLACE FUNCTION trg_loans_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  paid NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM adjust_account_balance(NEW.account_id, loan_direction(NEW.type) * NEW.total_amount);
  ELSE
    paid := loan_payments_total(NEW.id);
    PERFORM adjust_account_balance(OLD.account_id, -loan_direction(OLD.type) * (OLD.total_amount - paid));
    PERFORM adjust_account_balance(NEW.account_id, loan_direction(NEW.type) * (NEW.total_amount - paid));
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS loans_balance ON loans;
CREATE TRIGGER loans_balance
  AFTER INSERT OR UPDATE OF account_id, type, total_amount ON loans
  FOR EACH ROW EXECUTE FUNCTION trg_loans_balance();

-- 3. Empréstimos: apagar. BEFORE para ainda ver os pagamentos; os pagamentos apagados
--    em cascata a seguir já não encontram o empréstimo e não mexem no saldo.
CREATE OR REPLACE FUNCTION trg_loans_balance_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM adjust_account_balance(
    OLD.account_id,
    -loan_direction(OLD.type) * (OLD.total_amount - loan_payments_total(OLD.id))
  );
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS loans_balance_delete ON loans;
CREATE TRIGGER loans_balance_delete
  BEFORE DELETE ON loans
  FOR EACH ROW EXECUTE FUNCTION trg_loans_balance_delete();

-- 4. Pagamentos: saldo da conta do empréstimo + valores pagos do empréstimo
CREATE OR REPLACE FUNCTION trg_loan_payments_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  l loans%ROWTYPE;
  v_loan_id UUID;
  delta NUMERIC;
  paid NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_loan_id := NEW.loan_id; delta := NEW.amount;
  ELSIF TG_OP = 'DELETE' THEN
    v_loan_id := OLD.loan_id; delta := -OLD.amount;
  ELSE
    v_loan_id := NEW.loan_id; delta := NEW.amount - OLD.amount;
  END IF;

  SELECT * INTO l FROM loans WHERE id = v_loan_id;
  IF NOT FOUND THEN
    RETURN NULL; -- empréstimo a ser apagado: o trigger do empréstimo já tratou do saldo
  END IF;

  PERFORM adjust_account_balance(l.account_id, -loan_direction(l.type) * delta);

  paid := loan_payments_total(l.id);
  UPDATE loans
  SET paid_amount = paid,
      remaining_amount = GREATEST(0, l.total_amount - paid),
      status = CASE
        WHEN paid >= l.total_amount THEN 'PAID'::loan_status
        WHEN paid > 0 THEN 'PARTIALLY_PAID'::loan_status
        ELSE 'PENDING'::loan_status
      END
  WHERE id = l.id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS loan_payments_balance ON loan_payments;
CREATE TRIGGER loan_payments_balance
  AFTER INSERT OR DELETE OR UPDATE OF amount ON loan_payments
  FOR EACH ROW EXECUTE FUNCTION trg_loan_payments_balance();
