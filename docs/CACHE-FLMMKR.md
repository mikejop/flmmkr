# Cache e economia de servidor — FLMMKR

Objetivo: reduzir chamadas ao Supabase (banco/Storage) e à Vercel. Tudo o que é estável fica no
computador do aluno por **até 7 dias** ou **até o sistema mudar** (novo deploy).

## Invalidação por versão
`next.config.ts` define `NEXT_PUBLIC_APP_VERSION` = commit da Vercel (`VERCEL_GIT_COMMIT_SHA`).
- `src/lib/appVersion.ts` expõe a versão.
- `src/lib/clientCache.ts`: toda entrada guarda a versão; versão diferente ou > 7 dias = descartada.
- `public/sw.js` é registrado como `/sw.js?v=<versão>`; versão nova => service worker novo => caches
  `flmmkr-*` das versões antigas são apagados na ativação.
- Em desenvolvimento a versão é `local` e o service worker **não** é registrado.

## Camadas
| Camada | Onde | O que guarda | Validade |
|---|---|---|---|
| Service worker (proxy) | `public/sw.js` | `/api/members/file` (arquivos privados, com suporte a Range) e imagens públicas do bucket `site-public` | 7 dias |
| Cache de dados | `src/lib/clientCache.ts` (localStorage) | perfil, lista de alunos (menções), marcadores de checagem | perfil 6 h · lista 12 h · máx. 7 dias |
| Cabeçalhos HTTP | `next.config.ts` | `/fonts/*`, `/images/*` | 7 dias + revalidação em segundo plano |
| Servidor | `verifyAccessCached` (`paymentVerificationService.ts`) | aprovação de pagamento (só positivas) | 5 min por instância; invalidada no webhook de estorno |

## Regras de segurança
- O service worker só grava `/api/members/file` quando o servidor respondeu 200 (sessão e pagamento
  validados). 401/404 apagam a cópia local.
- A chave do cache é o caminho lógico do arquivo, nunca a URL assinada (expira em 10 min).
- Logout: `purgeClientCache()` + `purgePrivateCache()` apagam dados e arquivos privados.
- Rotas de dados do aluno (`/api/*`), HTML, auth e vídeo das aulas (Panda) **não** passam pelo cache.

## Outras reduções de chamadas
- Heartbeat de sessão única: 10 s → 60 s, e pausado com a aba oculta.
- Notificações: 45 s → 3 min, só com a aba visível.
- Estado de leitura: gravação agrupada (5 s) e só se mudou; leitura na nuvem no máx. 1x/hora.
- `onAuthStateChange` só recarrega em login de outra conta (antes cada refresh de token refazia tudo).
- Abertura da área: aprovação de acesso lembrada por 6 h neste aparelho.
- `proxy.ts` não roda mais para `sw.js`, `/fonts/*` e arquivos estáticos (fontes, vídeos, avif).
