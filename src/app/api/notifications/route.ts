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

    // 1. Buscar notificações do usuário
    const { data: notifications, error } = await supabaseAdmin
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Se o usuário ainda não tiver nenhuma notificação, inicializar com avisos do sistema / novos conteúdos
    if (!notifications || notifications.length === 0) {
      const initialNotifs = [
        {
          user_id: userId,
          type: 'new_content',
          title: 'Novo conteúdo adicionado!',
          message: 'A aula "Introdução ao DaVinci Resolve & ACES Workflow" já está disponível para estudo.',
          lesson_id: 'mod1-1',
          module_id: 'mod1',
          sender_name: 'FLMMKR Academy',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          user_id: userId,
          type: 'system',
          title: 'Bem-vindo ao Color Master',
          message: 'Sua jornada de color grading começa aqui. Use o @ nos comentários para interagir com seus colegas.',
          lesson_id: 'mod1-1',
          module_id: 'mod1',
          sender_name: 'Professor',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        }
      ];

      const { data: seeded } = await supabaseAdmin
        .from('user_notifications')
        .insert(initialNotifs)
        .select();

      return NextResponse.json({
        notifications: seeded || initialNotifs,
        unreadCount: (seeded || initialNotifs).filter(n => !n.is_read).length
      });
    }

    const unreadCount = (notifications || []).filter(n => !n.is_read).length;

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount
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
