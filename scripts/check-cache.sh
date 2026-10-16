#!/usr/bin/env bash
# Uso: scripts/check-cache.sh https://flmmkr.site
# Confere o comportamento de cache: páginas públicas devem dar HIT; área de membros e APIs pessoais nunca.
set -u
BASE="${1:-}"
if [ -z "$BASE" ]; then echo "Uso: $0 <url-base>  (ex.: https://flmmkr.site)"; exit 2; fi
BASE="${BASE%/}"
FAIL=0

hdr() { curl -sS -o /dev/null -D - --max-time 20 "$1" | tr -d '\r'; }
get() { printf '%s\n' "$1" | grep -i "^$2:" | head -1 | cut -d: -f2- | sed 's/^ *//'; }
ok()  { echo "  OK    $1"; }
bad() { echo "  FALHA $1"; FAIL=1; }

echo "Páginas públicas (2ª requisição precisa ser HIT)"
for path in / /termos /privacidade; do
  hdr "$BASE$path" >/dev/null            # aquece o cache
  h=$(hdr "$BASE$path")
  vc=$(get "$h" x-vercel-cache); nc=$(get "$h" x-nextjs-cache)
  if [ "$vc" = "HIT" ] || [ "$nc" = "HIT" ]; then ok "$path (x-vercel-cache=${vc:--} x-nextjs-cache=${nc:--})"
  else bad "$path não veio de cache (x-vercel-cache=${vc:--} x-nextjs-cache=${nc:--})"; fi
  if printf '%s\n' "$h" | grep -qi '^set-cookie:'; then bad "$path define cookie (não pode ser cacheado)"; fi
done

echo "Área de membros e APIs pessoais (private, no-store; nunca HIT)"
check_private() {
  path="$1"
  h=$(hdr "$BASE$path"); hdr "$BASE$path" >/dev/null; h=$(hdr "$BASE$path")
  cc=$(get "$h" cache-control); vc=$(get "$h" x-vercel-cache)
  if [ "$vc" = "HIT" ]; then bad "$path veio de cache (x-vercel-cache=HIT)"; return; fi
  case "$cc" in
    *private*no-store*|*no-store*private*) ok "$path (cache-control: $cc)" ;;
    *no-store*) ok "$path (cache-control: $cc)" ;;
    *) bad "$path sem 'private, no-store' (cache-control: ${cc:--})" ;;
  esac
}
for path in /color-master-produto /conteudo /login /api/comments?lessonId=mod1-1 /api/content/panda-info?lessonId=mod1-1 /api/notifications /api/offer-timer /api/auth/verify-access; do
  check_private "$path"
done

echo
if [ "$FAIL" -eq 0 ]; then echo "Tudo certo."; else echo "Há falhas acima."; fi
exit "$FAIL"
