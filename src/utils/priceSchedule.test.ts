import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentBatchPrice } from './priceSchedule.ts';

const at = (iso: string) => getCurrentBatchPrice(new Date(iso));

test('até 16/10 23:59:59 o preço é R$ 95 fixo, sem cronômetro', () => {
  const p = at('2026-10-16T23:59:59-03:00');
  assert.equal(p.phaseId, 'launch');
  assert.equal(p.promoPrice, 95);
  assert.equal(p.currentBatchPrice, 95);
  assert.equal(p.timerMinutes, 0);
  assert.equal(p.isLaunchPhase, true);
});

test('17/10 00:00: R$ 125, cronômetro de 15 min para R$ 95', () => {
  const p = at('2026-10-17T00:00:00-03:00');
  assert.deepEqual([p.phaseId, p.promoPrice, p.currentBatchPrice, p.timerMinutes], ['lot125', 95, 125, 15]);
});

test('19/10 23:59:59 ainda é R$ 125; 20/10 00:00 vira R$ 150 com 10 min', () => {
  assert.equal(at('2026-10-19T23:59:59-03:00').currentBatchPrice, 125);
  const p = at('2026-10-20T00:00:00-03:00');
  assert.deepEqual([p.phaseId, p.promoPrice, p.currentBatchPrice, p.timerMinutes], ['lot150', 95, 150, 10]);
});

test('R$ 150 dura 3 dias (20, 21 e 22/10); 23/10 vira R$ 195, sem desconto nem cronômetro, até a Black November', () => {
  assert.equal(at('2026-10-22T23:59:59-03:00').currentBatchPrice, 150);
  const p = at('2026-10-23T00:00:00-03:00');
  assert.deepEqual([p.phaseId, p.promoPrice, p.currentBatchPrice, p.timerMinutes, p.isLaunchPhase], ['preBlack', 195, 195, 0, true]);
  assert.equal(p.promoPercentOffRegular, 0);
  assert.equal(at('2026-10-30T12:29:59-03:00').phaseId, 'preBlack');
});

test('descontos concatenados sobre o valor real de R$ 195', () => {
  const lot125 = at('2026-10-18T12:00:00-03:00');
  assert.equal(lot125.batchPercentOffRegular, 36); // 125 sobre 195
  assert.equal(lot125.promoPercentOffRegular, 51); // 95 sobre 195
  assert.equal(lot125.promoPercentOffBatch, 24); // 95 sobre 125
  assert.equal(at('2026-10-21T12:00:00-03:00').promoPercentOffBatch, 37); // 95 sobre 150
  assert.equal(at('2026-12-05T12:00:00-03:00').promoPercentOffRegular, 40);
});

test('Black November: 30/10 12:29:59 ainda é R$ 195; 12:30 vira R$ 67 com 7 min (66% OFF)', () => {
  assert.equal(at('2026-10-30T12:29:59-03:00').phaseId, 'preBlack');
  const p = at('2026-10-30T12:30:00-03:00');
  assert.deepEqual([p.phaseId, p.promoPrice, p.currentBatchPrice, p.timerMinutes], ['black', 67, 195, 7]);
  assert.equal(p.promoPercentOffRegular, 66);
  assert.equal(at('2026-10-30T15:30:00Z').phaseId, 'black'); // 12:30 em Brasília
});

test('Black November vai até 30/11 23:59:59 e depois volta a R$ 195 com 3 min e 40% de desconto', () => {
  assert.equal(at('2026-11-30T23:59:59-03:00').phaseId, 'black');
  const p = at('2026-12-01T00:00:00-03:00');
  assert.deepEqual([p.phaseId, p.promoPrice, p.currentBatchPrice, p.timerMinutes], ['full', 117, 195, 3]);
  assert.equal(p.promoPercentOffBatch, 40);
});
