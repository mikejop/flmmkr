import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireActiveStudent } from '@/utils/supabase/access';
import { consumeUserRateLimit } from '@/utils/rateLimit';
import { getR2DownloadUrl, isR2Configured } from '@/utils/r2';
import { MEMBER_DOWNLOADS, MEMBER_DOWNLOAD_IDS } from '@/config/memberDownloads';
import { logAudit } from '@/services/auditLog';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
const querySchema = z.object({ item: z.enum(MEMBER_DOWNLOAD_IDS) });
const URL_TTL_SECONDS = 120;

/**
 * Material de apoio: devolve uma URL assinada de 2 minutos para o aluno com acesso ativo.
 * O navegador baixa direto do R2 (Content-Disposition: attachment), sem abrir página. Só vale um identificador da lista.
 */
export async function GET(req: NextRequest) {
  const gate = await requireActiveStudent();
  if (!gate.ok) return gate.response;
  const userId = gate.student.user.id;

  const parsed = querySchema.safeParse({ item: req.nextUrl.searchParams.get('item') });
  if (!parsed.success) return NextResponse.json({ error: 'Material não encontrado.' }, { status: 404, headers: NO_STORE });

  // 10 downloads por hora por aluno (o arquivo é grande: evita uso abusivo e custo).
  const allowed = await consumeUserRateLimit(userId, 'member-download', 10, 3600);
  if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
  if (!allowed) return NextResponse.json({ error: 'Muitos downloads em pouco tempo. Tente de novo mais tarde.' }, { status: 429, headers: NO_STORE });

  if (!isR2Configured()) {
    console.error('[members/download] R2 não configurado.');
    return NextResponse.json({ error: 'Download indisponível no momento.' }, { status: 503, headers: NO_STORE });
  }

  try {
    const item = MEMBER_DOWNLOADS[parsed.data.item];
    const url = await getR2DownloadUrl(item.key, URL_TTL_SECONDS, { downloadAs: item.filename });
    await logAudit({ userId, action: 'material_download', metadata: { item: parsed.data.item }, request: req });
    return NextResponse.json({ url, filename: item.filename, expiresInSeconds: URL_TTL_SECONDS }, { headers: NO_STORE });
  } catch (err) {
    console.error('[members/download]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Não foi possível iniciar o download agora.' }, { status: 500, headers: NO_STORE });
  }
}
