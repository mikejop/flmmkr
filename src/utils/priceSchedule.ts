/** Fases de preço e promoção (puro, sem servidor: testável). Tudo é decidido no servidor com a hora do servidor. */

export type PricePhaseId = 'launch' | 'lot125' | 'lot150' | 'preBlack' | 'full' | 'black';

export interface BatchPriceInfo {
  phaseId: PricePhaseId;
  /** Preço enquanto o cronômetro está ativo (R$ 95 nos lotes de 125 e 150; 40% de desconto no preço cheio). */
  promoPrice: number;
  /** Preço de venda da fase (vale quando o cronômetro acaba). */
  currentBatchPrice: number;
  /** Valor real do produto. */
  regularPrice: number;
  batchName: string;
  nextPriceDate?: string;
  /** Preço fixo, sem cronômetro (lançamento e a espera da Black November). */
  isLaunchPhase: boolean;
  /** Duração do cronômetro desta fase, em minutos (0 = sem cronômetro). */
  timerMinutes: number;
  /** Desconto da promoção sobre o preço de venda da fase (ex.: 95 sobre 125 = 24%). */
  promoPercentOffBatch: number;
  /** Desconto total sobre o valor real de R$ 195, "concatenando" desconto do lote + promoção (ex.: R$ 95 = 51%). */
  promoPercentOffRegular: number;
  /** Desconto do preço de venda da fase sobre o valor real (ex.: R$ 125 = 36%). */
  batchPercentOffRegular: number;
}

// Datas em horário de Brasília. Cada fase vai até 23:59:59 do último dia.
export const LOTE1_END_ISO = '2026-10-16T23:59:59-03:00'; // R$ 95 fixo, sem cronômetro
export const LOTE2_END_ISO = '2026-10-19T23:59:59-03:00'; // R$ 125 (cronômetro de 15 min para R$ 95)
export const LOTE3_END_ISO = '2026-10-22T23:59:59-03:00'; // R$ 150 por 3 dias (cronômetro de 10 min para R$ 95)
// Black November: R$ 195 por R$ 67, com 7 min por pessoa (uma vez só durante a campanha).
export const BLACK_NOVEMBER_START_ISO = '2026-10-30T12:30:00-03:00';
export const BLACK_NOVEMBER_END_ISO = '2026-11-30T23:59:59-03:00';

const REGULAR_PRICE = 195;
const FULL_PRICE_PROMO_PERCENT = 40; // preço cheio: cronômetro de 3 min com 40% de desconto
const pct = (from: number, to: number) => Math.round((1 - to / from) * 100);

function build(phaseId: PricePhaseId, promoPrice: number, currentBatchPrice: number, timerMinutes: number, batchName: string, nextPriceDate?: string): BatchPriceInfo {
  return {
    phaseId,
    promoPrice,
    currentBatchPrice,
    regularPrice: REGULAR_PRICE,
    batchName,
    nextPriceDate,
    isLaunchPhase: timerMinutes === 0,
    timerMinutes,
    promoPercentOffBatch: pct(currentBatchPrice, promoPrice),
    promoPercentOffRegular: pct(REGULAR_PRICE, promoPrice),
    batchPercentOffRegular: pct(REGULAR_PRICE, currentBatchPrice),
  };
}

/**
 * Fases do preço (tudo decidido no servidor, pela hora do servidor):
 * - até 16/10/2026 23:59: R$ 95 fixo, sem cronômetro;
 * - 17/10 a 19/10 23:59: R$ 125; o cronômetro de 15 min garante R$ 95;
 * - 20/10 a 22/10 23:59: R$ 150; o cronômetro de 10 min garante R$ 95;
 * - 23/10 até o início da Black November: R$ 195 (valor real), sem desconto e sem cronômetro;
 * - Black November (30/10/2026 12:30 a 30/11/2026 23:59): R$ 195; o cronômetro de 7 min garante R$ 95;
 * - depois: R$ 195 (valor real); o cronômetro de 3 min dá 40% de desconto (R$ 117).
 */
export function getCurrentBatchPrice(now: Date = new Date()): BatchPriceInfo {
  const t = now.getTime();
  if (t <= new Date(LOTE1_END_ISO).getTime()) return build('launch', 95, 95, 0, 'Lote Especial de Lançamento', '16/10/2026 às 23:59');
  if (t <= new Date(LOTE2_END_ISO).getTime()) return build('lot125', 95, 125, 15, '2º Lote Promocional', '19/10/2026');
  if (t <= new Date(LOTE3_END_ISO).getTime()) return build('lot150', 95, 150, 10, '3º Lote Promocional', '22/10/2026');
  if (t < new Date(BLACK_NOVEMBER_START_ISO).getTime()) return build('preBlack', REGULAR_PRICE, REGULAR_PRICE, 0, 'Preço Oficial', '30/10/2026 às 12:30');
  if (isBlackNovember(now)) return build('black', 95, REGULAR_PRICE, 7, 'Black November', '30/11/2026');
  return build('full', Math.round(REGULAR_PRICE * (1 - FULL_PRICE_PROMO_PERCENT / 100)), REGULAR_PRICE, 3, 'Preço Oficial Regular');
}

export function isBlackNovember(now: Date = new Date()): boolean {
  const t = now.getTime();
  return t >= new Date(BLACK_NOVEMBER_START_ISO).getTime() && t <= new Date(BLACK_NOVEMBER_END_ISO).getTime();
}
