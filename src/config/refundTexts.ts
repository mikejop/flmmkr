/** Textos exibidos na tela de reembolso. Fácil de editar: prazos estimados por forma de devolução. */
export const REFUND_TIMING_TEXT = {
  CREDIT_CARD: 'em até 2 faturas',
  PIX: 'em até 1 dia útil',
  BOLETO: 'conforme o banco (você informará seus dados bancários em um link seguro)',
  OTHER: 'conforme a forma de pagamento',
} as const;

export const REFUND_METHOD_TEXT = {
  CREDIT_CARD: 'no mesmo cartão usado na compra',
  PIX: 'via Pix para a conta de origem',
  BOLETO: 'por transferência para a conta que você informar',
  OTHER: 'pela forma de pagamento original',
} as const;
