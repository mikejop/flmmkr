import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = notifications || [];
    return NextResponse.json({
      notifications: list,
      unreadCount: list.filter((n) => !n.is_read).length,
    });
  } catch (err: any) {
    console.error('Erro GET /api/notifications:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, notificationId, markAll } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    if (markAll) {
      const { error } = await supabaseAdmin
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      const { error } = await supabaseAdmin
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  } catch (err: any) {
    console.error('Erro POST /api/notifications:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}

/** Remove uma notificação (?id=) ou todas (?all=1) do usuário. */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const all = searchParams.get('all') === '1';

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    if (all) {
      const { error } = await supabaseAdmin.from('user_notifications').delete().eq('user_id', userId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (id) {
      const { error } = await supabaseAdmin
        .from('user_notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  } catch (err: any) {
    console.error('Erro DELETE /api/notifications:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
