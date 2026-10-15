/** Produção de verdade (Vercel production, ou `next start` fora da Vercel). Preview e desenvolvimento ficam de fora. */
export function isProductionRuntime(): boolean {
  if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === 'production';
  return process.env.NODE_ENV === 'production';
}
