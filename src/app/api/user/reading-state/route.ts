import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';
const COURSE_ID = 'color-master-produto';

export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const userId = user.id;

    const { data, error } = await supabaseAdmin
      .from('user_reading_state')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', COURSE_ID)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar reading-state:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ state: data });
  } catch (err: any) {
    console.error('Erro interno reading-state GET:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lastModuleId, lastLessonId, lastSubtabId, lastTab, scrollTop } = body;
    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const userId = user.id;

    if (!userId || !lastLessonId) {
      return NextResponse.json(
        { error: 'lastLessonId é obrigatório.' },
        { status: 400 }
      );
    }

    const payload = {
      user_id: userId,
      course_id: COURSE_ID,
      last_module_id: lastModuleId || 'mod1',
      last_lesson_id: lastLessonId,
      last_subtab_id: lastSubtabId || null,
      last_tab: lastTab || 'teoria',
      scroll_top: typeof scrollTop === 'number' ? Math.round(scrollTop) : 0,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('user_reading_state')
      .upsert(payload, { onConflict: 'user_id,course_id' })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar reading-state:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, state: data });
  } catch (err: any) {
    console.error('Erro interno reading-state POST:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
