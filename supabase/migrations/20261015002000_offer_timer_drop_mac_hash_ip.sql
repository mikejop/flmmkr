-- Fase 1 (segurança): o cronômetro da oferta não usa mais MAC (o navegador nunca envia) e o IP passa a ser
-- guardado só como hash (HMAC-SHA256 com IP_HASH_SALT). Idempotente: pode rodar depois da migração
-- 20261015000000, que já tinha tornado as colunas opcionais.
DROP INDEX IF EXISTS public.idx_offer_timer_mac;
ALTER TABLE public.offer_timer_sessions DROP COLUMN IF EXISTS mac_address;
ALTER TABLE public.offer_timer_sessions ALTER COLUMN ip DROP NOT NULL;
-- IPs gravados em claro antes desta mudança não são mais necessários.
UPDATE public.offer_timer_sessions SET ip = NULL WHERE ip IS NOT NULL AND ip !~ '^[a-f0-9]{64}$';
