import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { ensureNickname } from '@/lib/nickname';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, first_name, last_name, avatar_url, role, nickname')
      .order('full_name', { ascending: true })
      .limit(200);

    if (error) {
      console.error('Erro ao buscar lista de alunos:', error);
      return NextResponse.json({ students: [] });
    }

    // Garante nickname para perfis que ainda não possuem
    const students = await Promise.all(
      (profiles || []).map(async (p) => {
        const nickname = p.nickname || (await ensureNickname(p.id)) || '';
        return {
          id: p.id,
          name: p.full_name || p.first_name || 'Aluno',
          tag: nickname,
          avatar: p.avatar_url,
          role: p.role || 'student',
        };
      })
    );

    return NextResponse.json({ students: students.filter((s) => s.tag) });
  } catch (err: any) {
    console.error('Erro GET /api/students/list:', err);
    return NextResponse.json({ students: [] });
  }
}
