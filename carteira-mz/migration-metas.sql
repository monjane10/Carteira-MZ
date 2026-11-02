-- Progresso das metas actualizado atomicamente a cada contribuição.
-- Antes a app lia current_amount, somava e gravava: duas contribuições ao mesmo
-- tempo podiam perder-se. O valor actual continua editável à mão; o trigger soma
-- (ou subtrai, ao apagar) cada contribuição a esse valor.
-- Correr no SQL Editor do Supabase. Pode ser corrida antes ou depois de publicar.

CREATE OR REPLACE FUNCTION trg_goal_contributions_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_goal_id UUID;
  delta NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_goal_id := NEW.goal_id; delta := NEW.amount;
  ELSIF TG_OP = 'DELETE' THEN
    v_goal_id := OLD.goal_id; delta := -OLD.amount;
  ELSE
    v_goal_id := NEW.goal_id; delta := NEW.amount - OLD.amount;
  END IF;

  UPDATE goals g
  SET current_amount = LEAST(g.target_amount, GREATEST(0, g.current_amount + delta)),
      status = CASE
        WHEN g.status = 'CANCELLED' THEN g.status
        WHEN g.current_amount + delta >= g.target_amount THEN 'COMPLETED'::goal_status
        ELSE 'ACTIVE'::goal_status
      END
  WHERE g.id = v_goal_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS goal_contributions_progress ON goal_contributions;
CREATE TRIGGER goal_contributions_progress
  AFTER INSERT OR DELETE OR UPDATE OF amount ON goal_contributions
  FOR EACH ROW EXECUTE FUNCTION trg_goal_contributions_progress();
