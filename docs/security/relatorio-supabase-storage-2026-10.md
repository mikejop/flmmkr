# Auditoria e endurecimento Supabase / Storage

Data: 12 de outubro de 2026  
Projeto: FLMMKR / `gnqqaskurjkrllnhjygt`

## Estado da execução

Após autorização explícita, foram aplicadas remotamente as migrations de endurecimento e separação dos buckets. RLS e FORCE RLS estão ativos nas 17 tabelas públicas; as 11 tabelas internas e a tabela de analytics têm policies deny-all para `anon` e `authenticated`, sem grants de tabela para esses papéis. O Security Advisor não aponta mais tabelas públicas com RLS sem policy.

Os 117 objetos foram inventariados: 79 imagens foram copiadas para `site-public`, 36 objetos foram copiados para `members-private` e os 2 vídeos promocionais continuam no bucket `media`. Todas as cópias foram validadas por SHA-256. Após uma segunda validação dos pares, os 36 objetos antigos autorizados foram removidos de `media`. Restam nesse bucket 79 cópias públicas antigas e os 2 vídeos promocionais.

O código agora resolve as 79 imagens por um mapa para `site-public` e usa a rota autenticada para os arquivos privados da área de membros. Nenhuma alteração foi publicada na Vercel.

Pendências: o executor remoto recusou `ALTER DEFAULT PRIVILEGES` por falta de privilégio do contexto de migration; esse trecho foi retirado e requer contexto owner. O Advisor ainda aponta proteção contra senhas vazadas desativada, que exige plano/configuração elegível no Supabase Auth. A validação funcional com sessões reais e sem sessão ainda precisa ser feita.

## Tabelas internas

As 11 tabelas abaixo têm RLS ativo, nenhuma policy para o navegador e são acessadas com credencial administrativa pelo backend. O código não depende de `auth.uid()` nas tabelas: cada rota/serviço usa a sessão autenticada quando necessária e faz as operações no servidor. O `service_role` tem `BYPASSRLS=true` no projeto.

| Tabela | Acesso no código | Operações | Classificação | Policy aplicada |
|---|---|---|---|---|
| `blocked_attackers` | `honeypotService` / API | SELECT, INSERT | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `checkout_abandonment_leads` | APIs de checkout | INSERT | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `login_security_tracking` | API de login | SELECT, UPSERT, UPDATE | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `member_bg_video_sessions` | API de status do vídeo | SELECT, UPSERT | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `offer_timer_sessions` | APIs de oferta e checkout | SELECT, INSERT, UPDATE | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `payment_check_logs` | Sem referência de código ativa encontrada | Sem operações identificadas | BACKEND-ONLY; uso incerto | negar tudo para `anon`, `authenticated` |
| `payment_events` | Webhook Asaas | INSERT, SELECT, UPDATE | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `pending_checkouts` | Checkout, webhook e validação de pagamento | SELECT, UPSERT, UPDATE | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `security_audit_logs` | Serviços de auditoria | INSERT | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `user_activation_tokens` | Serviço de ativação | INSERT, SELECT, UPDATE | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |
| `user_active_sessions` | APIs de login e heartbeat | SELECT, INSERT, UPDATE | BACKEND-ONLY | negar tudo para `anon`, `authenticated` |

O Advisor encontrou inicialmente essas 11 tabelas com “RLS Enabled No Policy”. Após a aplicação, as 17 tabelas públicas têm RLS e FORCE RLS ativos e o Advisor não aponta tabelas sem policy. A migration também corrige a policy de `user_notifications` para `authenticated`, revoga `SELECT` de `anon` em `profiles` e remove duas policies de upload/alteração direta de avatars, pois esses uploads passam por API server-side.

## Inventário do bucket `media`

O inventário remoto tem 117 objetos, totalizando 25.618.572 bytes. A classificação foi cruzada com as referências encontradas no código.

| Classificação | Quantidade | Destino planejado | Critério |
|---|---:|---|---|
| Imagens referenciadas pelo site | 79 | `site-public` | Artigo DaVinci, logos de empresas, imagens de produto, fotos de autor, banners usados e pôster do vídeo promocional |
| Fundo da área de membros | 2 | `members-private` | `bg/02.webm` e `bg/02.webp`; usados pelo player dentro da área de membros |
| Não referenciados ou sem classificação segura | 34 | `members-private`, nomes aleatórios | Tratados como privados por precaução; inclui originais, capturas repetidas e fotos sem referência identificada |
| Vídeos promocionais locais | 2 | Permanecem em `media` | `assets/videos/dom-dourado.webm` e `assets/videos/dom-dourado-av1.mp4`; o primeiro é usado pela landing page. Nenhum vídeo PandaVideo foi copiado |

Os 34 objetos classificados como privados por falta de referência segura são:

```text
1 ponto de luz.webp
1 ponto.webp
assets/bg/about-mike/01.jpg
assets/bg/about-mike/03.jpg
assets/bg/about-mike/04.jpg
assets/bg/about-mike/orig/02.jpg
assets/mike-photos/02.jpg
assets/mike-photos/04.jpg
assets/produtos/color-master/offer/orig/offer-1.webp
assets/produtos/color-master/offer/orig/offer-2.webp
assets/produtos/color-master/offer/orig/offer-3.webp
assets/produtos/color-master/offer/orig/offer-4.webp
assets/produtos/color-master/offer/orig/offer-5.webp
assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.05.47.webp
assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.06.04.webp
assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.06.19.webp
assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.06.43.webp
assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.07.01.webp
assets/produtos/color-master/opengraph.jpg
banners/banner01.webp
banners/banner02.webp
celulares.webp
dois pontos de luz.webp
hero.webp
luz colorida rgb.webp
o que importa.webp
Photo-Album-1---001.webp
Photo-Album-1---002.webp
Photo-Album-1---003.webp
Photo-Album-1---005.webp
Photo-Album-1---008.webp
Photo-Album-1---009.webp
Photo-Album-1---015.webp
setup entrevista.webp
```

Os dois objetos privados `bg/02.webm` e `bg/02.webp` foram copiados, conferidos e removidos do bucket público `media` junto com os outros 34 objetos da lista aprovada. Os 79 originais públicos permanecem em `media` como cópias antigas; a aplicação agora usa os caminhos copiados em `site-public`.

## Mudanças aplicadas e arquivos de registro

- `supabase/migrations/20261012200500_harden_public_schema_and_media_buckets.sql`: policies explícitas de negação para as 11 tabelas internas, RLS forçado (o papel `service_role` mantém o bypass confirmado), correção de grants/policy identificados, criação idempotente dos buckets e retirada de permissões de upload direto. Alterações de default privileges não foram aplicadas por falta de permissão do executor.
- `supabase/migrations/20261012203100_deny_client_access_to_analytics.sql`: policy deny-all para clientes na tabela de analytics.
- `src/app/api/members/file/route.ts`: rota server-only que autentica pela sessão do cookie, revalida acesso pago, aceita apenas aliases permitidos e redireciona para URL assinada de 10 minutos. IDs de usuário vindos da query não são aceitos; falhas retornam 404 genérico.
- `src/config/privateMemberAssets.ts`: mapeia nomes lógicos a paths aleatórios no bucket privado.
- `src/components/MemberAreaApp.tsx`: o player de fundo usa a rota privada autenticada.
- `src/lib/storage.ts` e `src/config/migratedPublicAssets.ts`: resolvem os caminhos de imagens para os objetos em `site-public` sem mudar as chamadas existentes.
- `scripts/migrate-media-buckets.mjs`: copia com `upsert: false`, valida o SHA-256 e registra o mapa antigo → novo; não apaga origens.
- `scripts/remove-migrated-media-sources.mjs`: contém apenas os 36 caminhos autorizados; exige validação do SHA-256 em todos os pares antes de remover.
- `docs/security/storage-migration-map.json`: registro dos 115 objetos copiados para os buckets novos e seus caminhos de destino.
- `src/utils/supabase/admin.ts`, `src/utils/offerPricing.ts`, `src/utils/memberBgVideo.ts` e `src/utils/promoToken.ts`: marcados com `server-only` para impedir inclusão acidental em componentes de navegador.

O domínio do Supabase já está em `images.remotePatterns` no `next.config.ts`; a regra cobre URLs públicas de Storage.

## Outras verificações de segurança

- Não encontrei arquivos `.env` commitados; somente `.env.example`, com valor de exemplo. A busca não encontrou valores de chaves embutidos no código nem variáveis `NEXT_PUBLIC_*` contendo chaves administrativas.
- O segredo Asaas é validado no webhook com comparação em tempo constante antes de gravar eventos.
- Tokens de ativação usam 32 bytes aleatórios, são armazenados como SHA-256, expiram em 7 dias e são consumidos atomicamente uma vez. O link é entregue no fluxo de e-mail e não é devolvido pela resposta pública de ativação.
- Não encontrei views ou funções no schema `public`. Extensões estão em `extensions` ou `vault`, não em `public`.
- O Advisor ainda informa “Leaked Password Protection Disabled”. Na tentativa anterior, o Supabase informou que a proteção via HaveIBeenPwned está disponível nos planos Pro ou superiores. Não houve upgrade nem gasto.
- As policies de upload e update do bucket `avatars` foram removidas; a leitura pública segue disponível pelo bucket público.
- O script de cópia e o script de remoção foram executados com acesso à API do Storage. A listagem confirmou 117 objetos antes da transferência; o bucket `media` agora contém 81 objetos, incluindo os 2 vídeos promocionais que permaneceram nele.

## Consultas para validar depois da aplicação

```sql
-- RLS e FORCE RLS em todas as tabelas de public
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
order by c.relname;

-- Policies de public
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Grants de tabelas para papéis de navegador
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- Buckets e policies do Storage
select id, name, public, file_size_limit, allowed_mime_types from storage.buckets order by id;
select policyname, cmd, roles, qual, with_check
from pg_policies where schemaname = 'storage' and tablename = 'objects';
```

## Checklist manual

1. Confirmar login, heartbeat e encerramento de sessão.
2. Fazer checkout de teste e validar o webhook/ativação de conta.
3. Abrir conteúdo pago e confirmar que a verificação de pagamento continua liberando o acesso.
4. Logado e com compra ativa, carregar o vídeo e o pôster de fundo pela rota de arquivo privado.
5. Sem sessão ou sem compra ativa, confirmar que a rota privada retorna 404/nega acesso.
6. Tentar `path=../...`, path absoluto e um alias não permitido; todos devem falhar.
7. Abrir URL pública de `members-private` em janela anônima; deve falhar.
8. Conferir landing page, checkout, metadados/OG, e-mails e vídeos legados em preview.
9. Confirmar que nenhuma URL PandaVideo mudou.
10. Validar em navegador com usuário autorizado e sem sessão que os arquivos privados carregam/negam acesso conforme esperado. Os originais públicos `media/bg/02.*` já foram removidos após validação dos destinos.
