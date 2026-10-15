import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { consumeUserRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { getClientIp } from '@/utils/clientIp';
import { hasRecentReauth } from '@/utils/reauth';
import { requestRefund } from '@/services/refundService';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const GENERIC_DENIED = 'Não foi possível solicitar o reembolso para esta compra.';

const bodySchema = z.object({
  paymentId: z.string().regex(/^[A-Za-z0-9_]{3,64}$/),
  reason: z.string().trim().max(500).optional(),
  turnstileToken: z.string().max(2048).optional(),
}).strict();

/**
 * Reembolso em 7 dias. Exige login, reautenticação recente (senha, 5 min), Turnstile e 3 tentativas por hora.
 * Prazo e elegibilidade são decididos no servidor a partir dos dados do Asaas; o cliente só pede.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: NO_STORE });

    const allowed = await consumeUserRateLimit(user.id, 'account-refund', 3, 3600);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
    if (!allowed) return NextResponse.json({ error: 'Muitas tentativas. Tente de novo mais tarde.' }, { status: 429, headers: NO_STORE });

    const parsed = bodySchema.safeParse(await readJsonLimited(req, 4096));
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400, headers: NO_STORE });

    const turnstile = await verifyTurnstile(parsed.data.turnstileToken, getClientIp(req));
    if (!turnstile.ok) {
      const status = turnstile.reason === 'misconfigured' ? 503 : 403;
      return NextResponse.json({ error: 'Não foi possível validar a verificação de segurança. Tente de novo.' }, { status, headers: NO_STORE });
    }

    if (!(await hasRecentReauth(user.id))) {
      return NextResponse.json({ error: 'Confirme sua senha para continuar.', code: 'reauth_required' }, { status: 401, headers: NO_STORE });
    }

    const outcome = await requestRefund({ userId: user.id, paymentId: parsed.data.paymentId, reason: parsed.data.reason, request: req });

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
