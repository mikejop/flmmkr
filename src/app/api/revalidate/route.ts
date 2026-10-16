import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { consumeRateLimit, readJsonLimited } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const bodySchema = z.object({ tag: z.string().regex(/^[A-Za-z0-9:_-]{1,128}$/) }).strict();

/** Comparação em tempo constante (compara os hashes SHA-256, que têm sempre o mesmo tamanho). */
function secretsMatch(received: string, expected: string): boolean {
  const a = createHash('sha256').update(received).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

/**
 * POST /api/revalidate  { "tag": "panda-meta" }   Authorization: Bearer <REVALIDATE_SECRET>
 * Invalida o cache compartilhado de uma tag. Sem sessão de usuário; protegido só pelo segredo + rate limit.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected) {
    console.error('[revalidate] REVALIDATE_SECRET ausente: rota desativada.');
    return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
  }

  // Rate limit antes de olhar o segredo: tentativas erradas também contam (10 por minuto por IP).
  const allowed = await consumeRateLimit(req, 'revalidate', 10, 60);
  if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429, headers: { ...NO_STORE, 'Retry-After': '60' } });

  const header = req.headers.get('authorization') || '';
  const received = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!received || !secretsMatch(received, expected)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401, headers: NO_STORE });
  }

  const parsed = bodySchema.safeParse(await readJsonLimited(req, 1024));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400, headers: NO_STORE });

  revalidateTag(parsed.data.tag, 'max');
  return NextResponse.json({ revalidated: true, tag: parsed.data.tag }, { headers: NO_STORE });
}
