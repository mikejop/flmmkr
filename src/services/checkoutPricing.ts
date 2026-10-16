import 'server-only';
import type { NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { getCurrentBatchPrice, resolveOfferTimerSession } from '@/utils/offerPricing';
import { isValidExpiredOfferToken } from '@/utils/promoToken';

export class CheckoutPricingError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export interface CheckoutPrice {
  productId: string;
  /** Preço a pagar ANTES do cupom (é o mesmo que o site mostra naquele momento). */
  value: number;
  description: string;
  batchName: string;
  isRealExpired: boolean;
  hasDiscount25: boolean;
}

/**
 * Preço do produto agora, decidido só no servidor: fase de preço (R$ 95/125/150/195), cronômetro da oferta do visitante
 * e o desconto de 25% do tooltip. Fonte única usada pelo checkout e pela validação de cupom.
 */
export async function resolveCheckoutPrice(req: NextRequest, productId: string, ip: string): Promise<CheckoutPrice> {
  const batchInfo = getCurrentBatchPrice(new Date());
  let isRealExpired = false;

  if (productId !== 'color-master-completo' && !batchInfo.isLaunchPhase) {
    try {
      const sessionCookie = req.cookies.get('flmmkr_offer_session')?.value || '';
      if (!/^[a-f0-9-]{36}$/i.test(sessionCookie)) {
        throw new CheckoutPricingError('Recarregue a página para validar a oferta.', 409);
      }
      const timerSession = await resolveOfferTimerSession(createHash('sha256').update(sessionCookie).digest('hex'), ip);
      isRealExpired = Date.now() >= new Date(timerSession.expiresAt).getTime() || timerSession.isExpired;
    } catch (err) {
      if (err instanceof CheckoutPricingError) throw err;
      console.error('Erro ao validar timer no checkout:', err);
      throw new CheckoutPricingError('Não foi possível validar a oferta agora. Tente novamente.', 503);
    }
  }

  const hasDiscount25 = isValidExpiredOfferToken(req.cookies.get('flmmkr_discount_25')?.value) && isRealExpired;

  if (productId === 'color-master-completo') {
    return { productId, value: 497.0, description: 'Color Master Completo - FLMMKR', batchName: 'Completo', isRealExpired, hasDiscount25 };
  }

  let value = batchInfo.isLaunchPhase ? batchInfo.promoPrice : isRealExpired ? batchInfo.currentBatchPrice : batchInfo.promoPrice;
  let description = `Masterclass Color Master | Produto (${batchInfo.batchName})`;
  if (!batchInfo.isLaunchPhase && hasDiscount25 && isRealExpired) {
    value = Math.round(batchInfo.currentBatchPrice * 0.75);
    description += ' (Desconto Especial 25% OFF)';
  }
  return { productId, value, description, batchName: batchInfo.batchName, isRealExpired, hasDiscount25 };
}
