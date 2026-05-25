-- Adiciona DELETE policies em falta para permitir eliminacao de contas com movimentos associados

-- Transfers: faltavam policies de DELETE
CREATE POLICY "Users can delete own transfers"
  ON transfers FOR DELETE
  USING (auth.uid() = user_id);

-- Loan Payments: faltavam policies de DELETE
CREATE POLICY "Users can delete own loan payments"
  ON loan_payments FOR DELETE
  USING (loan_id IN (SELECT id FROM loans WHERE user_id = auth.uid()));

-- Goal Contributions: faltavam policies de DELETE
CREATE POLICY "Users can delete own goal contributions"
  ON goal_contributions FOR DELETE
  USING (goal_id IN (SELECT id FROM goals WHERE user_id = auth.uid()));
