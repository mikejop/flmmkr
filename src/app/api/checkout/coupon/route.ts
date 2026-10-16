import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { consumeRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { getClientIp } from '@/utils/clientIp';
import { resolveCheckoutPrice, CheckoutPricingError } from '@/services/checkoutPricing';
import { quoteCoupon, COUPON_PRODUCT_IDS } from '@/services/couponService';
import { isProductionRuntime } from '@/utils/runtimeEnv';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const bodySchema = z.object({
  code: z.string().trim().min(1).max(40),
  productId: z.enum(COUPON_PRODUCT_IDS).default('color-master-produto'),
}).strict();

/**
 * Valida o cupom e devolve o desconto sobre o preço que o site está oferecendo agora. Tudo é calculado no servidor:
 * o navegador só manda o código. Limite de tentativas por IP para ninguém adivinhar códigos.
 */
export async function POST(req: NextRequest) {
  const allowed = await consumeRateLimit(req, 'coupon-validate', 15, 600);
  if (allowed === null && isProductionRuntime()) {
    return NextResponse.json({ valid: false, error: 'Serviço indisponível. Tente de novo em instantes.' }, { status: 503, headers: NO_STORE });
  }
  if (allowed === false) {
    return NextResponse.json({ valid: false, error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429, headers: { ...NO_STORE, 'Retry-After': '600' } });
  }

  const parsed = bodySchema.safeParse(await readJsonLimited(req, 1024));
  if (!parsed.success) return NextResponse.json({ valid: false, error: 'Informe o código do cupom.' }, { status: 400, headers: NO_STORE });

  try {
    const price = await resolveCheckoutPrice(req, parsed.data.productId, getClientIp(req) || 'UNKNOWN');
    const quote = await quoteCoupon(parsed.data.code, price.value);
    if (!quote.ok) {
      return NextResponse.json({ valid: false, error: quote.message }, { status: quote.reason === 'unavailable' ? 503 : 200, headers: NO_STORE });
    }
    return NextResponse.json({
      valid: true,
      code: quote.coupon.code,
      original: quote.original,
      discount: quote.discount,
      final: quote.final,
      percent: Math.round(quote.percent * 100) / 100,
    }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof CheckoutPricingError) {
      return NextResponse.json({ valid: false, error: err.message }, { status: err.status, headers: NO_STORE });
    }
    console.error('[checkout/coupon]', err instanceof Error ? err.message : err);
    return NextResponse.json({ valid: false, error: 'Não foi possível validar o cupom agora.' }, { status: 500, headers: NO_STORE });
  }
}
