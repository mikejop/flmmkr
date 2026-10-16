import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPercentDiscount, evaluateCoupon, normalizeCouponCode } from './couponMath.ts';

// Percentual do cupom MAGIC (29,473684% = R$ 95 -> R$ 67)
const MAGIC = 29.473684;

test('MAGIC: R$ 95 -> 67, 125 -> 88,16, 150 -> 105,79, 195 -> 137,53', () => {
  assert.equal(applyPercentDiscount(95, MAGIC).final, 67);
  assert.equal(applyPercentDiscount(125, MAGIC).final, 88.16);
  assert.equal(applyPercentDiscount(150, MAGIC).final, 105.79);
  assert.equal(applyPercentDiscount(195, MAGIC).final, 137.53);
});

test('o desconto em reais é a diferença exata para o preço original', () => {
  const r = applyPercentDiscount(95, MAGIC);
  assert.deepEqual(r, { original: 95, discount: 28, final: 67 });
  const r2 = applyPercentDiscount(125, MAGIC);
  assert.equal(Math.round((r2.original - r2.discount - r2.final) * 100), 0);
});

test('acompanha qualquer preço novo sem mexer no código (117 e 94)', () => {
  assert.equal(applyPercentDiscount(117, MAGIC).final, 82.52);
  assert.equal(applyPercentDiscount(94, MAGIC).final, 66.29);
});

test('código: maiúsculas/minúsculas e espaços valem; lixo não', () => {
  assert.equal(normalizeCouponCode('magic'), 'MAGIC');
  assert.equal(normalizeCouponCode('  Magic  '), 'MAGIC');
  assert.equal(normalizeCouponCode('MAGIC'), 'MAGIC');
  assert.equal(normalizeCouponCode(''), null);
  assert.equal(normalizeCouponCode('ma'), null);
  assert.equal(normalizeCouponCode("MAGIC'; DROP TABLE"), null);
  assert.equal(normalizeCouponCode(123), null);
});

test('cupom inativo, fora da data ou esgotado é recusado', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  assert.deepEqual(evaluateCoupon({ active: false, discountPercent: 10 }, now), { ok: false, reason: 'inactive' });
  assert.deepEqual(evaluateCoupon({ active: true, discountPercent: 10, startsAt: '2026-10-21T00:00:00Z' }, now), { ok: false, reason: 'not_started' });
  assert.deepEqual(evaluateCoupon({ active: true, discountPercent: 10, expiresAt: '2026-10-19T00:00:00Z' }, now), { ok: false, reason: 'expired' });
  assert.deepEqual(evaluateCoupon({ active: true, discountPercent: 10, maxUses: 5, usedCount: 5 }, now), { ok: false, reason: 'limit_reached' });
  assert.deepEqual(evaluateCoupon({ active: true, discountPercent: 10, maxUses: 5, usedCount: 4, expiresAt: '2026-12-01T00:00:00Z' }, now), { ok: true });
  assert.deepEqual(evaluateCoupon({ active: true, discountPercent: 10 }, now), { ok: true });
});
