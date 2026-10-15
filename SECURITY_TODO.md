# SECURITY_TODO

Passos manuais e decisões que ficaram para você. Nada aqui foi executado contra o banco de produção.

## 1. Aplicar as migrations (nesta ordem)

1. `20261015002000_offer_timer_drop_mac_hash_ip.sql` (já aplicada a seu pedido; confira)
2. `20261015003000_webhook_hardening.sql`
3. `20261015004000_comments_profile_limits.sql`
4. `20261015005000_honeypot_temporary_blocks.sql`

As constraints da fase 5 entram como `NOT VALID` (valem para linhas novas). Para validar as antigas, depois de conferir os dados:
`ALTER TABLE public.lesson_comments VALIDATE CONSTRAINT lesson_comments_content_len;` (idem `profiles_*`).
A migration 4 libera os bloqueios permanentes antigos do honeypot.

## 2. Variáveis de ambiente (Vercel, só servidor, exceto a chave pública do Turnstile)

| Variável | Para quê |
|---|---|
| `IP_HASH_SALT` | hash do IP no timer da oferta |
| `RATE_LIMIT_HMAC_SECRET` | rate limit (checkout, comentários, honeypot). Sem ela o checkout fica sem limite (aviso no log) e os comentários recusam |
| `ASAAS_WEBHOOK_TOKEN` | opcional; se vazio usa o token do Vault |
| `PANDA_DRM_GROUP_ID`, `PANDA_DRM_SECRET` | marca d'água DRM do Panda |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile. Sem a secreta a verificação é pulada (aviso no log) |

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

- **Cookies de sessão do Supabase sem HttpOnly.** O `@supabase/ssr` no navegador lê o cookie por `document.cookie`; torná-lo HttpOnly quebra o login do cliente. Hoje são `Secure` e `SameSite=Lax`. Para HttpOnly seria preciso mover toda leitura de sessão para o servidor. Decisão sua.
- **CSP.** Aplicada com nonce em produção. Todas as páginas passaram a ser renderizadas no servidor (sem cache estático), exigência do nonce. A política paralela em Report-Only tira `'unsafe-inline'` dos estilos; acompanhe os avisos `[CSP]` nos logs da Vercel e, se ficarem limpos, troque a política principal pela estrita. Reveja a CSP se adicionar script ou domínio de terceiros.
- **`npm audit`.** Sobram vulnerabilidades só na cadeia de desenvolvimento do `prisma` (`@prisma/dev`, `hono`, `valibot`, `lodash`, `braces`, `mysql2`). Não vão para o site em produção e o código não usa Prisma. Rebaixar para 7.x não resolve e quebra o `prisma.config.ts`. Opção: remover `prisma` e `@prisma/client` se não forem usados.
- **Rate limit e Turnstile indisponíveis.** Sem `RATE_LIMIT_HMAC_SECRET` ou sem a chave secreta do Turnstile, o checkout segue sem essas travas (com aviso no log) para não perder venda. Mude para falhar fechado se preferir.
- **Coluna `mac_address` do timer saiu.** Se algum painel ou relatório a lia, ajuste.
- **Repositório público.** `mikejop/flmmkr` é público: a auditoria não achou segredo, mas considere torná-lo privado.

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
