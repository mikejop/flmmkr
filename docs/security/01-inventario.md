# Relatório de Segurança 01: Inventário Completo do Sistema

Data da Auditoria: 07/10/2026  
Ambiente: Plataforma FLMMKR (Next.js 16 + Supabase + Panda Video + Vercel + Asaas)  
Responsável: Engenharia de Segurança  

---

## 1. Mapeamento de Tabelas, Views, Funções, Triggers e Buckets (Supabase)

### Tabelas Mapeadas no Banco e Código
Com base nas migrations (`supabase/migrations/`) e nos acessos identificados no código (`src/`), foram mapeadas 12 tabelas públicas:

| Tabela | RLS Habilitado | Policies Existentes | Estado de Segurança / Observação |
|---|---|---|---|
| `public.profiles` | SIM | SELECT (auth.uid() = id), UPDATE (auth.uid() = id) | **CRÍTICO / ALTO**: Sem policy de INSERT/DELETE. Além disso, rotas usam `supabaseAdmin` para burlar RLS. Coluna `email`, `phone`, `address` sensíveis. |
| `public.checkout_abandonment_leads` | SIM | NENHUMA (bloqueado p/ anon/authenticated por padrão) | Acessado via `supabaseAdmin` em `api/checkout/abandon` e `api/checkout/asaas`. Armazena PII (nome, email, telefone, localização, profissão). |
| `public.pending_checkouts` | SIM | NENHUMA | Acessado via `supabaseAdmin`. Armazena PII de compradores, CPF/CNPJ, endereço, valor, status do Asaas. |
| `public.offer_timer_sessions` | SIM | NENHUMA | Acessado via `supabaseAdmin` no backend para controle de escassez e cronômetro por MAC/IP. |
| `public.member_bg_video_sessions` | SIM | NENHUMA | Acessado via `supabaseAdmin` para controle do vídeo de abertura da área de membros. |
| `public.login_security_tracking` | *Não consta em migrations locais* | Não declarada em migration | Gerenciada exclusivamente via `supabaseAdmin` em `api/auth/login`. Armazena email, tentativas falhas, bloqueios, IP. **Precisa ter RLS explícito ativado**. |
| `public.user_active_sessions` | *Não consta em migrations locais* | Não declarada em migration | Gerenciada exclusivamente via `supabaseAdmin`. Armazena sessões ativas por usuário, IP, dispositivo, token de sessão. **Precisa ter RLS explícito**. |
| `public.security_audit_logs` | *Não consta em migrations locais* | Não declarada em migration | Tabela de log de auditoria append-only inserida em `api/user/change-password`. **Precisa ter RLS ativado e sem permissão de UPDATE/DELETE**. |
| `public.site_traffic_analytics` | *Não consta em migrations locais* | Não declarada em migration | Inserção de telemetria em `api/telemetry/visit`. Armazena IP, geolocalização, fingerprint, UTMs. |
| `public.lesson_comments` | *Não consta em migrations locais* | Não declarada em migration | Consultada e manipulada em `api/comments` e `api/comments/like`. Contém comentários, likes, user_id, visibilidade pública/privada. |
| `public.user_notifications` | *Não consta em migrations locais* | Não declarada em migration | Gerenciada em `api/notifications`. Contém notificações do usuário. |
| `public.user_reading_state` | *Não consta em migrations locais* | Não declarada em migration | Gerenciada em `api/user/reading-state`. Contém progresso de leitura/scroll do aluno por aula. |

> **Nota sobre Matrículas/Cursos**: Não há tabela de matrículas (`enrollments` ou `course_enrollments`) no banco. O acesso é atualmente concedido a quem tem sessão (`auth.users`) sem checagem de produto/curso por aluno no banco.

### Views e Triggers
- Não foram encontradas views customizadas nas migrations do repositório.
- Triggers customizadas: Nenhuma trigger ativa declarada nas migrations de controle de integridade ou sync de auth (o provisionamento é feito via código em `services/userService.ts`).

### Buckets de Storage
| Bucket | Tipo | Policies | Uso no Código |
|---|---|---|---|
| `avatars` | Público | Não declarada no código (upload feito via `supabaseAdmin.storage`) | Usado em `api/user/upload-avatar/route.ts` para fotos de perfil dos alunos. |
| `media` | Declarado em `src/lib/storage.ts` | URL pública configurada | Referência legada para assets locais ou CDN (`/storage/v1/object/public/media`). |

---

## 2. Inventário de Rotas, API Routes, Middleware e Autorização

### Middleware (`src/middleware.ts`)
- **Quem pode chamar**: Todas as requisições (interceptador global).
- **Proteção**:
  - Filtro heurístico contra SQL injection em rotas e parâmetros (`detectSqlInjection`).
  - Protege rotas `/color-master-produto` e `/conteudo`: checa presença do cookie `sb-*-auth-token`.
  - **Vulnerabilidade**: Verifica apenas a **existência do nome do cookie**, sem validar a assinatura criptográfica do JWT nem consultar o Supabase Auth no servidor. Qualquer usuário pode forjar um cookie `sb-fake-auth-token=1` e burlar o middleware.

### Rotas de Páginas (`src/app/`)
| Rota | Acesso Esperado | Checagem Atual |
|---|---|---|
| `/` | Público | Nenhuma |
| `/color-master-produto` | Aluno Matriculado | Middleware superficial (apenas checa se existe cookie com prefixo `sb-`) |
| `/conteudo` | Aluno Matriculado | Middleware superficial |
| `/cursos` | Público | Nenhuma |
| `/produtos/[slug]` | Público | Nenhuma |
| `/links` | Público | Nenhuma |
| `/primeiro-acesso` | Público | Nenhuma |
| `/definir-senha` | Público | Nenhuma (recebe email e nome via query string) |
| `/termos`, `/privacidade` | Público | Nenhuma |

### API Routes (`src/app/api/`)
| Endpoint | Método | Papel Autorizado | Verificação de Autorização | Validação de Entrada |
|---|---|---|---|---|
| `/api/auth/login` | POST | Anônimo | N/A (ponto de autenticação). Lockout por tentativas. | Sanitização regex |
| `/api/auth/set-password` | POST | Anônimo / Aluno | **CRÍTICO: NENHUMA**. Permite alterar a senha de **qualquer email** apenas enviando `{ email, password }` no JSON. Qualquer atacante pode sequestrar qualquer conta. | Sanitização regex, tamanho >= 6 |
| `/api/auth/register-session` | POST | Aluno | **ALTO: NENHUMA**. Recebe `userId` no corpo da requisição sem verificar token do chamador. Permite deslogar qualquer usuário informando seu ID. | Sanitização regex |
| `/api/auth/session-heartbeat` | POST | Aluno | Verifica `sessionToken` no banco, mas não valida JWT do chamador. | Sanitização regex |
| `/api/user/change-password` | POST | Aluno | Exige `currentPassword` e valida via `signInWithPassword`. Porém recebe `userId` arbitrário no body. | Sanitização regex |
| `/api/user/update-profile` | POST | Aluno | **ALTO: IDOR**. Recebe `userId` arbitrário no body sem validar se coincide com o usuário autenticado. Permite alterar perfil de terceiros. | Sanitização regex, regex de nickname |
| `/api/user/upload-avatar` | POST | Aluno | **ALTO: IDOR**. Recebe `userId` no FormData sem validar JWT. Permite alterar avatar de qualquer usuário. Valida mime-type e tamanho (5MB). | Checa `image/` e `size <= 5MB` |
| `/api/user/ensure-nickname` | GET | Aluno / Anônimo | Recebe `userId` via query param sem autenticação. | Nenhuma |
| `/api/user/reading-state` | GET, POST | Aluno | **ALTO: IDOR**. Recebe `userId` no query param (GET) ou no body (POST). Não valida sessão do usuário logado. | Nenhuma formal |
| `/api/students/list` | GET | Aluno / Público | **MÉDIO**: Rota pública sem autenticação. Retorna IDs, nomes, nicknames e fotos de até 200 alunos cadastrados. | Nenhuma |
| `/api/comments` | GET, POST, DELETE | Aluno | **ALTO / IDOR**: GET recebe `userId` arbitrário para checagem de admin; POST recebe `userId` no body sem validar JWT; DELETE recebe `userId` e compara com o banco sem validar JWT. | Checa regex de link |
| `/api/comments/like` | POST | Aluno | Recebe `userId` arbitrário no body sem validar JWT. | Nenhuma |
| `/api/notifications` | GET, POST, DELETE | Aluno | **ALTO / IDOR**: Recebe `userId` via query param ou body sem checar JWT. Permite ler, marcar como lida e apagar notificações de qualquer aluno. | Nenhuma |
| `/api/checkout/asaas` | POST | Anônimo | Endpoint de criação de cobrança no Asaas. Validações anti-fraude por IP/MAC. | Sanitização regex |
| `/api/checkout/status` | GET | Anônimo | Consulta status de pagamento no Asaas por `paymentId`. Se aprovado, provisiona usuário e retorna link com email. | Nenhuma |
| `/api/checkout/abandon` | POST | Anônimo | Registro de leads. | Nenhuma formal |
| `/api/webhooks/asaas` | POST | Asaas Webhook | Verifica header `asaas-access-token` contra `process.env.ASAAS_WEBHOOK_SECRET`. | Nenhuma |
| `/api/offer-timer` | GET | Anônimo | Controle do cronômetro da oferta. | Nenhuma |
| `/api/member/bg-video` | GET, POST | Anônimo / Aluno | Controle de vídeo de fundo por MAC/IP/userId. | Nenhuma |
| `/api/telemetry/visit` | POST | Anônimo | Registro de visitas e telemetria. | Nenhuma |
| `/api/cep` | GET | Anônimo | Proxy de consulta de CEP (BrasilAPI / ViaCEP). | Valida 8 dígitos |
| `/api/empresas` | GET | Anônimo | Leitura de arquivos do disco local do servidor. | Nenhuma |
| `/api/indexnow` | GET, POST | Anônimo | Notificação Bing IndexNow. | Nenhuma |

---

## 3. Uso de `service_role` e Segredos

| Arquivo | Chave / Segredo Utilizado | Execução | Diagnóstico de Exposição |
|---|---|---|---|
| `src/utils/supabase/admin.ts` | `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` | Servidor | **Correto**: Roda somente no backend (`typeof window === 'undefined'`). Não exposto ao cliente. |
| `src/utils/offerPricing.ts` | `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` | Servidor | **Correto**: Roda no backend durante rotas de API. |
| `src/utils/memberBgVideo.ts` | `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` | Servidor | **Correto**: Roda apenas no backend. |
| `src/services/asaas.ts` | `ASAAS_API_KEY` ou `ASAAS_ACCESS_TOKEN` | Servidor | **Correto**: Executado estritamente em server-side API routes. |
| `src/services/notificationService.ts` | `RESEND_API_KEY` | Servidor | **Correto**: Executado somente em rotas de backend. |
| `src/app/api/webhooks/asaas/route.ts` | `ASAAS_WEBHOOK_SECRET` | Servidor | **Correto**: Comparação de header em server-side route. |

> **Conformidade da Regra 3**: Nenhuma chave `service_role` ou segredo de API de pagamento/e-mail possui prefixo `NEXT_PUBLIC_` ou está sendo importado diretamente em componentes de cliente (`'use client'`).

---

## 4. Variáveis de Ambiente e Prefixos Públicos

### Variáveis Públicas (`NEXT_PUBLIC_`)
- `NEXT_PUBLIC_SUPABASE_URL`: URL da instância Supabase (público por design).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase (público por design, restrita por RLS).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Chave publicável moderna do Supabase (público por design).
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`: Token de verificação do Bing Webmaster (público por design).

### Variáveis Privadas / Segredos (Server-Only)
- `SUPABASE_URL`: URL do projeto.
- `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY`: Chave mestra de administração do Supabase (**altamente sensível**).
- `ASAAS_API_KEY` / `ASAAS_ACCESS_TOKEN`: Token de integração bancária Asaas (**altamente sensível**).
- `ASAAS_WEBHOOK_SECRET`: Token de autenticação do Webhook Asaas.
- `DATABASE_URL` / `DIRECT_URL`: Conexão direta PostgreSQL (**altamente sensível**).
- `RESEND_API_KEY`: Chave de envio de emails transacionais.

---

## 5. Coleta, Armazenamento e Exibição de Dados Pessoais (PII)

| Dado Pessoal | Onde é Coletado | Onde é Armazenado | Onde é Exibido |
|---|---|---|---|
| Nome Completo | Checkout (`CheckoutModal.tsx`), Perfil | `public.profiles`, `public.pending_checkouts`, `public.checkout_abandonment_leads` | Header, Perfil, Comentários, `/api/students/list` |
| E-mail | Checkout, Login, Perfil | `auth.users`, `public.profiles`, `public.pending_checkouts`, `public.checkout_abandonment_leads` | Modal de Perfil, Alertas de Segurança |
| Telefone | Checkout, Perfil | `public.profiles`, `public.pending_checkouts`, `public.checkout_abandonment_leads` | Modal de Perfil |
| CPF / CNPJ | Checkout | `public.pending_checkouts`, Asaas (não gravado em profiles) | Não é exibido na UI |
| Endereço Residencial (JSON) | Checkout | `public.profiles.address`, `public.pending_checkouts.address` | Não é exibido |
| IP e Geolocalização | Telemetria, Login, Timer | `site_traffic_analytics`, `login_security_tracking`, `user_active_sessions` | Modais de alerta de sessão concorrente |
| Data de Nascimento / Idade | Checkout | `public.profiles`, `public.pending_checkouts` | Não exibido |

---

## 6. Renderização de Conteúdo, HTML e Markdown

1. **`dangerouslySetInnerHTML`**:
   - `src/app/layout.tsx`: Utilizado exclusivamente para injetar JSON-LD estruturado de SEO (`websiteSchema`, `organizationSchema`, etc.). Dados originados de arquivos de configuração locais estáticos.
   - `src/app/produtos/[slug]/page.tsx`: Utilizado para injetar JSON-LD estruturado de produtos e cursos. Origem: `src/config/products.ts`.
2. **Markdown**:
   - `src/components/InteractiveIdeationTheory.tsx`: Gera um template de texto Markdown para o aluno copiar para o clipboard (Notion/Trello). Não há parser ou renderizador de Markdown recebendo inputs de usuários ou banco.
3. **Construtor de Páginas**:
   - O projeto atualmente não possui um construtor de páginas dinâmico com salvamento em banco; as páginas são estáticas/SSR estruturadas via código React e dados estáticos em `src/data/data.ts`.

---

## 7. Integrações com o Panda Video

1. **Uso no Código**:
   - Localizado em `src/data/data.ts` (linha 30):
     `videoUrl: 'https://b-vz-5bb7b1c1-d28.tv.pandavideo.com.br/e559c1ae-4471-4c85-84ab-62154cb40b9f/playlist.m3u8'`
   - Consumido em `src/components/MemberAreaApp.tsx` e renderizado em `src/components/VideoLessonPlayer.tsx` utilizando `hls.js`.
2. **Falhas Críticas de Segurança Identificadas no Panda Video**:
   - **URL de HLS (`.m3u8`) exposta estaticamente no bundle do front-end**: Qualquer visitante pode inspecionar o código-fonte ou abrir o console e baixar o arquivo de manifesto e os segmentos de vídeo sem autenticação nem matrícula.
   - **Sem DRM / Watermark**: Não há rota de backend gerando token de sessão ou DRM Watermark dinâmico para identificar vazamentos de tela pelo aluno.
   - **Sem verificação de matrícula**: O player reproduz a URL direta sem validação do servidor.

---

## 8. Lista Priorizada de Vulnerabilidades Identificadas

### 🔴 CRÍTICO

1. **Redefinição de Senha Arbitrária sem Token / Verificação (Account Takeover Geral)**  
   - **Arquivo**: `src/app/api/auth/set-password/route.ts#L33-L53`  
   - **Descrição**: O endpoint recebe `{ email, password }` e executa `supabaseAdmin.auth.admin.updateUserById` para atualizar a senha e confirmar o email de qualquer usuário existente no Supabase Auth, sem solicitar token de redefinição, código de verificação ou senha antiga.  
   - **Impacto**: Qualquer invasor pode enviar uma requisição POST alterando a senha da conta de qualquer usuário ou administrador.

2. **Exposição Pública de Stream Direto HLS do Panda Video sem Autenticação ou DRM**  
   - **Arquivo**: `src/data/data.ts#L30` e `src/components/VideoLessonPlayer.tsx#L55-L65`  
   - **Descrição**: O link `.m3u8` do Panda Video está hardcoded no código estático do cliente. Qualquer pessoa (mesmo anônima) pode acessar e baixar o conteúdo do curso na íntegra.

3. **Inexistência de Tabela de Matrículas / Autorização de Conteúdo**  
   - **Arquivo**: `src/middleware.ts#L33-L46`  
   - **Descrição**: Não existe controle de matrículas por curso. Qualquer conta autenticada (ou até mesmo qualquer visitante forjando um cookie com o prefixo do Supabase) tem acesso às rotas restritas da área de membros.

### 🟠 ALTO

4. **IDOR Generalizado em Rotas de Usuário via `userId` Arbitrário**  
   - **Arquivos**:
     - `src/app/api/user/update-profile/route.ts#L18`
     - `src/app/api/user/upload-avatar/route.ts#L10`
     - `src/app/api/user/reading-state/route.ts#L9` e `L36`
     - `src/app/api/notifications/route.ts#L9`, `L41`, `L79`
     - `src/app/api/comments/route.ts#L107`, `L244`
     - `src/app/api/auth/register-session/route.ts#L17`
   - **Descrição**: Todas essas rotas recebem `userId` fornecido pelo cliente e operam no banco usando `supabaseAdmin` sem extrair nem validar a identidade do usuário através do JWT autenticado (`supabase.auth.getUser()`). Um usuário logado pode ler e modificar dados de qualquer outro aluno.

5. **Bypass Trivial do Middleware de Proteção de Rotas**  
   - **Arquivo**: `src/middleware.ts#L36-L38`  
   - **Descrição**: O middleware apenas verifica se existe algum cookie contendo a string `-auth-token`. Ele não valida a assinatura criptográfica da sessão nem a expiração.

6. **Exposição da Lista Completa de Alunos sem Autenticação**  
   - **Arquivo**: `src/app/api/students/list/route.ts#L9-L34`  
   - **Descrição**: Rota pública retorna lista de perfis de alunos (IDs, nomes, nicknames e fotos) para qualquer visitante anônimo.

### 🟡 MÉDIO

7. **Ausência de RLS em Tabelas Sensíveis do Sistema**  
   - **Arquivos**: `src/app/api/auth/login/route.ts` (`login_security_tracking`, `user_active_sessions`), `src/app/api/comments/route.ts` (`lesson_comments`, `user_notifications`)  
   - **Descrição**: Tabelas criadas fora das migrations versionadas não possuem policies explícitas no schema público declaradas no repositório.

8. **Ausência de Cabeçalhos de Segurança HTTP (HSTS, CSP, X-Frame-Options)**  
   - **Arquivo**: `next.config.ts`  
   - **Descrição**: Não há Content Security Policy (CSP), HSTS ou proteção contra clickjacking configurados no Next.js.

9. **Tokens de Sessão e Heartbeat Armazenados no `localStorage`**  
   - **Arquivo**: `src/components/LoginModal.tsx#L133`  
   - **Descrição**: Tokens de controle de concorrência são salvos no `localStorage`, acessíveis por scripts no front-end caso haja XSS.

### 🟢 BAIXO

10. **IndexNow com Chave Estática Exposta**  
    - **Arquivo**: `src/app/api/indexnow/route.ts#L7`  
    - **Descrição**: Chave de submissão do Bing IndexNow estática e hardcoded no arquivo de rota.

---

Este inventário cumpre integralmente a Fase de Diagnóstico (Leitura). Nenhuma alteração foi realizada nos arquivos do projeto.
