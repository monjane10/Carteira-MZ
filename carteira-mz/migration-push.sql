-- Um registo de notificações push por dispositivo.
-- A app inseria uma nova linha em push_subscriptions sempre que abria, e cada
-- notificação era enviada uma vez por linha: o mesmo telemóvel recebia-a repetida.
-- Correr no SQL Editor do Supabase.

-- 1. Apagar duplicados, mantendo o registo mais recente de cada dispositivo
DELETE FROM push_subscriptions p
USING push_subscriptions newer
WHERE p.endpoint = newer.endpoint
  AND (newer.created_at, newer.id) > (p.created_at, p.id);

-- 2. Impedir novos duplicados
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_key ON push_subscriptions(endpoint);
