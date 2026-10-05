import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_reading_state')
      .select('*')
      .eq('user_id', userId)
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
    const { userId, lastModuleId, lastLessonId, lastSubtabId, lastTab, scrollTop } = body;

    if (!userId || !lastLessonId) {
      return NextResponse.json(
        { error: 'userId e lastLessonId são obrigatórios.' },
        { status: 400 }
      );
    }

    const payload = {
      user_id: userId,
      last_module_id: lastModuleId || 'mod1',
      last_lesson_id: lastLessonId,
      last_subtab_id: lastSubtabId || null,
      last_tab: lastTab || 'teoria',
      scroll_top: typeof scrollTop === 'number' ? Math.round(scrollTop) : 0,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('user_reading_state')
      .upsert(payload, { onConflict: 'user_id' })
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
