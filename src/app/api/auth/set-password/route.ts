import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Este fluxo foi desativado. Use o link seguro de primeiro acesso enviado por e-mail.' },
    { status: 410 }
  );
}
