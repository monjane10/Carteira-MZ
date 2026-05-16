-- Adiciona coluna role à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Cria o utilizador admin no auth (SE NÃO EXISTIR ainda)
-- NOTA: Isto requer a service_role key. Alternativa: usar o SQL Editor do dashboard.
-- O trigger on_auth_user_created vai criar o profile automaticamente.
-- Depois de criar o user, executa:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@carteiramz.co.mz';
