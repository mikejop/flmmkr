# TRD — FLMMKR: Documento de Requisitos Técnicos

**Produto:** plataforma FLMMKR, com foco inicial em Color Master | Produto  
**Documento relacionado:** [PRD-FLMMKR.md](./PRD-FLMMKR.md)  
**Status:** rascunho técnico para validação e implementação  
**Data:** 5 de outubro de 2026  
**Base:** análise estática do repositório atual; não contém segredos ou credenciais

## 1. Objetivo

Este documento traduz o PRD em decisões, limites e requisitos técnicos para entregar uma plataforma de vendas e aprendizagem de cursos digitais. Ele descreve tanto a arquitetura existente quanto a arquitetura-alvo necessária para uma operação segura de checkout, autenticação, acesso por produto e área de membros.

O objetivo de lançamento é permitir a venda do **Color Master | Produto**, provisionar a conta após confirmação de pagamento, conceder acesso limitado a 365 dias ao curso correto e fornecer uma experiência de estudo persistente e segura.

## 2. Decisões técnicas obrigatórias

1. **O catálogo é a fonte de verdade.** Produto vendido, preço, curso entregue e entitlement devem compartilhar um identificador estável de produto. Rota ou texto de landing não podem, sozinhos, definir acesso.
2. **Supabase/PostgreSQL será a fonte de verdade operacional.** Toda alteração de schema deverá ser uma migration SQL versionada em `supabase/migrations/`. O `prisma/schema.prisma` deverá ser mantido como espelho gerado/documental ou removido do fluxo; não serão aceitas duas fontes de schema independentes.
3. **A aplicação usa Supabase Auth para identidade, mas direitos de acesso ficam no banco de aplicação.** `auth.users` identifica a pessoa; uma tabela de entitlements determina curso, início, expiração e revogação.
4. **O servidor decide preço, identidade autorizada e acesso.** O navegador apenas solicita a operação. Valores, `userId`, função e status recebidos do cliente nunca são confiáveis por si.
5. **A cobrança é idempotente.** Webhook, consulta de status e retorno de cartão podem ocorrer mais de uma vez e em qualquer ordem sem duplicar usuário, direito de acesso, mentoria ou e-mail.
6. **Dados de cartão não serão persistidos, registrados em logs ou enviados a analytics.** Antes de operar cartão em produção, a integração deverá ser validada com Asaas sob a ótica de PCI DSS; a preferência é tokenização/checkout hospedado para reduzir escopo de conformidade.
7. **A ativação inicial não depende de e-mail em query string.** Deve usar convite/token de uso único, assinado, com expiração e vínculo ao usuário provisionado.

## 3. Arquitetura atual observada

### Aplicação web

- Next.js 16.3.6 com App Router, React 19, TypeScript e Tailwind CSS 4.
- Páginas públicas em `src/app/`, incluindo catálogo, links, landing do produto e rotas de SEO.
- Componentes React em `src/components/`; as landing pages e a área de membros são componentes de cliente extensos.
- As rotas de API são Route Handlers sob `src/app/api/`.
- O middleware atual atualiza o contexto de autenticação do Supabase e executa uma filtragem global de padrões suspeitos em URL/query string.

### Serviços externos

- **Supabase:** autenticação, PostgreSQL, RLS e persistência da aplicação.
- **Asaas:** clientes, Pix, cartão, consulta de cobrança e webhook.
- **BrasilAPI/ViaCEP:** consulta de CEP no servidor.
- **GA4/Meta Pixel:** eventos opcionais de marketing no cliente.
- **Resend:** alerta de segurança por e-mail, quando configurado.
- **YouTube nocookie:** mídia de fundo da landing em desktop.

### Persistência disponível

As migrations presentes criam `profiles`, `pending_checkouts`, `checkout_abandonment_leads` e `offer_timer_sessions`. O código também referencia `user_active_sessions`, `login_security_tracking`, `security_audit_logs`, `user_reading_state` e `user_highlights`, que não aparecem nas migrations disponíveis.

O arquivo Prisma descreve parte dessas tabelas, mas o código de runtime usa o cliente Supabase diretamente; não há uso de `PrismaClient` na aplicação. Há ainda divergências entre Prisma, migrations e chamadas do código, por exemplo campos de função/acesso/avatares esperados na aplicação e não criados pela migration inicial.

### Ponto de atenção de build

Algumas rotas novas importam `supabaseAdmin` de `src/services/userService.ts`, mas o símbolo é exportado por `src/utils/supabase/admin.ts`, não pelo serviço. A implementação deve corrigir esse limite de módulo e executar typecheck/lint/build antes de qualquer publicação.

## 4. Arquitetura-alvo

### Camadas e responsabilidades

**Cliente web**

- Renderiza landing, checkout, login e área de membros.
- Armazena somente preferências e cache de experiência não sensível; não determina preço, acesso ou identidade.
- Envia requisições a APIs com cookies da sessão Supabase e CSRF/mesma origem quando aplicável.

**Next.js (BFF e experiência)**

- Serve páginas, Route Handlers e middleware.
- Valida entrada por schema, autentica usuário quando a rota for privada, chama serviços externos e devolve contratos estáveis ao cliente.
- Centraliza autorização, cálculo de preço, provisionamento e registro de eventos de negócio.

**Supabase Auth**

- Emite e renova sessões de usuário.
- Armazena credenciais e metadados mínimos de identidade.
- Não contém a regra comercial como única fonte de autorização.

**PostgreSQL/Supabase**

- Armazena catálogo, pagamentos, direitos de acesso, progresso, sessões de produto, auditoria e dados de suporte.
- Mantém RLS ativa em todas as tabelas públicas; somente serviços de backend usam credencial de serviço.

**Asaas**

- É a fonte externa para estado financeiro da cobrança.
- Notifica por webhook assinado/configurado e responde a consultas de status.
- Nunca é chamado diretamente pelo navegador com segredo de API.

## 5. Convenções de código e estrutura

### Organização recomendada

- `src/app/(public)/`: páginas públicas e de aquisição.
- `src/app/(member)/`: páginas protegidas da área de membros.
- `src/app/api/`: endpoints finos, responsáveis por converter HTTP em chamadas de casos de uso.
- `src/features/<domínio>/`: casos de uso, repositórios, schemas de validação e tipos por domínio (`catalog`, `checkout`, `entitlements`, `learning`, `accounts`).
- `src/services/`: adaptadores para Asaas, e-mail e CEP; não devem conter autorização de usuário nem lógica de UI.
- `src/lib/supabase/`: clientes browser, server e admin, explicitamente separados.
- `src/data/`: conteúdo estático apenas durante beta; conteúdo por produto deve ser separado por identificador de curso.
- `supabase/migrations/`: único histórico executável de banco.
- `docs/`: PRD, TRD, runbooks e decisões de arquitetura.

### Convenções técnicas

- TypeScript estrito; evitar `any` em contratos de API e pagamentos.
- Alias `@/` apenas para código em `src/`.
- Cada endpoint valida `Content-Type`, payload e tamanho máximo de entrada antes de executar integrações.
- Erros internos devem ser logados com identificador de correlação e convertidos em mensagens de negócio seguras ao cliente.
- Segredos só são lidos de variáveis de ambiente. O serviço do Asaas não deve buscar credencial diretamente de `.env.local` durante runtime de produção.
- Formatação, lint, typecheck e build são gates obrigatórios no CI.

## 6. Modelo de dados alvo

Os nomes abaixo são propostos em `snake_case`. Colunas de auditoria `created_at` e `updated_at` devem usar `timestamptz` em UTC. Chaves primárias usam UUID, salvo necessidade justificada.

### Identidade e perfil

#### `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`.
- `email citext not null`, `full_name text not null`, `phone text`, `avatar_url text`.
- `role text not null default 'student'` com restrição a papéis conhecidos.
- Dados pessoais opcionais, como nascimento, profissão e endereço, só quando houver finalidade documentada.
- Não usar `has_access` como única fonte de entitlement. Pode permanecer apenas como cache transitório, se necessário.

RLS: o próprio usuário lê/atualiza somente os campos permitidos de seu perfil; campos administrativos não podem ser alterados por ele.

### Catálogo e conteúdo

#### `products`

- `id uuid`, `slug text unique`, `name text`, `description text`.
- `status` com valores `draft`, `waitlist`, `on_sale`, `archived`.
- `access_duration_days integer`, inicialmente 365 para o Color Master.
- `is_public boolean`, `created_at`, `updated_at`.

#### `course_versions`

- `id uuid`, `product_id uuid references products(id)`.
- `title`, `version`, `status`, `published_at` e `content_manifest jsonb` ou relação normalizada de módulos/aulas.
- Somente uma versão publicada por produto deve ser marcada como padrão de novos acessos.

Para o beta, o conteúdo pode continuar no repositório, mas o manifesto publicado deve apontar para um `course_version` específico. O produto `color-master-produto` não pode apontar para a trilha de iluminação por acidente.

### Compra e direito de acesso

#### `orders`

- `id uuid`, `user_id uuid nullable`, `product_id uuid not null`.
- `buyer_email citext not null`, `payer_name text`, `amount numeric(10,2) not null`, `currency char(3) default 'BRL'`.
- `status` com estados controlados: `created`, `pending`, `paid`, `overdue`, `refunded`, `cancelled`, `failed`.
- `payment_provider text`, `provider_customer_id text`, `provider_payment_id text unique`.
- `payment_method`, `paid_at`, `refunded_at`, `failure_reason`, `metadata jsonb`.

Índices: `provider_payment_id` único; `buyer_email`; `product_id, status`; `user_id, created_at desc`.

#### `entitlements`

- `id uuid`, `user_id uuid references auth.users(id)`, `product_id uuid references products(id)`.
- `order_id uuid references orders(id)`, `course_version_id uuid references course_versions(id)`.
- `status` com `active`, `expired`, `revoked`, `refunded`.
- `starts_at`, `expires_at`, `revoked_at`, `reason`.
- Restrição que evite dois entitlements ativos equivalentes para o mesmo usuário e produto, salvo regra explícita de renovação.

RLS: o aluno só lê os próprios entitlements. Criação, revogação e mudança de status ocorrem por função transacional de backend.

#### `pending_checkouts`

Manter apenas como estado temporário de cobrança Pix, contendo `order_id` e `provider_payment_id`. Não duplicar toda a fonte de verdade de compra nesta tabela. Deve ter expiração/limpeza programada após período definido.

### Aprendizagem

#### `lesson_progress`

- `user_id`, `course_version_id`, `lesson_id` como chave única composta.
- `completed_at`, `last_opened_at`, `progress_percent`, `last_tab`, `scroll_top`.

#### `challenge_responses`

- `user_id`, `course_version_id`, `challenge_id`, `response jsonb`, `updated_at`.

#### `checklist_states`

- `user_id`, `course_version_id`, `checklist_item_id`, `is_completed`, `updated_at`.

#### `user_highlights`

- `id uuid`, `user_id`, `course_version_id`, `lesson_id`.
- Trecho, contexto antes/depois, seção, cor, nota e data de criação.

Todas as tabelas de aprendizagem terão RLS por `auth.uid() = user_id` e índices iniciando por `user_id`.

### Segurança e operação

#### `user_active_sessions`

- `id uuid`, `user_id`, `session_token_hash text unique`.
- `device_label`, `ip_hash`, `location_label`, `is_active`, `created_at`, `last_heartbeat_at`, `replaced_at`, `replacement_reason`.

O token deve ser armazenado como hash; o valor bruto só fica na sessão do navegador. IP deve ser minimizado/hasheado quando sua retenção integral não for necessária.

#### `login_security_tracking`

- Chave por identificador de conta normalizado e, preferencialmente, dimensão adicional de IP/rate limit.
- Contadores, janela de tentativas, `locked_until`, nível de escalonamento e datas de atualização.

#### `security_audit_logs`

- Evento, sujeito afetado, ator, request/correlation ID, data e detalhes minimizados.
- Não armazenar senha, token, CPF inteiro, cartão, CVV ou payload de cobrança bruto.

#### `mentorship_slots`

- `campaign_id`, capacidade, reservas e vínculo com order/entitlement.
- A reserva de uma das 10 vagas ocorre em transação apenas após pagamento confirmado.

## 7. Migrações e integridade do banco

### Regras de migration

- Criar arquivos somente incrementais em `supabase/migrations/` com timestamp UTC e nome descritivo.
- Nunca editar migration já aplicada em ambiente compartilhado.
- Toda migration deve ter índices, constraints, RLS e policies correspondentes no mesmo change set.
- Usar `check constraints`, foreign keys e unique indexes para regras que o banco consegue garantir.
- Adicionar `updated_at` por trigger central ou atualizá-lo explicitamente de maneira consistente.
- Testar migração em banco efêmero/preview, validar rollback lógico e registrar plano de reversão no PR.

### Sequência de migrações P0

1. Corrigir a base de `profiles`: adicionar campos realmente usados e alinhar RLS.
2. Criar catálogo, versões de curso, pedidos e entitlements.
3. Migrar/absorver `pending_checkouts`, incluindo `product_id`/`order_id` e unicidade de cobrança.
4. Criar tabelas de sessão, bloqueio de login e auditoria referenciadas pelo código.
5. Criar progresso, estado de leitura, respostas, checklist e destaques com RLS.
6. Criar campanha/reserva de mentoria e caminho de reembolso/revogação.
7. Revisar `offer_timer_sessions`; remover a duplicação atual entre as duas migrations e documentar retenção de dados.

## 8. Autenticação, autorização e sessões

### Proteção de rotas

- Páginas de membro devem validar sessão no servidor ou em layout protegido e redirecionar usuário anônimo ao login. O carregamento exclusivamente no cliente não é barreira de acesso.
- Antes de servir materiais protegidos, uma função server-side verifica `entitlements.status = 'active'` e `expires_at > now()`.
- O usuário autenticado pode acessar somente os produtos/versões presentes em seus entitlements.

### Regras de endpoint privado

Para qualquer endpoint que modifique perfil, senha, progresso, sessão ou acesso:

1. Obter a sessão do cookie com cliente Supabase server-side.
2. Recusar sem usuário autenticado com `401`.
3. Calcular o alvo a partir de `session.user.id`; não aceitar `userId` do corpo como autoridade.
4. Verificar entitlement ou papel administrativo quando a operação exigir.
5. Registrar evento de auditoria com dados mínimos.

### Ativação de primeiro acesso

Após `payment_confirmed`:

1. Criar ou localizar a conta em `auth.users` pelo e-mail normalizado.
2. Criar/atualizar perfil, pedido e entitlement numa operação idempotente.
3. Emitir convite de ativação/redefinição nativo do Supabase ou token próprio com hash no banco, expiração curta e uso único.
4. Enviar o link por e-mail para o comprador; a página de definição de senha aceita somente token válido, não e-mail aberto.
5. Após sucesso, invalidar token e iniciar a sessão do usuário.

### Sessão única

- Gerar token aleatório de 256 bits ou UUID v4; persistir somente hash com rotação no login.
- Criar a nova sessão e desativar sessões anteriores do mesmo usuário dentro de transação ou RPC serializável.
- Heartbeat pode ocorrer a cada 60 segundos, além de retorno de foco, evitando chamadas a cada 10 segundos sem necessidade.
- Expirar sessões inativas por política definida e limpar registros inativos por job.
- A sessão da aplicação complementa, mas não substitui, revogação/expiração da sessão do Supabase quando isso for necessário.

### Rate limit

- Aplicar limite por IP e identificador de conta em login, recuperação de senha, primeiro acesso, checkout, CEP e webhook.
- Preferir mecanismo compartilhado (Redis, Upstash, gateway/WAF ou recurso equivalente) em vez de memória local do processo, que não funciona de maneira consistente em múltiplas instâncias.

## 9. Requisitos de API

Todos os endpoints retornam JSON com `Content-Type: application/json; charset=utf-8`, um `requestId` seguro em erros e mensagens sem detalhes internos. Contratos devem ser definidos com schemas TypeScript compartilhados e validados no servidor.

### Endpoints públicos controlados

#### `GET /api/cep?cep=########`

- Entrada: oito dígitos de CEP após normalização.
- Saída de sucesso: `street`, `neighborhood`, `city`, `state`, `service`.
- Falhas: `400` formato inválido, `404` não encontrado, `503` provedores indisponíveis.
- Cache: 24 horas por CEP, com limite de requisições por IP.

#### `GET /api/offer-timer`

- Deve receber ou inferir identificador pseudônimo de campanha, nunca ser chamado “MAC address”, pois navegadores não fornecem o MAC do dispositivo.
- Saída: segundos restantes, expiração, preço atual, preço regular, lote e data de próximo reajuste.
- O endpoint não expõe cooldown, identificador interno ou outros dados de visitantes.
- Uso de fingerprint/IP deve passar por avaliação de LGPD, banner/consentimento quando aplicável e política de retenção curta.

#### `POST /api/checkout/abandon`

- Entrada mínima e opcional; aceitar somente após base legal/consentimento definido.
- Nunca falhar visualmente o checkout por indisponibilidade de captura de lead.
- Sanitizar, limitar tamanho, registrar origem e definir expiração automática dos leads.

### Checkout

#### `POST /api/checkout`

Substitui ou consolida o atual `/api/checkout/asaas`.

- Entrada: `productSlug`, dados do aluno, dados do pagador quando diferentes, método de pagamento e token/representação de pagamento permitida pelo Asaas.
- Autorização: pública com rate limit, idempotency key e proteção antifraude; usuário autenticado pode ter dados pré-preenchidos, mas não é obrigatório.
- Processo: resolver produto vendável, calcular preço no servidor, criar `orders`, criar ou reutilizar cliente Asaas, criar pagamento, persistir identificador externo e devolver estado seguro.
- Saídas: estado de cobrança, `orderId`, dados Pix quando aplicável e próxima ação. Não retornar dados de cartão, segredo do provedor ou mensagem interna.
- Idempotência: a mesma chave deve retornar a mesma ordem/cobrança dentro de janela definida.

#### `GET /api/orders/:orderId/status`

- Autorização: dono do pedido autenticado, ou token temporário atrelado ao checkout; não aceitar identificador de pagamento externo público como chave de consulta livre.
- Processo: lê estado local e, se necessário, atualiza a partir do Asaas; a confirmação executa função idempotente de provisionamento.
- Saída: estado de negócio (`pending`, `paid`, `overdue`, `failed`) e link/ação de ativação somente quando permitido.

#### `POST /api/webhooks/asaas`

- Autorização: validar segredo/token do webhook em comparação de tempo constante e, se o provedor permitir, validar assinatura/origem.
- Registrar `provider_event_id` único para deduplicação antes de processar.
- Processar em ordem tolerante a repetição: persistir evento, atualizar pedido usando máquina de estados e chamar provisionamento transacional para pagamentos elegíveis.
- Responder `2xx` somente quando o evento foi validado e aceito para processamento; falhas transitórias precisam ser registradas e reprocessáveis.

### Conta e sessão

#### `POST /api/auth/activate`

- Entrada: token de ativação e nova senha; não recebe e-mail como fator de autorização.
- Saída: sucesso e sessão/redirect seguro.

#### `POST /api/auth/login`

- Entrada: e-mail e senha; aplica rate limit e bloqueio progressivo.
- Saída: o fluxo normal deve usar cookies gerenciados pelo Supabase, não enviar refresh token no corpo se não for estritamente necessário.
- Cria sessão de produto após login autenticado.

#### `POST /api/auth/session/heartbeat`

- Autenticação obrigatória. Token de sessão de produto é comparado por hash e precisa pertencer ao usuário da sessão Supabase.
- Saída: `valid: true` ou informação genérica de sessão substituída; não expor detalhes pessoais excessivos de outro dispositivo.

#### `PATCH /api/me`

- Autenticação obrigatória; edita somente o perfil do usuário logado.
- Campos permitidos explícitos; mudança de e-mail requer fluxo de confirmação do Supabase.

#### `POST /api/me/password`

- Autenticação obrigatória; valida senha atual e política de nova senha; registra auditoria sem segredos.

### Aprendizagem

#### `GET /api/me/courses`

- Retorna entitlements ativos e metadados resumidos das versões de curso permitidas.

#### `GET /api/me/courses/:slug/content`

- Exige entitlement ativo. Entrega manifesto de módulos/aulas e URLs assinadas de materiais quando necessário.

#### `PUT /api/me/learning-state`

- Exige entitlement ao curso. Persiste progresso, ponto de leitura, checklist, desafio ou nota conforme schema específico; payloads pequenos e versionados.

Endpoints de progresso também podem usar o cliente Supabase com RLS rigorosa, mas o contrato e a política devem ser um só. Para mutações que combinam várias entidades, preferir endpoint/função server-side transacional.

## 10. Fluxos transacionais críticos

### Pagamento confirmado

1. Receber webhook ou detectar confirmação em consulta autorizada.
2. Validar autenticidade/deduplicar evento.
3. Buscar pedido por `provider_payment_id` com bloqueio de linha.
4. Se já estiver pago e provisionado, retornar sucesso sem novas ações.
5. Atualizar pedido para `paid` e registrar `paid_at`.
6. Criar ou localizar usuário Auth e perfil.
7. Criar/renovar entitlement com `starts_at` e `expires_at` coerentes com produto.
8. Reservar mentoria em transação, se a campanha ainda tiver vagas.
9. Persistir evento de auditoria e enviar ativação/notificação de forma assíncrona/retryável.

### Reembolso

1. Receber evento de reembolso ou ação administrativa validada.
2. Atualizar pedido para `refunded` com idempotência.
3. Revogar entitlement de acordo com a política comercial e registrar motivo/data.
4. Liberar ou ajustar vaga de mentoria somente se a política permitir.
5. Notificar o usuário e registrar auditoria.

### Autorização de conteúdo

1. Ler sessão de Auth no servidor.
2. Resolver produto/versão pela rota solicitada.
3. Verificar entitlement `active` não expirado para usuário e produto.
4. Servir conteúdo/metadados ou redirecionar/retornar `403` sem vazar existência de materiais privados.

## 11. Segurança e privacidade

### Controles obrigatórios

- RLS habilitada e testada para cada tabela em `public`.
- Credencial `SUPABASE_SECRET_KEY` acessível apenas em Route Handlers/serviços server-side; nunca importada por componente de cliente.
- Validação por schema (por exemplo, Zod) em todas as entradas. Filtros caseiros de “SQL injection” não substituem query parametrizada, autorização e validação de tipo.
- Queries executadas por Supabase/SQL parametrizado; não concatenar SQL a partir de entrada do usuário.
- Não usar `userId` vindo do corpo em operações privadas.
- CSRF avaliado para endpoints baseados em cookie; cookies `Secure`, `HttpOnly` e `SameSite` adequados ao fluxo.
- Rotação de segredos, ambientes separados e nenhuma chave em commit/log/erro de frontend.
- `Content-Security-Policy` definida e compatível com Supabase, Asaas, analytics e YouTube; os headers atuais são uma base, não uma política completa.
- Sanitização de HTML em conteúdo/notas se houver qualquer renderização rica.
- Logs com redaction obrigatório para `password`, `token`, `authorization`, `cpfCnpj`, endereço, cartão e Pix payload.

### Dados pessoais

- Classificar CPF, data de nascimento, endereço, telefone, IP, geolocalização aproximada, fingerprint e informações de pagamento como dados pessoais/sensíveis operacionalmente relevantes.
- Documentar finalidade, fundamento, retenção, eliminação e acesso de cada categoria.
- Reduzir fingerprint a identificador pseudônimo com retenção curta ou substituir por mecanismo menos invasivo de rate limiting/campanha.
- `extractLocation` não deve inventar localização. Quando a plataforma não fornecer cabeçalho confiável, usar “Localização indisponível”.
- Definir e implementar expurgo automático para leads abandonados, checkouts pendentes, tokens de ativação, eventos de segurança e dados de timer.

### Pagamentos e PCI

- Preferir checkout hospedado do Asaas ou tokenização que impeça o backend de receber PAN e CVV.
- Se o formulário de cartão próprio for mantido, validar formalmente o escopo PCI DSS, os requisitos do Asaas e as responsabilidades de infraestrutura antes de processar pagamento real.
- Proibir persistência, telemetry e mensagens de erro com dados de cartão; testes usam cartões sandbox, nunca credenciais reais.

## 12. Requisitos de desempenho e confiabilidade

- Páginas públicas: meta de LCP inferior a 2,5 s em conexão móvel representativa; evitar que vídeo decorativo bloqueie conteúdo ou CTA.
- Checkout: manter formulário responsivo; timeout explícito para Asaas/CEP e mecanismo de tentativa seguro, sem criar cobranças duplicadas.
- Webhook: responder rapidamente após validar/enfileirar trabalho. Processos demorados de e-mail ou mídia não ficam no caminho síncrono do provedor.
- Conteúdo: carregamento preguiçoso de ferramentas pesadas e imagens otimizadas; materiais grandes em storage/CDN com URL assinada.
- Banco: índices para FKs, busca de pedido por identificador externo, entitlement por usuário/produto, progresso por usuário/curso e sessões ativas.
- Observabilidade: request ID do edge ao Asaas/Supabase/logs; métricas de latência/erro por endpoint e alertas de falha de webhook/provisionamento.
- Resiliência: política de retry com backoff para APIs externas; ações financeiras usam idempotência, nunca retry cego de criação de cobrança.

## 13. Acessibilidade e interface técnica

- Seguir WCAG 2.2 AA nos fluxos públicos, checkout, login e área de membros.
- Cada modal implementa foco inicial, trap de foco, retorno ao gatilho, Escape e descrição acessível.
- Mensagens de validação e estado de Pix usam regiões `aria-live` adequadas.
- Todos os campos têm label associado; máscara de CPF/CEP/telefone mantém valor compreensível para leitor de tela.
- Não depender apenas de cor para preço promocional, progresso, sucesso, erro ou expiração.
- Permitir zoom até 200% e evitar bloqueio de escala que prejudique leitura; a configuração de viewport deve ser avaliada contra este requisito.

## 14. Conteúdo, mídia e arquivos

- Materiais de curso devem ter registro de produto, versão, direitos de uso, tamanho, hash/versão e status de publicação.
- Arquivos privados não ficam em `public/`; usar bucket privado do Supabase Storage ou storage equivalente, com URL assinada curta após validação de entitlement.
- Imagens institucionais podem ficar em `public/` e devem ser entregues em formatos/medidas otimizados.
- A rota `/api/empresas` não deve copiar arquivos para `public` durante uma requisição. A publicação de mídia ocorre no build ou por pipeline de storage.
- Vídeo de YouTube deve ter fallback estático, título acessível e carregamento que respeite consentimento de cookies quando necessário.

## 15. Analytics, logs e monitoramento

### Eventos de produto mínimos

- `landing_viewed`, `product_cta_clicked`, `checkout_opened`, `checkout_started`.
- `payment_created`, `payment_pending`, `payment_paid`, `payment_failed`, `payment_overdue`, `payment_refunded`.
- `activation_started`, `activation_completed`, `login_succeeded`, `login_failed`, `session_replaced`.
- `course_opened`, `lesson_opened`, `lesson_completed`, `material_downloaded`, `challenge_saved`.

Eventos de marketing recebem apenas identificadores pseudônimos e propriedades de produto/origem. CPF, e-mail, endereço, token, IP, conteúdo de notas e dados de cartão são proibidos em GA4, Meta e logs de frontend.

### Logs operacionais

- Usar JSON estruturado com `requestId`, endpoint, resultado, duração e IDs internos não sensíveis.
- Correlacionar `order_id`, `provider_payment_id` mascarado e `provider_event_id` sem expor dados financeiros completos.
- Registrar tentativas de webhook inválidas, mas redigir cabeçalhos de autenticação.
- Definir alertas para: falha continuada de webhook, pedidos pagos sem entitlement, taxa anormal de recusa, erro de login, falha de banco e indisponibilidade do Asaas.

## 16. Testes e critérios técnicos de aceite

### Testes automatizados

- Unitários para preço por lote, expiração de entitlement, transição de estado de pedido, deduplicação de webhook, validação de payload e política de sessão.
- Integração para Supabase (RLS e migrations), Asaas sandbox, provisionamento, Pix, cartão/tokenização, webhook, reembolso e CEP com fallback.
- End-to-end em navegador para descoberta, checkout, Pix pendente/pago, cartão aprovado/recusado, ativação, login, conteúdo autorizado/não autorizado, troca de dispositivo e retomada de estudo.
- Contrato para cada endpoint e evento de webhook.
- Acessibilidade automatizada nas principais rotas e revisão manual de teclado/leitor de tela.

### Gates de CI

1. Instalação reproduzível com lockfile.
2. `npm run lint` sem erro.
3. Typecheck sem erro.
4. `npm run build` concluído com as variáveis mínimas de build/sandbox.
5. Testes unitários, integração e e2e relevantes aprovados.
6. Migration aplicada em banco temporário e teste de RLS executado.
7. Verificação de segredo e dependências vulneráveis.

### Aceite técnico de produção

- Nenhuma rota privada aceita identidade arbitrária do cliente.
- Nenhuma cobrança confirmada pode duplicar entitlement em webhook repetido.
- O usuário sem entitlement recebe `403` para conteúdo/material privado; um usuário com entitlement válido consegue acessar.
- A expiração de 365 dias é calculada/persistida e testada.
- As tabelas chamadas pelo runtime existem em migration, estão indexadas e têm RLS/policies verificadas.
- Sem cartão, senha, segredo ou PII indevida em logs e ferramentas de analytics.
- Build e suite de testes concluídos no commit de release.

## 17. Ambientes, configuração e deploy

### Ambientes mínimos

- **Local:** Supabase local ou projeto isolado, Asaas sandbox, chaves de desenvolvimento e dados sintéticos.
- **Preview/staging:** domínio de teste, projeto Supabase separado, webhook de sandbox e observabilidade semelhante à produção.
- **Produção:** variáveis isoladas, projeto Supabase/Asaas de produção, domínio canônico e plano de rollback.

### Variáveis de ambiente

São esperadas variáveis para URL/chaves pública e de serviço do Supabase, URL de conexão de banco quando Prisma for mantido, credenciais/URL do Asaas, segredo do webhook e chave do provedor de e-mail. Os valores não pertencem ao repositório, ao PRD/TRD, a logs nem a telas de erro.

Validar todas as variáveis no boot server-side. Para variáveis obrigatórias ausentes, falhar com mensagem operacional segura antes de aceitar checkout ou webhook.

### Deploy e rollback

- Aplicar migrations compatíveis antes do deploy de código que dependa delas.
- Usar estratégia expandir → popular/migrar → alternar aplicação → remover legado em release posterior.
- Não remover tabelas/colunas ou conteúdo sem backup, plano de recuperação e confirmação do responsável.
- Manter runbook de reprocessamento de webhook, provisionamento de acesso e suporte a pagamento pendente.

## 18. Backlog técnico priorizado

### P0 — requisito para venda segura

- Decidir e mapear produto, curso e entitlement corretos para `color-master-produto`.
- Criar migrations de catálogo, pedidos, entitlements, sessões, segurança e aprendizagem; reconciliar Prisma/migrations.
- Proteger área de membros e materiais por entitlement server-side.
- Substituir ativação por e-mail aberto por convite/token expiráveis.
- Corrigir importações de `supabaseAdmin`, contratos TypeScript e gates de build.
- Implementar autorização baseada em sessão no servidor para perfil, senha e heartbeat.
- Tornar pagamento/webhook idempotentes e registrar estado financeiro por pedido.
- Validar abordagem PCI/tokenização do cartão antes de produção.

### P1 — requisito para operação confiável

- Sincronizar progresso, checklists, desafios, leitura e destaques em banco com RLS.
- Implementar processo de reembolso, expiração de acesso e reserva transacional de mentoria.
- Adicionar rate limit distribuído, CSP e redaction central de logs.
- Publicar política de privacidade/cookies e retenção/expurgo de dados.
- Criar monitoramento de pagamentos, webhook e provisionamento.

### P2 — evolução

- Backoffice de catálogo, suporte, pagamento, acesso e mentoria.
- CMS ou manifesto administrativo de conteúdo e materiais.
- Coortes/relatórios de aprendizagem e experimentos de aquisição.
- Comunidade, avaliações ou certificado, somente após decisão de produto.

## 19. Arquivos de referência analisados

- `package.json`, `next.config.ts`, `src/middleware.ts` e `src/app/layout.tsx`.
- `src/app/api/**`, `src/services/**`, `src/utils/supabase/**` e `src/utils/offerPricing.ts`.
- `src/components/CheckoutModal.tsx`, `LoginModal.tsx`, `MemberAreaApp.tsx` e landing pages.
- `src/data/data.ts`, `src/data/courseData.ts` e documentação em `ContentsPlace/docs/`.
- `prisma/schema.prisma`, `supabase/migrations/**` e `.env.example` (somente nomes de variáveis).

Este TRD define a direção de implementação. Mudanças de produto, regras de pagamento, fundamento jurídico, privacidade ou acesso devem atualizar este documento e o PRD correspondente antes de serem levadas a produção.
