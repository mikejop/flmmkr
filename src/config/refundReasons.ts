/** Motivos de reembolso (só de marcar, sem texto livre). O servidor aceita APENAS estes códigos. */
export const REFUND_REASONS = [
  { code: 'not_liked_content', label: 'Não gostei do conteúdo' },
  { code: 'level_below_mine', label: 'O nível do conteúdo é menor do que o meu conhecimento sobre o assunto' },
  { code: 'level_too_advanced', label: 'O conteúdo está avançado demais para mim' },
  { code: 'not_what_expected', label: 'O curso não é o que eu esperava' },
  { code: 'financial', label: 'Problemas financeiros' },
  { code: 'cannot_access', label: 'Não consigo acessar a plataforma' },
  { code: 'video_problems', label: 'Problemas com os vídeos (travam, sem som ou não carregam)' },
  { code: 'no_time', label: 'Não tenho tempo para estudar agora' },
  { code: 'bought_by_mistake', label: 'Comprei por engano' },
  { code: 'other', label: 'Outro motivo' },
] as const;

export type RefundReasonCode = (typeof REFUND_REASONS)[number]['code'];
export const REFUND_REASON_CODES = REFUND_REASONS.map((r) => r.code) as [RefundReasonCode, ...RefundReasonCode[]];
