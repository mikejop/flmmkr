import 'server-only';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { applyPercentDiscount, evaluateCoupon, normalizeCouponCode, type CouponRejection } from '@/utils/couponMath';

/** Cupom vale só para o Color Master | Produto (o preço mostrado no site com fases e cronômetro). */
export const COUPON_PRODUCT_IDS = ['color-master-produto'] as const;

export interface CouponRow {
  id: string;
  code: string;
  discount_percent: number;
  affiliate_name: string | null;
}

export type CouponQuote =
  | { ok: true; coupon: CouponRow; original: number; discount: number; final: number; percent: number }
  | { ok: false; reason: 'invalid' | 'unavailable' | CouponRejection; message: string };

const MESSAGES: Record<string, string> = {
  invalid: 'O cupom que você digitou não existe.',
  inactive: 'O cupom que você digitou não existe.',
  not_started: 'Este cupom ainda não está valendo.',
  expired: 'Este cupom expirou.',
  limit_reached: 'Este cupom atingiu o limite de usos.',
  unavailable: 'Não foi possível validar o cupom agora. Tente de novo em instantes.',
};

/** Valida o cupom no banco e calcula o desconto sobre o preço atual (sempre no servidor). */
export async function quoteCoupon(rawCode: unknown, basePrice: number): Promise<CouponQuote> {
  const code = normalizeCouponCode(rawCode);
  if (!code) return { ok: false, reason: 'invalid', message: MESSAGES.invalid };

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('id, code, discount_percent, affiliate_name, active, starts_at, expires_at, max_uses, used_count')
    .eq('code', code)
    .maybeSingle();
  if (error) {
    console.error('[coupons] falha ao consultar cupom:', error.message);
    return { ok: false, reason: 'unavailable', message: MESSAGES.unavailable };
  }
  // Cupom que não existe e cupom inativo têm a mesma resposta ("não existe"): ninguém distingue um do outro por tentativa.
  if (!data) return { ok: false, reason: 'invalid', message: MESSAGES.invalid };

  const check = evaluateCoupon({
    active: data.active,
    discountPercent: Number(data.discount_percent),
    startsAt: data.starts_at,
    expiresAt: data.expires_at,
    maxUses: data.max_uses,
    usedCount: data.used_count,
  });
  if (!check.ok) return { ok: false, reason: check.reason, message: MESSAGES[check.reason] };

  const percent = Number(data.discount_percent);
  const math = applyPercentDiscount(basePrice, percent);
  return {
    ok: true,
    coupon: { id: data.id, code: data.code, discount_percent: percent, affiliate_name: data.affiliate_name },
    percent,
    ...math,
  };
}

/** Registra o pedido com cupom (relatório por afiliado). O contador de usos só sobe quando o pagamento é confirmado. */
export async function recordCouponOrder(params: {
  paymentId: string;
  couponId: string;
  couponCode: string;
  productId: string;
  original: number;
  discount: number;
  final: number;
}): Promise<void> {
  const { error } = await supabaseAdmin.from('coupon_orders').upsert(
    {
      asaas_payment_id: params.paymentId,
      coupon_id: params.couponId,
      coupon_code: params.couponCode,
      product_id: params.productId,
      original_price: params.original,
      discount_amount: params.discount,
      final_price: params.final,
    },
    { onConflict: 'asaas_payment_id', ignoreDuplicates: true }
  );
  if (error) console.error('[coupons] falha ao registrar pedido com cupom:', error.message);
}

/** Pagamento confirmado: marca o pedido e soma 1 uso ao cupom (uma única vez por pagamento). */
export async function confirmCouponOrder(paymentId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc('confirm_coupon_order', { p_payment_id: paymentId });
  if (error) console.error('[coupons] falha ao confirmar uso do cupom:', error.message);
}

/** Valor final registrado para a cobrança (o webhook confere o valor pago contra ele quando não há pedido pendente). */
export async function getCouponOrderFinalPrice(paymentId: string): Promise<number | null> {
  const { data } = await supabaseAdmin.from('coupon_orders').select('final_price').eq('asaas_payment_id', paymentId).maybeSingle();
  return data ? Number(data.final_price) : null;
}
