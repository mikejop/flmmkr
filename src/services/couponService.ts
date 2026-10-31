import 'server-only';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { applyFixedPrice, applyPercentDiscount, evaluateCoupon, normalizeCouponCode, pickCouponPrice, type CouponRejection } from '@/utils/couponMath';

/** Cupom vale só para o Color Master | Produto (o preço mostrado no site com fases e cronômetro). */
export const COUPON_PRODUCT_IDS = ['color-master-produto'] as const;

export interface CouponRow {
  id: string;
  code: string;
  discount_percent: number | null;
  affiliate_name: string | null;
  /** Conta Asaas do afiliado e percentual do split (os dois juntos ou nenhum). */
  affiliate_wallet_id: string | null;
  affiliate_split_percent: number | null;
}

export type CouponQuote =
  | { ok: true; coupon: CouponRow; original: number; discount: number; final: number; percent: number }
  | { ok: false; reason: 'invalid' | 'unavailable' | 'no_benefit' | 'no_price' | CouponRejection; message: string };

const MESSAGES: Record<string, string> = {
  invalid: 'O cupom que você digitou não existe.',
  inactive: 'O cupom que você digitou não existe.',
  not_started: 'Este cupom ainda não está valendo.',
  expired: 'Este cupom expirou.',
  limit_reached: 'Este cupom atingiu o limite de usos.',
  no_benefit: 'Este cupom não dá desconto no preço atual.',
  no_price: 'Este cupom não está disponível no momento.',
  unavailable: 'Não foi possível validar o cupom agora. Tente de novo em instantes.',
};

/** Valida o cupom no banco e calcula o desconto sobre o preço atual (sempre no servidor). */
export async function quoteCoupon(rawCode: unknown, basePrice: number): Promise<CouponQuote> {
  const code = normalizeCouponCode(rawCode);
  if (!code) return { ok: false, reason: 'invalid', message: MESSAGES.invalid };

  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('id, code, discount_type, discount_percent, affiliate_name, affiliate_wallet_id, affiliate_split_percent, active, starts_at, expires_at, max_uses, used_count')
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
    discountPercent: Number(data.discount_percent ?? 0),
    startsAt: data.starts_at,
    expiresAt: data.expires_at,
    maxUses: data.max_uses,
    usedCount: data.used_count,
  });
  if (!check.ok) return { ok: false, reason: check.reason, message: MESSAGES[check.reason] };

  const coupon: CouponRow = { id: data.id, code: data.code, discount_percent: data.discount_percent == null ? null : Number(data.discount_percent), affiliate_name: data.affiliate_name, affiliate_wallet_id: data.affiliate_wallet_id, affiliate_split_percent: data.affiliate_split_percent == null ? null : Number(data.affiliate_split_percent) };

  // Cupom de PREÇO (ex.: MAGIC): paga o preço do cupom vigente na data, no lugar do preço do site.
  if (data.discount_type === 'fixed_price') {
    const { data: windows, error: windowsError } = await supabaseAdmin
      .from('coupon_prices')
      .select('price, starts_at, ends_at')
      .eq('coupon_id', data.id);
    if (windowsError) {
      console.error('[coupons] falha ao consultar preços do cupom:', windowsError.message);
      return { ok: false, reason: 'unavailable', message: MESSAGES.unavailable };
    }
    const couponPrice = pickCouponPrice((windows || []).map((w) => ({ price: Number(w.price), startsAt: w.starts_at, endsAt: w.ends_at })));
    if (couponPrice === null) return { ok: false, reason: 'no_price', message: MESSAGES.no_price };
    const fixed = applyFixedPrice(basePrice, couponPrice);
    if (!fixed.ok) return { ok: false, reason: 'no_benefit', message: MESSAGES.no_benefit };
    return { ok: true, coupon, original: fixed.original, discount: fixed.discount, final: fixed.final, percent: Math.round((1 - fixed.final / fixed.original) * 10000) / 100 };
  }

  const percent = Number(data.discount_percent ?? 0);
  const math = applyPercentDiscount(basePrice, percent);
  return { ok: true, coupon, percent, ...math };
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
  affiliateWalletId?: string | null;
  affiliateSplitPercent?: number | null;
  affiliateAmount?: number | null;
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
      affiliate_wallet_id: params.affiliateWalletId ?? null,
      affiliate_split_percent: params.affiliateSplitPercent ?? null,
      affiliate_amount: params.affiliateAmount ?? null,
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
