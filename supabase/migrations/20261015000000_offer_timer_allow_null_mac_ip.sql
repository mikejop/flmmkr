-- O cronômetro da oferta já não usa MAC nem IP (guarda só o identificador da sessão).
-- Com as colunas NOT NULL, todo novo cronômetro falhava ao gravar e o checkout do Produto devolvia 503.
ALTER TABLE public.offer_timer_sessions ALTER COLUMN mac_address DROP NOT NULL;
ALTER TABLE public.offer_timer_sessions ALTER COLUMN ip DROP NOT NULL;
