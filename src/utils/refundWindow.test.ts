import test from 'node:test';
import assert from 'node:assert/strict';
import { isRefundWindowOpen, refundDeadline } from './refundWindow.ts';

// Pagamento confirmado em 10/03/2026 (terça): o prazo termina em 17/03/2026 às 23:59:59 (horário de São Paulo).
const CONFIRMED = '2026-03-10';

test('prazo termina às 23:59:59 do 7º dia, horário de São Paulo', () => {
  assert.equal(refundDeadline(CONFIRMED)?.toISOString(), '2026-03-18T02:59:59.000Z');
});

test('dia 7 às 23:58 ainda aceita', () => {
  assert.equal(isRefundWindowOpen(CONFIRMED, new Date('2026-03-17T23:58:00-03:00')), true);
});

test('dia 7 às 23:59:59 ainda aceita', () => {
  assert.equal(isRefundWindowOpen(CONFIRMED, new Date('2026-03-17T23:59:59-03:00')), true);
});

test('dia 8 às 00:01 recusa', () => {
  assert.equal(isRefundWindowOpen(CONFIRMED, new Date('2026-03-18T00:01:00-03:00')), false);
});

test('o mesmo instante vale igual em UTC (não depende do fuso do servidor)', () => {
  assert.equal(isRefundWindowOpen(CONFIRMED, new Date('2026-03-18T02:58:00Z')), true);
  assert.equal(isRefundWindowOpen(CONFIRMED, new Date('2026-03-18T03:01:00Z')), false);
});

test('data inválida ou vazia nunca abre o prazo', () => {
  assert.equal(isRefundWindowOpen('', new Date()), false);
  assert.equal(isRefundWindowOpen('lixo', new Date()), false);
  assert.equal(refundDeadline('2026-13-45'), null);
});
