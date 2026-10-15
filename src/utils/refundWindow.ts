/**
 * Prazo de reembolso: até as 23:59:59 do 7º dia depois da data de confirmação do pagamento, no fuso de São Paulo.
 * Tudo é calculado no servidor; o navegador só exibe o resultado.
 * O Brasil não usa horário de verão desde 2019, então São Paulo é UTC-3 fixo.
 */
export const REFUND_WINDOW_DAYS = 7;
const SAO_PAULO_OFFSET = '-03:00';
const DAY_MS = 24 * 60 * 60 * 1000;

/** `confirmedDate` no formato YYYY-MM-DD (data civil em São Paulo, como o Asaas devolve). */
export function refundDeadline(confirmedDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(confirmedDate || '');
  if (!match) return null;
  const endOfConfirmedDay = new Date(`${match[1]}-${match[2]}-${match[3]}T23:59:59${SAO_PAULO_OFFSET}`);
  if (Number.isNaN(endOfConfirmedDay.getTime())) return null;
  return new Date(endOfConfirmedDay.getTime() + REFUND_WINDOW_DAYS * DAY_MS);
}

export function isRefundWindowOpen(confirmedDate: string, now: Date = new Date()): boolean {
  const deadline = refundDeadline(confirmedDate);
  return !!deadline && now.getTime() <= deadline.getTime();
}
