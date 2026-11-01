-- Notificações com link: ao clicar abrem um modal com uma mensagem (details) e botões (links).
alter table public.user_notifications
  add column if not exists details text,
  add column if not exists links jsonb;

comment on column public.user_notifications.links is 'Lista de botões do modal: [{ "label": "...", "url": "https://..." }].';

-- Aviso já enviado de Suporte e Canal FLMMKR passa a ter os links.
update public.user_notifications
set details = 'Agora a área de membros do Color Master tem suporte direto pelo WhatsApp. Se tiver qualquer dúvida ou problema, é só chamar. Também criamos o Canal FLMMKR no WhatsApp, com avisos de aulas novas, bônus e novidades. Os dois ficam sempre disponíveis na sua foto de perfil, no canto de cima.',
    links = jsonb_build_array(
      jsonb_build_object('label', 'Entrar no Canal FLMMKR', 'url', 'https://whatsapp.com/channel/0029Vb9BGV84yltRntw3kU3C'),
      jsonb_build_object('label', 'Falar com o suporte', 'url', 'https://wa.me/mkeoliver?text=' || 'Ol%C3%A1!%20Preciso%20de%20ajuda%20na%20%C3%A1rea%20de%20membros.')
    )
where type = 'system' and title = 'Suporte e Canal FLMMKR no WhatsApp';
