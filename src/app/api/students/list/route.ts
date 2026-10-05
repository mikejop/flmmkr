import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, first_name, last_name, avatar_url, role')
      .order('full_name', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Erro ao buscar lista de alunos:', error);
      return NextResponse.json({ students: [] });
    }

    const students = (profiles || []).map(p => ({
      id: p.id,
      name: p.full_name || p.first_name || 'Aluno',
      tag: (p.first_name || p.full_name || 'Aluno').replace(/\s+/g, ''),
      avatar: p.avatar_url,
      role: p.role || 'student'
    }));

    return NextResponse.json({ students });
  } catch (err: any) {
    console.error('Erro GET /api/students/list:', err);
    return NextResponse.json({ students: [] });
  }
}
