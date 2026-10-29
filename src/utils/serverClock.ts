import 'server-only';
import type { NextRequest } from 'next/server';

/** Cookie de teste que adianta/atrasa o relógio (em ms). Só é lido em `next dev`; em produção é ignorado. */
export const DEV_CLOCK_COOKIE = 'flmmkr_dev_clock_offset';

export const isDevClockEnabled = () => process.env.NODE_ENV === 'development';

/** Hora oficial do servidor (ms). Em `next dev`, o cookie de teste permite simular a campanha. */
export function serverNow(req?: NextRequest): number {
  const now = Date.now();
  if (!req || !isDevClockEnabled()) return now;
  const offset = Number(req.cookies.get(DEV_CLOCK_COOKIE)?.value);
  return Number.isFinite(offset) ? now + offset : now;
}
