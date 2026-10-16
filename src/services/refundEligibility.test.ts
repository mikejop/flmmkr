import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRefundEligibility, refundEndpointFor, productKeyFromDescription } from './refundEligibility.ts';

const paid = { status: 'CONFIRMED', confirmedDate: '2026-03-10' };
const at = (iso: string) => new Date(iso);

test('dia 7 às 23:58 é aceito', () => {
  assert.equal(evaluateRefundEligibility(paid, { hasExistingRefund: false, now: at('2026-03-17T23:58:00-03:00') }).ok, true);
});

test('dia 8 às 00:01 é recusado', () => {
  const r = evaluateRefundEligibility(paid, { hasExistingRefund: false, now: at('2026-03-18T00:01:00-03:00') });
  assert.deepEqual(r, { ok: false, reason: 'window_closed' });
});

test('RECEIVED também vale; PENDING e OVERDUE não', () => {
  const now = at('2026-03-11T10:00:00-03:00');
  assert.equal(evaluateRefundEligibility({ ...paid, status: 'RECEIVED' }, { hasExistingRefund: false, now }).ok, true);
  assert.equal(evaluateRefundEligibility({ ...paid, status: 'PENDING' }, { hasExistingRefund: false, now }).ok, false);
  assert.equal(evaluateRefundEligibility({ ...paid, status: 'OVERDUE' }, { hasExistingRefund: false, now }).ok, false);
});

test('reembolso anterior, chargeback, cobrança removida e já reembolsada são recusados', () => {
  const now = at('2026-03-11T10:00:00-03:00');
  assert.deepEqual(evaluateRefundEligibility(paid, { hasExistingRefund: true, now }), { ok: false, reason: 'already_requested' });
  assert.deepEqual(evaluateRefundEligibility({ ...paid, status: 'CHARGEBACK_REQUESTED' }, { hasExistingRefund: false, now }), { ok: false, reason: 'chargeback' });
  assert.deepEqual(evaluateRefundEligibility({ ...paid, chargeback: { status: 'REQUESTED' } }, { hasExistingRefund: false, now }), { ok: false, reason: 'chargeback' });
  assert.deepEqual(evaluateRefundEligibility({ ...paid, deleted: true }, { hasExistingRefund: false, now }), { ok: false, reason: 'deleted' });
  assert.deepEqual(evaluateRefundEligibility({ ...paid, status: 'REFUNDED' }, { hasExistingRefund: false, now }), { ok: false, reason: 'status' });
});

test('sem data de confirmação nunca libera (falha fechada); usa paymentDate se confirmedDate faltar', () => {
  const now = at('2026-03-11T10:00:00-03:00');
  assert.deepEqual(evaluateRefundEligibility({ status: 'CONFIRMED' }, { hasExistingRefund: false, now }), { ok: false, reason: 'no_confirmation_date' });
  assert.equal(evaluateRefundEligibility({ status: 'RECEIVED', paymentDate: '2026-03-10' }, { hasExistingRefund: false, now }).ok, true);
});

test('cada forma de pagamento usa o endpoint certo', () => {
  assert.equal(refundEndpointFor({ billingType: 'CREDIT_CARD' }), 'payment');
  assert.equal(refundEndpointFor({ billingType: 'PIX' }), 'payment');
  assert.equal(refundEndpointFor({ billingType: 'BOLETO' }), 'bank_slip');
  assert.equal(refundEndpointFor({ billingType: 'CREDIT_CARD', installment: 'ins_123' }), 'installment');
});

test('chave do produto pela descrição', () => {
  assert.equal(productKeyFromDescription('Color Master Completo - FLMMKR'), 'color-master-completo');
  assert.equal(productKeyFromDescription('Masterclass Color Master | Produto (Lote 2)'), 'color-master-produto');
});
