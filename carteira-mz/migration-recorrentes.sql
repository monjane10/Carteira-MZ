-- Executa as transacções recorrentes vencidas de forma atómica no servidor.
-- Evita duplicados (bloqueio da linha com FOR UPDATE SKIP LOCKED), lança todos os
-- períodos em atraso. O saldo da conta é actualizado pelo trigger de transactions
-- (migration-saldos.sql), na mesma transacção.
-- Correr no SQL Editor do Supabase, depois de migration-saldos.sql.

CREATE OR REPLACE FUNCTION recurring_next_date(
  p_start DATE,
  p_current DATE,
  p_frequency recurring_frequency
) RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  months_since_start INT;
BEGIN
  CASE p_frequency
    WHEN 'DAILY' THEN RETURN p_current + 1;
    WHEN 'WEEKLY' THEN RETURN p_current + 7;
    WHEN 'MONTHLY', 'YEARLY' THEN
      -- Ancorado na data de início para manter o dia do mês (ex.: 31 → 28/29 → 31)
      months_since_start := (EXTRACT(YEAR FROM p_current) - EXTRACT(YEAR FROM p_start)) * 12
        + (EXTRACT(MONTH FROM p_current) - EXTRACT(MONTH FROM p_start));
      IF p_frequency = 'MONTHLY' THEN
        RETURN (p_start + make_interval(months => months_since_start + 1))::DATE;
      END IF;
      RETURN (p_start + make_interval(years => months_since_start / 12 + 1))::DATE;
  END CASE;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION execute_due_recurring_transactions()
RETURNS TABLE (recurring_id UUID, description TEXT, amount NUMERIC, executions INT)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  r recurring_transactions%ROWTYPE;
  today DATE := (NOW() AT TIME ZONE 'Africa/Maputo')::DATE;
  run_date DATE;
  last_run DATE;
  runs INT;
BEGIN
  FOR r IN
    SELECT * FROM recurring_transactions rt
    WHERE rt.user_id = auth.uid()
      AND rt.is_active
      AND rt.next_execution <= today
    FOR UPDATE SKIP LOCKED
  LOOP
    run_date := r.next_execution;
    last_run := NULL;
    runs := 0;

    WHILE run_date <= today AND runs < 400 LOOP
      INSERT INTO transactions (user_id, account_id, category_id, type, amount, description, transaction_date, is_recurring)
      VALUES (
        r.user_id,
        r.account_id,
        r.category_id,
        r.type,
        r.amount,
        '[Recorrente] ' || COALESCE(r.description, r.type::TEXT),
        (run_date + TIME '12:00') AT TIME ZONE 'Africa/Maputo',
        true
      );
      last_run := run_date;
      runs := runs + 1;
      run_date := recurring_next_date(r.start_date, run_date, r.frequency);
    END LOOP;

    UPDATE recurring_transactions
    SET next_execution = run_date, last_execution = last_run, updated_at = NOW()
    WHERE id = r.id;

    recurring_id := r.id;
    description := r.description;
    amount := r.amount;
    executions := runs;
    RETURN NEXT;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION execute_due_recurring_transactions() TO authenticated;
