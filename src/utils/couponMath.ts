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

export interface CouponPriceWindow {
  price: number;
  startsAt?: string | Date | null;
  /** O instante final NÃO entra na janela (R$ 67 até 01/11 00:00 significa até 31/10 23:59:59). */
  endsAt?: string | Date | null;
}

/** Preço do cupom vigente agora (cupom de preço fixo por período). null se nenhuma janela cobre o momento. */
export function pickCouponPrice(windows: CouponPriceWindow[], now: Date = new Date()): number | null {
  const t = now.getTime();
  const active = windows.filter((w) =>
    (!w.startsAt || t >= new Date(w.startsAt).getTime()) && (!w.endsAt || t < new Date(w.endsAt).getTime())
  );
  if (active.length === 0) return null;
  // Se duas janelas se sobrepuserem, vale a que começou por último.
  active.sort((a, b) => (b.startsAt ? new Date(b.startsAt).getTime() : -Infinity) - (a.startsAt ? new Date(a.startsAt).getTime() : -Infinity));
  return active[0].price;
}

/**
 * Cupom de PREÇO: o aluno paga o preço do cupom no lugar do preço do site (não soma com o desconto do cronômetro).
 * Só vale se for mais barato que o preço que o site está mostrando.
 */
export function applyFixedPrice(sitePrice: number, couponPrice: number): { ok: true; original: number; discount: number; final: number } | { ok: false } {
  const originalCents = Math.round(sitePrice * 100);
  const finalCents = Math.round(couponPrice * 100);
  if (finalCents >= originalCents) return { ok: false };
  return { ok: true, original: originalCents / 100, discount: (originalCents - finalCents) / 100, final: finalCents / 100 };
}
