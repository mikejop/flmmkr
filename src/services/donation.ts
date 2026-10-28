import 'server-only';
import { DONATION_DESCRIPTION, DONATION_REF_PREFIX } from '@/utils/donation';

/** Link de pagamento "FLMMKR Plugins - Doação" criado no painel do Asaas (valor livre). */
const DONATION_PAYMENT_LINK_ID = '7pe5q47kt4h2u9r5';

/**
 * Cobrança que é doação (modal da página /plugins ou link de doação do Asaas).
 * O webhook usa isto para nunca criar conta nem liberar curso a partir de uma doação.
 */
export function isDonationPayment(payment: { externalReference?: string | null; paymentLink?: string | null; description?: string | null }): boolean {
  return (
    Boolean(payment.externalReference?.startsWith(DONATION_REF_PREFIX)) ||
    payment.paymentLink === DONATION_PAYMENT_LINK_ID ||
    Boolean(payment.description?.startsWith(DONATION_DESCRIPTION))
  );
}
