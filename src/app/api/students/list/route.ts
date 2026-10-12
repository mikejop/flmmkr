import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { z } from 'zod';
import { consumeRateLimit } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const allowed = await consumeRateLimit(req, 'students-list', 20, 60);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
    if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const ownProfile = await supabaseAdmin.from('profiles').select('has_access, payment_status, role').eq('id', user.id).maybeSingle();
    if (ownProfile.error || !(ownProfile.data?.role === 'admin' || (ownProfile.data?.has_access === true && ownProfile.data?.payment_status === 'CONFIRMED'))) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }
    const cursor = new URL(req.url).searchParams.get('cursor');
    if (cursor && !z.string().uuid().safeParse(cursor).success) {
      return NextResponse.json({ error: 'Cursor inválido.' }, { status: 400 });
    }
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, first_name, avatar_url, nickname')
      .gt('id', cursor || '00000000-0000-0000-0000-000000000000')
      .order('id', { ascending: true })
      .limit(101);

    if (error) {
      console.error('Erro ao buscar lista de alunos:', error);
      return NextResponse.json({ students: [] });
    }

    const page = (profiles || []).slice(0, 100);
    const students = page
      .map((p) => ({
        id: p.id,
        name: p.full_name || p.first_name || 'Aluno',
        tag: p.nickname || (p.full_name || p.first_name || '').replace(/\s+/g, ''),
        avatar: p.avatar_url || undefined,
      }))
      .filter((student) => student.tag);
    return NextResponse.json({ students, nextCursor: (profiles || []).length > 100 ? page.at(-1)?.id || null : null }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (err: any) {
    console.error('Erro GET /api/students/list:', err);
    return NextResponse.json({ students: [] });
  }
}
