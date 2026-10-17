import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { consumeUserRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { getClientIp } from '@/utils/clientIp';
import { REFUND_REASON_CODES } from '@/config/refundReasons';
import { requestRefund } from '@/services/refundService';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const GENERIC_DENIED = 'Não foi possível solicitar o reembolso para esta compra.';

const bodySchema = z.object({
  paymentId: z.string().regex(/^[A-Za-z0-9_]{3,64}$/),
  // Questionário só de marcar: apenas códigos da lista (sem texto livre).
  reasons: z.array(z.enum(REFUND_REASON_CODES)).min(1).max(10),
  turnstileToken: z.string().max(2048).optional(),
}).strict();

/**
 * Reembolso em 7 dias, na hora e sem senha: exige login, Turnstile, 3 tentativas por hora e o questionário de motivos.
 * Prazo e elegibilidade são decididos no servidor a partir dos dados do Asaas; o cliente só pede.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: NO_STORE });

    // Entrada inválida é recusada antes de gastar uma das 3 tentativas por hora.
    const parsed = bodySchema.safeParse(await readJsonLimited(req, 4096));
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400, headers: NO_STORE });

    const allowed = await consumeUserRateLimit(user.id, 'account-refund', 3, 3600);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
    if (!allowed) return NextResponse.json({ error: 'Muitas tentativas. Tente de novo mais tarde.' }, { status: 429, headers: NO_STORE });

    const turnstile = await verifyTurnstile(parsed.data.turnstileToken, getClientIp(req));
    if (!turnstile.ok) {
      const status = turnstile.reason === 'misconfigured' ? 503 : 403;
      return NextResponse.json({ error: 'Não foi possível validar a verificação de segurança. Tente de novo.' }, { status, headers: NO_STORE });
    }

    const outcome = await requestRefund({ userId: user.id, paymentId: parsed.data.paymentId, reason: Array.from(new Set(parsed.data.reasons)).join(','), request: req });

    switch (outcome.kind) {
      case 'ineligible':
        return NextResponse.json({ error: GENERIC_DENIED }, { status: 403, headers: NO_STORE });
      case 'existing':
        return NextResponse.json({ status: outcome.status === 'completed' ? 'completed' : outcome.status === 'processing' || outcome.status === 'pending' ? 'processing' : 'review', requestId: outcome.requestId }, { headers: NO_STORE });
      case 'manual_review':
        return NextResponse.json({ status: 'review', requestId: outcome.requestId }, { status: 202, headers: NO_STORE });
      case 'failed':
        // O acesso já foi revogado e a equipe foi avisada; o aluno recebe uma resposta honesta, sem detalhe técnico.
        return NextResponse.json({ status: 'review', requestId: outcome.requestId }, { status: 202, headers: NO_STORE });
      case 'processing':
        return NextResponse.json({ status: 'processing', requestId: outcome.requestId, bankSlipRefundUrl: outcome.bankSlipRefundUrl ?? null }, { headers: NO_STORE });
    }
  } catch (err) {
    console.error('[account/refund]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Não foi possível processar agora. Tente novamente em instantes.' }, { status: 500, headers: NO_STORE });
  }
}
