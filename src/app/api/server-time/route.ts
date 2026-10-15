import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Hora oficial do servidor (ms desde 1970). É a referência para liberar aulas por horário:
 * o relógio do aluno não é usado, então mudar o horário do computador não adianta nada.
 */
export async function GET() {
  return NextResponse.json(
    { now: Date.now() },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
