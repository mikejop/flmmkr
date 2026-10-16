# SECURITY_TODO

Passos manuais e decisões que ficaram para você. Nada aqui foi executado contra o banco de produção.

## 1. Aplicar as migrations (nesta ordem)

1. `20261015002000_offer_timer_drop_mac_hash_ip.sql` (já aplicada a seu pedido; confira)
2. `20261015003000_webhook_hardening.sql`
3. `20261015004000_comments_profile_limits.sql`
4. `20261015005000_honeypot_temporary_blocks.sql`
5. `20261015006000_rls_initplan_and_indexes.sql` (índices + políticas RLS com `(select auth.uid())`; idempotente, testada num Postgres 16 local descartável)

As constraints da fase 5 entram como `NOT VALID` (valem para linhas novas). Para validar as antigas, depois de conferir os dados:
`ALTER TABLE public.lesson_comments VALIDATE CONSTRAINT lesson_comments_content_len;` (idem `profiles_*`).
A migration 4 libera os bloqueios permanentes antigos do honeypot.

## 2. Variáveis de ambiente (Vercel, só servidor, exceto a chave pública do Turnstile)

| Variável | Para quê |
|---|---|
| `IP_HASH_SALT` | hash do IP no timer da oferta |
| `RATE_LIMIT_HMAC_SECRET` | rate limit (checkout, comentários, honeypot, revalidate). **Obrigatória em produção** (o build falha sem ela) |
| `ASAAS_WEBHOOK_TOKEN` | opcional; se vazio usa o token do Vault |
| `PANDA_DRM_GROUP_ID`, `PANDA_DRM_SECRET` | marca d'água DRM do Panda |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile. **Obrigatórias em produção**: sem elas o build falha e, em runtime, o checkout responde 503 |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis: cache de acesso, tokens DRM, URLs assinadas e rate limit. **Obrigatórias em produção** (o build falha sem elas) |
| `REVALIDATE_SECRET` | segredo do `POST /api/revalidate`. Sem ele a rota responde 503 |
| `DATABASE_URL` (opcional) | só se alguma função usar conexão direta ao Postgres: use o pooler Supavisor, porta 6543, modo transaction |

Gere cada segredo com `openssl rand -hex 32`. Nenhum segredo usa `NEXT_PUBLIC_`.

## 3. Painéis

**Supabase**
- Authentication > Providers > Email: desligar "Allow new users to sign up" (contas só nascem pelo webhook).
- Authentication: confirmar que o Site URL e os redirects são só `flmmkr.site`.
- Depois de aplicar as migrations, rodar o advisor de segurança.

**Panda Video**
- Ativar DRM no grupo e anotar Group ID e Secret.
- Restringir os vídeos ao domínio `flmmkr.site` (allowlist de domínios).
- Desativar download/compartilhamento público e o link direto do HLS.

**Asaas**
- Webhook: configurar o token de autenticação igual ao `ASAAS_WEBHOOK_TOKEN` (ou ao do Vault) e marcar os eventos de pagamento recebido, estornado, chargeback e removido.

**Cloudflare**
- Criar um widget Turnstile para `flmmkr.site` e copiar as duas chaves.

## 4. Decisões e pendências

- **Cookies de sessão do Supabase seguem sem `HttpOnly` (decisão tomada).** Hoje são `Secure` e `SameSite=Lax`. Melhoria futura para torná-los HttpOnly:
  1. Trocar o `createBrowserClient` por um cliente que não toca em cookies de sessão no navegador (`src/utils/supabase/client.ts` e todos os `supabase.auth.*` usados em componentes).
  2. Fazer login, logout e refresh só por rotas do servidor (`/api/auth/*`), que gravam os cookies com `httpOnly: true` (já existe `writeSupabaseSessionCookies`).
  3. Entregar ao navegador apenas o que ele precisa (id, e-mail, nome) por uma rota `/api/auth/me`, sem token.
  4. Remover do cliente qualquer uso de `onAuthStateChange`/`getSession` e trocar por essa rota.
  5. Testar login, logout, expiração, "primeiro acesso" e a troca de senha.
- **CSP híbrida.** Área de membros, login e fluxo de senha usam CSP com nonce (definida no `proxy`, renderização dinâmica). As páginas públicas são estáticas e recebem a CSP do `next.config.ts`. **Desvio do pedido:** nessas páginas o `script-src` precisou de `'unsafe-inline'`. O Next injeta scripts inline com os dados de cada página (`self.__next_f.push`), que mudam por rota e não têm nonce nem hash numa página estática. Testei só com `'self'` e SRI: a página não hidratou. O SRI (`experimental.sri`) está ligado e protege os chunks externos. As páginas públicas não exibem conteúdo de usuário (comentários e perfil ficam na área de membros, com nonce). Para tirar o `'unsafe-inline'` seria preciso gerar os hashes dos scripts inline depois do build, o que o Next ainda não faz sozinho.
- **Checkout dentro da página pública.** O checkout é um modal da landing (estática), então roda sob a CSP pública, que já libera Turnstile e Asaas.
- **Proxy só onde importa.** O `matcher` cobre área de membros, login, `/api/*` e as rotas-armadilha do honeypot. As páginas públicas não passam pelo proxy (continuam estáticas). Efeito: a checagem de IP bloqueado e o filtro de SQL injection não rodam mais em páginas públicas. Se adicionar uma armadilha em `HONEYPOT_PATHS`, copie para o `matcher` de `src/proxy.ts`.
- **Cache de acesso.** Só acessos aprovados vão para o Redis (`access:<userId>`, 300 s). Negativas não são guardadas, então pagamento novo libera na hora. Estorno, chargeback e exclusão apagam `access:*`, `drm:<userId>:*` e `signed:<userId>:*` na hora; se o Redis falhar nessa limpeza, o webhook responde erro e o Asaas repete o evento.
- **Rate limit.** Principal no Upstash; reserva na função do Postgres. Se os dois falharem, o checkout é recusado (503) em produção e libera só fora dela.
- **Turnstile fora do ar.** Com chave configurada e a Cloudflare em timeout ou 5xx, o checkout libera e registra no log; o rate limit continua valendo.
- **Service worker.** `public/sw.js` guarda cache no navegador do aluno. Não é CDN nem proxy; confirme que ele não guarda respostas de `/api/*`.
- **`npm audit`.** Sem o Prisma sobraram 5 avisos altos, todos na ferramenta de lint (`braces` via `eslint-config-next`). Não vão para produção; o conserto automático exige rebaixar o `eslint-config-next` para a 14, então ficou de fora.
- **Coluna `mac_address` do timer saiu.** Se algum painel ou relatório a lia, ajuste.
- **Repositório público.** `mikejop/flmmkr` é público: a auditoria não achou segredo, mas considere torná-lo privado.
- **Migrations antigas.** `20261005_add_profile_nickname.sql` falha num banco novo (usa `first_name` antes de a coluna existir). Não afeta o banco atual; vale corrigir a ordem antes de recriar o banco do zero.
- **Opcional:** se quiser invalidar o cache de metadados do Panda depois de trocar um vídeo, chame `POST /api/revalidate` com `{"tag":"panda-meta"}`.

## 5. Como testar cada correção

1. **Timer da oferta:** abra a landing em aba anônima; o timer inicia. Recarregue: continua o mesmo. Em `offer_timer_sessions` não há mais coluna MAC e o IP é um hash.
2. **Next.js:** `npm ls next` mostra 16.4.1; a resposta não traz `X-Powered-By`.
3. **Webhook:** `curl -X POST https://flmmkr.site/api/webhooks/asaas` sem token dá 401; com token e um `paymentId` inventado não libera acesso. No Asaas, estornar um pagamento de teste remove o acesso do aluno.
4. **Vídeos:** sem login, `GET /api/content/panda-info` dá 401/403; o HTML do site não contém IDs de vídeo. Logado e pago, o vídeo mostra nome e e-mail como marca d'água.
5. **Comentários e perfil:** usuário sem pagamento recebe 403 ao comentar; mais de 2000 caracteres ou mais de 5 menções dá 400; o 6º comentário em 1 minuto dá 429; o GET não traz `user_id`; avatar com URL externa é recusado.
6. **Checkout:** com Turnstile configurado, enviar sem token dá 403; a 6ª tentativa em 15 minutos (mesmo IP ou e-mail) dá 429.
7. **Honeypot:** `curl /wp-admin` (GET) dá 404 nas duas primeiras vezes e bloqueia por 1 hora na terceira em 10 minutos; `curl -X POST /wp-login.php` bloqueia na hora. Imagem ou script apontando para essas rotas não bloqueia.
8. **CSP:** na aba Rede a resposta traz `Content-Security-Policy` e `Content-Security-Policy-Report-Only`; o console não mostra bloqueios na landing, no checkout e nas aulas.
9. **Erros genéricos:** forçar um erro (ex.: corpo inválido) não devolve mensagem técnica do banco.
10. **Revogação com cache:** veja o passo a passo abaixo.
11. **Cabeçalhos de cache:** `scripts/check-cache.sh https://flmmkr.site` (páginas públicas dão HIT na 2ª; membros e APIs pessoais dão `private, no-store`).
12. **Revalidação:** `curl -X POST https://flmmkr.site/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET" -H "Content-Type: application/json" -d '{"tag":"panda-meta"}'` responde `{"revalidated":true}`; sem o cabeçalho, 401; o 11º pedido em 1 minuto, 429.

## 6. Testar a revogação de acesso (reembolso com cache)

1. Com um aluno de teste pago, entre na área de membros e abra uma aula com vídeo e um arquivo privado. Isso grava no Redis `access:<id>`, `drm:<id>:<videoId>` e `signed:<id>:...` (confira no console do Upstash: `KEYS *<id>*`).
2. No Asaas, estorne o pagamento de teste (ou envie o evento `PAYMENT_REFUNDED` do painel de testes).
3. Logo depois do webhook responder 200: as três chaves do aluno somem do Redis e `profiles.has_access` fica `false`.
4. Sem esperar os 5 minutos do cache, recarregue a área de membros: `/api/auth/verify-access` devolve 403, `/api/content/panda-info` e `/api/comments` devolvem 403 e `/api/members/file` dá 404.
5. Teste a falha: apague `UPSTASH_REDIS_REST_TOKEN` no ambiente de teste e reenvie o estorno. O webhook deve responder 500 (o Asaas tenta de novo) e o acesso só some do banco; com o Redis de volta, a repetição do evento limpa as chaves.
