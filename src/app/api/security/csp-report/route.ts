import { NextRequest, NextResponse } from 'next/server';
import { readJsonLimited } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

/** Recebe relatórios de violação de CSP (só registra no log do servidor; sem gravar nada no banco). */
export async function POST(req: NextRequest) {
  const body = (await readJsonLimited(req, 8_192)) as Record<string, unknown> | null;
  const report = (body?.['csp-report'] ?? body) as Record<string, unknown> | null;
  if (report && typeof report === 'object') {
    const pick = (k: string) => String(report[k] ?? '').slice(0, 200);
    console.warn('[CSP]', pick('violated-directive') || pick('effectiveDirective'), pick('blocked-uri') || pick('blockedURL'), pick('document-uri') || pick('documentURL'));
  }
  return new NextResponse(null, { status: 204 });
}
