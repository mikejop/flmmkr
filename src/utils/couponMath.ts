/** Cálculo e regras de cupom (puro, sem servidor: testável). Valores em reais; a conta é feita em centavos. */

export interface CouponRule {
  active: boolean;
  discountPercent: number;
  startsAt?: string | Date | null;
  expiresAt?: string | Date | null;
  maxUses?: number | null;
  usedCount?: number | null;
}

export type CouponRejection = 'inactive' | 'not_started' | 'expired' | 'limit_reached';

/** Desconto percentual sobre o preço ATUAL, arredondado para centavos (half-up). O preço-base nunca é fixo em código. */
export function applyPercentDiscount(price: number, discountPercent: number): { original: number; discount: number; final: number } {
  const originalCents = Math.round(price * 100);
  const finalCents = Math.round((originalCents * (100 - discountPercent)) / 100 + 1e-9);
  return {
    original: originalCents / 100,
    discount: (originalCents - finalCents) / 100,
    final: finalCents / 100,
  };
}

/** Código do cupom: espaços cortados, maiúsculas, só A-Z, 0-9, _ e - (3 a 32). null se não for um código possível. */
export function normalizeCouponCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9_-]{3,32}$/.test(code) ? code : null;
}

/** Cupom pode ser usado agora? */
export function evaluateCoupon(coupon: CouponRule, now: Date = new Date()): { ok: true } | { ok: false; reason: CouponRejection } {
  if (!coupon.active) return { ok: false, reason: 'inactive' };
  if (coupon.startsAt && now.getTime() < new Date(coupon.startsAt).getTime()) return { ok: false, reason: 'not_started' };
  if (coupon.expiresAt && now.getTime() > new Date(coupon.expiresAt).getTime()) return { ok: false, reason: 'expired' };
  if (coupon.maxUses != null && (coupon.usedCount ?? 0) >= coupon.maxUses) return { ok: false, reason: 'limit_reached' };
  return { ok: true };
}
