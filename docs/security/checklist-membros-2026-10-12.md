# Checklist de segurança da área de membros

Auditoria feita em 12 de outubro de 2026, comparando o checklist recebido com o código, migrations locais e estado remoto acessível do Supabase. A migration e a transferência de Storage autorizadas foram aplicadas; nada foi publicado na Vercel.

## Banco e Storage

- **RLS em todas as tabelas públicas — feito.** O estado remoto confirmou RLS ativo nas 17 tabelas públicas.
- **Bloqueio explícito nas 11 tabelas internas — feito no banco remoto.** RLS está forçado, há policies deny-all para `anon`/`authenticated` e esses papéis não têm grants de tabela.
- **Policies por proprietário — feito no banco.** A migration restringiu as policies de notificação a `authenticated`, adicionou `WITH CHECK` de ownership e revogou leitura anônima de perfis.
- **Policies `USING (true)` — feito no banco.** A policy redundante de `service_role` foi removida de `site_traffic_analytics`, que agora tem deny-all explícito para papéis de navegador.
- **Views e funções SECURITY DEFINER públicas — não se aplica.** A consulta ao schema `public` não encontrou views ou funções.
- **Security Advisor — concluído para RLS.** Os 11 avisos `RLS Enabled No Policy` foram resolvidos. Resta `Leaked Password Protection Disabled`, recurso de Auth que requer plano elegível/configuração no painel.
- **Performance Advisor — parcial.** A migration adicionou os 2 índices de FK, otimizou as policies e removeu o índice duplicado. Índices não usados continuam pendentes de análise antes de qualquer remoção.
- **Buckets separados — feito.** `site-public` (público) e `members-private` (privado) foram criados. Os 79 objetos públicos copiados e 36 objetos privados passaram por comparação SHA-256. Os 36 originais privados foram removidos de `media`; restam 79 cópias antigas públicas e 2 vídeos promocionais locais nesse bucket.
- **Policies de escrita no Storage — feito.** Policies diretas de INSERT/UPDATE em `avatars` foram removidas. O bucket privado tem policy deny-all para clientes; a rota server-side assina URLs após autenticar e verificar acesso.
- **Entrega privada — configurada no código e no Storage.** Os arquivos de fundo já apontam para a rota autenticada e os originais públicos foram removidos. A rota ainda precisa ser verificada com uma sessão real e sem sessão.
- **Tamanho e MIME — feito para os novos buckets.** `site-public` permite imagens de até 10 MB; `members-private` até 50 MB com MIME allowlist.

## Chaves, autenticação e pagamentos

- **Chaves administrativas no cliente — feito no código auditado.** A chave secreta é usada em módulos de servidor e não foi encontrada em `NEXT_PUBLIC_*`. `.env*` está ignorado pelo Git; `.env.local` não está versionado e `.env.example` contém placeholders.
- **Histórico de chaves — sem vazamento identificado na busca anterior; rotação não verificável.** Se uma chave real já foi exposta em outro lugar, ela ainda precisa ser rotacionada no provedor.
- **Segredos por ambiente Vercel / webhook — não verificado.** Não há acesso conectado às configurações da Vercel para confirmar Preview e Production; as chaves de provedores estão previstas no Supabase Vault.
- **Validação de sessão e compra — parcial.** Rotas protegidas usam identidade obtida da sessão server-side e verificam o pagamento. O proxy faz um primeiro bloqueio da área, mas a autorização real ocorre novamente em páginas/APIs.
- **Tokens de ativação — feito e endurecido nesta alteração.** Token aleatório de 32 bytes, hash SHA-256 no banco, uso único e expiração reduzida de 7 dias para 24 horas; o serviço não devolve mais token/link ao chamador. A resposta pública não contém o token.
- **Tokens de sessão — endurecido nesta alteração.** Login e primeiro acesso deixam de devolver access/refresh tokens em JSON e gravam a sessão no formato de cookies SSR. A chave de controle de sessão continua no navegador; a integração Supabase ainda não é totalmente `HttpOnly` porque o cliente browser também consome cookies.
- **Mensagens de login — endurecido nesta alteração.** Falha e bloqueio retornam mensagem genérica.
- **Limite de sessões — feito no código.** Login substitui sessões anteriores; heartbeat confirma que a sessão registrada continua ativa.
- **Proteção contra senhas vazadas — não feito.** Supabase Advisor acusa desativada; a tentativa anterior indicou que exige plano Pro ou superior.
- **Tamanho mínimo de senha — feito no código para primeiro acesso e troca.** A configuração global do Supabase Auth ainda precisa ser confirmada no painel.
- **Confirmação de e-mail e allowlist de redirects — não verificado no painel Supabase.** A ativação de compra confirma o e-mail mediante link enviado, mas a confirmação global do Auth e domínios permitidos precisam ser conferidos.
- **Webhook Asaas — feito no código.** Segredo conferido antes do processamento com comparação em tempo constante; eventos pagos têm idempotência. Payload salvo foi reduzido aos campos mínimos para não persistir o objeto bruto do provedor.
- **Reembolso/chargeback/cancelamento — endurecido nesta alteração.** Eventos de estorno, disputa, vencimento e exclusão revogam acesso e sessões no webhook. A verificação de compra também nega status não pago em requisições posteriores.
- **Checkout confirmado — feito no código.** Liberação parte do status confirmado no servidor/Asaas, não de uma página de sucesso.

## Abuso, headers, privacidade e operação

- **Bloqueio de atacantes — endurecido nesta alteração.** Proxy agora consulta a lista `blocked_attackers`; antes a tabela era gravada, mas não consultada pelo proxy. Também deixou de enviar a chave administrativa em header numa chamada HTTP interna.
- **Rate limit de login — parcial.** Há bloqueio progressivo por tentativas com `login_security_tracking`. Login, redefinição, ativação e checkout ainda precisam de limites independentes distribuídos (Vercel Firewall ou serviço externo); CAPTCHA não está configurado.
- **Validação de leads e telemetria — parcial.** Rotas públicas agora limitam tamanho, validam tipo/comprimento e o endpoint de telemetria não devolve IP ao visitante. Falta um limitador distribuído de requisições.
- **Headers — parcial.** HSTS, `nosniff`, Referrer Policy, X-Frame-Options e Permissions Policy estão configurados. CSP foi adicionada em modo `Report-Only`; ainda precisa ser observada e ajustada antes de ativar enforcement.
- **HTML dinâmico — sem uso encontrado com conteúdo livre de usuário.** Os usos encontrados são JSON-LD serializado a partir de dados do produto/site.
- **Logs — parcial.** Login e mudança de senha registram eventos; falhas de login passaram a gerar auditoria. Removidos logs de e-mail/ID de pagamento e honeypot com dados pessoais. Falta auditar todas as rotas e estabelecer retenção para IPs/telemetria.
- **Privacidade e termos — publicados.** Política e termos existem. Não encontrei processo implementado para exportação/exclusão, plano de resposta a vazamento ou prazo de retenção definido.
- **Alertas e monitoramento — não verificado/não feito no código.** Não encontrei Sentry ou equivalente, alertas de downloads/logins anômalos nem rotina automatizada mensal.
- **Contas externas, DNS e GitHub — não verificados.** 2FA, permissões mínimas, branch protection, SPF/DKIM/DMARC e variáveis Vercel dependem dos respectivos painéis. O projeto Supabase não tem branches de staging listadas.
- **Testes finais — pendentes.** Não foram executados testes de acesso entre usuários, URLs privadas anônimas, estorno real ou replay do webhook.

## O que ainda falta

- O executor remoto não permitiu alterar privilégios padrão (`ALTER DEFAULT PRIVILEGES`); essa parte foi retirada da migration após erro de permissão. Deve ser aplicada por um contexto de owner do projeto.
- Habilitar proteção contra senhas vazadas exige plano Supabase elegível e ajuste no painel Auth.
- Fazer testes manuais de login, acesso pago, rota privada e negação sem sessão; revisar os índices não usados antes de qualquer remoção.
- Confirmar configurações de Preview/Production, secrets e domínio na Vercel, além de MFA/DNS/GitHub; esses painéis não estavam conectados.
