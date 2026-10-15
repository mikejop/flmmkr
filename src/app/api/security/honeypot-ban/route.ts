import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getClientIp } from '@/utils/clientIp';
import { readJsonLimited } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

const banSchema = z.object({
  mac: z.string().max(200).optional(),
  honeypotPath: z.string().min(1).max(500),
  userAgent: z.string().max(1000).optional(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const expected = process.env.HONEYPOT_SECRET || '';
    const received = req.headers.get('x-flmmkr-internal-secret') || '';
    const expectedBytes = Buffer.from(expected);
    const receivedBytes = Buffer.from(received);
    if (!expected || expectedBytes.length !== receivedBytes.length || !timingSafeEqual(expectedBytes, receivedBytes)) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await readJsonLimited(req, 4_096);
    const parsed = banSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    const { mac, honeypotPath, userAgent } = parsed.data;
    const finalIp = getClientIp(req) || 'UNKNOWN';

    console.warn('[HONEYPOT REGISTRATION] Evento de segurança recebido.');

    const { error } = await supabaseAdmin.from('blocked_attackers').insert({
      ip_address: finalIp,
      mac_address: mac || null,
      honeypot_triggered: honeypotPath || 'UNKNOWN_HONEYPOT',
      user_agent: userAgent || req.headers.get('user-agent') || null,
      request_headers: null,
      is_banned: true,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      notes: 'Bloqueio temporário (1 hora) acionado pelo middleware do Honeypot.'
    });
    if (error) throw error;

    return NextResponse.json({ banned: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar banimento' }, { status: 500 });
  }
}
