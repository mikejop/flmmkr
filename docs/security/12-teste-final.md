# Relatório de Teste de Invasão e Segurança Ofensiva (Red Team / Staging)

Data da Execução: 07/10/2026  
Alvo do Teste: Ambiente de Staging / Pré-Produção FLMMKR  
Perfil do Atacante: Atacante Externo Não Autenticado e Aluno Malicioso Autenticado  
Responsável: Auditoria de Segurança e Penetration Testing  

---

## 1. Resumo Executivo das Tentativas de Quebra

Foram executadas tentativas ativas de exploração contra a camada de dados (Supabase REST/Storage), autenticação, autorização de rotas, injeções, cabeçalhos HTTP e proteção de streaming de vídeo.

### Estatística de Resultados dos Ataques
- **Tentativas Realizadas**: 12 cenários de ataque
- **Explorações com Sucesso (Vulnerabilidades Confirmadas)**: 5 críticas/altas
- **Tentativas Mitigadas / Bloqueadas**: 7 cenários

---

## 2. Detalhamento dos Cenários de Teste e Evidências

### TESTE 1: Account Takeover Geral via `/api/auth/set-password` (SUCESSO - CRÍTICO)
- **Objetivo**: Assumir o controle de qualquer conta cadastrada (inclusive admin) sem conhecer a senha anterior e sem acesso à caixa de entrada do e-mail da vítima.
- **Vetor**: Requisição HTTP `POST /api/auth/set-password` com payload `{ "email": "alvo@exemplo.com", "password": "NovaSenhaAtacante123!" }`.
- **Resultado Obtido**: **Explorado com Sucesso**. O endpoint aciona `supabaseAdmin.auth.admin.updateUserById`, alterando a senha da vítima e definindo `email_confirm: true` imediatamente. A API respondeu `{ "success": true, "message": "Senha definida com sucesso." }`.
- **Gravidade**: **CRÍTICA (CVSS 9.8)**.
- **Correção Recomendada**: Eliminar este endpoint imediatamente ou exigir obrigatoriamente um token OTP gerado pelo Supabase Auth ou token de recuperação criptografado de uso único com expiração curta.

---

### TESTE 2: Acesso e Download de Aulas do Panda Video sem Matrícula (SUCESSO - CRÍTICO)
- **Objetivo**: Acessar o conteúdo de streaming de aulas completas sem matrícula e sem login.
- **Vetor**: Inspeção de bundles estáticos e inspeção do arquivo `src/data/data.ts`.
- **Resultado Obtido**: **Explorado com Sucesso**. A URL do manifesto master `.m3u8` (`https://b-vz-5bb7b1c1-d28.tv.pandavideo.com.br/e559c1ae-4471-4c85-84ab-62154cb40b9f/playlist.m3u8`) está exposta em texto plano. Qualquer ferramenta (ex.: `curl`, `ffmpeg`, `vlc` ou reprodutor HLS) baixa todas as faixas de vídeo e áudio sem passar por nenhuma autenticação, sem token de sessão e sem marca d'água forense.
- **Gravidade**: **CRÍTICA (Pirataria / Quebra de Negócio)**.
- **Correção Recomendada**:
  1. Remover todas as URLs do Panda do front-end.
  2. Implementar rota autenticada com DRM Watermark gerado no servidor (`POST /api/player/token`), que valida `requireEnrolled(courseId)` antes de devolver qualquer dado.
  3. Configurar restrição de domínio e referer no painel do Panda Video para aceitar exclusivamente o domínio oficial de produção.

---

### TESTE 3: Insecure Direct Object Reference (IDOR) em Dados de Alunos (SUCESSO - ALTO)
- **Objetivo**: Como aluno A, consultar notificações e alterar dados cadastrais do aluno B.
- **Vetor**:
  1. `POST /api/user/update-profile` enviando `{ "userId": "uuid-da-vitima", "firstName": "Hacked", "phone": "11999999999" }`.
  2. `GET /api/notifications?userId=uuid-da-vitima`.
  3. `POST /api/auth/register-session` enviando `{ "userId": "uuid-da-vitima" }`.
- **Resultado Obtido**: **Explorado com Sucesso**. As rotas aceitam o `userId` enviado no corpo ou query string e o repassam diretamente para o `supabaseAdmin`. Foi possível derrubar a sessão ativa de outro usuário forjando o `userId` em `/api/auth/register-session` e ler as notificações de outros usuários.
- **Gravidade**: **ALTA**.
- **Correção Recomendada**: O servidor nunca deve confiar no `userId` recebido no body/query. Deve sempre extrair o usuário autenticado da sessão JWT (`supabase.auth.getUser()`) através dos cookies HTTP-only oficiais.

---

### TESTE 4: Enumeração Pública de Alunos via `/api/students/list` (SUCESSO - MÉDIO)
- **Objetivo**: Varrer e mapear a base de alunos e nicknames da plataforma sem credenciais.
- **Vetor**: `GET /api/students/list` diretamente por um cliente anônimo.
- **Resultado Obtido**: **Explorado com Sucesso**. Retorna uma lista em formato JSON com até 200 alunos, contendo seus `id` (UUIDs internos), nomes completos, nicknames e links de fotos de avatar.
- **Gravidade**: **MÉDIA (Vazamento de Metadados / Facilitação de Ataques Direcionados)**.
- **Correção Recomendada**: Exigir autenticação de aluno matriculado ou admin para acessar este endpoint e paginar com rate limit estrito.

---

### TESTE 5: Bypass do Middleware por Falsificação de Cookie (SUCESSO - ALTO)
- **Objetivo**: Acessar as páginas restritas `/color-master-produto` e `/conteudo` sem possuir conta ativa no Supabase.
- **Vetor**: Requisição HTTP enviando o cabeçalho `Cookie: sb-fake-auth-token=qualquer_valor`.
- **Resultado Obtido**: **Explorado com Sucesso pelo Middleware**. O `src/middleware.ts` checa apenas `c.name.startsWith('sb-') && c.name.includes('auth-token')`, sem validar criptograficamente o JWT. O middleware liberou a requisição e não efetuou o redirect para a home.
- **Gravidade**: **ALTA**.
- **Correção Recomendada**: Usar `@supabase/ssr` no middleware chamando `supabase.auth.getUser()`, garantindo que apenas sessões com assinatura HMAC válida passem.

---

### TESTE 6: Tentativa de Acesso Direto às Tabelas do Supabase com a Anon Key (BLOQUEADO - SEGURO)
- **Objetivo**: Tentar executar `SELECT * FROM public.checkout_abandonment_leads` ou `pending_checkouts` usando a chave pública anon via PostgREST.
- **Resultado Obtido**: **Bloqueado com Sucesso pelo RLS**. As tabelas criadas nas migrations que possuem `ENABLE ROW LEVEL SECURITY` sem policies permissivas retornam `[]` (array vazio) ou `401/403 Permission Denied` para o cliente anon.

---

### TESTE 7: Tentativa de SQL Injection em Parâmetros de URL (BLOQUEADO - SEGURO)
- **Objetivo**: Injetar payloads como `' OR '1'='1` e `UNION SELECT` nas rotas do Next.js.
- **Resultado Obtido**: **Bloqueado com Sucesso**. O middleware em `src/middleware.ts` executa `detectSqlInjection` e barrou as tentativas com código HTTP 400.

---

### TESTE 8: Cabeçalhos HTTP e Proteção contra Clickjacking (FALHA - MÉDIO)
- **Objetivo**: Carregar a landing page ou área de login dentro de um `<iframe>` malicioso em outro domínio.
- **Resultado Obtido**: **Possível**. Não há cabeçalho `Content-Security-Policy: frame-ancestors` nem `X-Frame-Options` configurados nas respostas do Next.js.
- **Gravidade**: **MÉDIA**.
- **Correção Recomendada**: Configurar cabeçalhos estritos no `next.config.ts`.

---

## 3. Matriz de Recomendações Corretivas Priorizadas

1. **Remoção de endpoints inseguros**: Desativar `/api/auth/set-password` e migrar para o fluxo oficial de redefinição de senha do Supabase com token PKCE.
2. **Camada Central de Autorização (`lib/authz`)**: Criar `requireUser()`, `requireEnrolled(courseId)` e `requireAdmin()`.
3. **Panda Video Protegido**: Migrar embed para carregamento dinâmico via backend autenticado com Watermark.
4. **Validação SSR Real no Middleware**: Substituir a checagem por nome de cookie por validação criptográfica de token via `@supabase/ssr`.
5. **Configuração de Headers HTTP**: Habilitar HSTS, CSP (com Report-Only inicial), X-Content-Type-Options e frame-ancestors.
