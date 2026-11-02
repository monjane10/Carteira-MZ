-- A app passa a usar apenas meticais (MZN).
-- As contas e perfis antigos marcados como USD já eram somados como MZN em todos
-- os totais; aqui só se corrige a etiqueta da moeda, os valores não mudam.
-- Correr no SQL Editor do Supabase.

UPDATE accounts SET currency = 'MZN' WHERE currency IS DISTINCT FROM 'MZN';
UPDATE profiles SET currency = 'MZN' WHERE currency IS DISTINCT FROM 'MZN';
