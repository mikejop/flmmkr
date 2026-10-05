import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'O arquivo enviado deve ser uma imagem válida.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'A imagem deve ter no máximo 5MB.' }, { status: 400 });
    }

    // 1. Converter imagem para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Definir caminho do arquivo no bucket 'avatars'
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext) ? ext : 'webp';
    const fileName = `${userId}-${Date.now()}.${cleanExt}`;

    // 3. Upload para o bucket 'avatars' no Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('Erro no upload para Supabase Storage:', uploadError);
      return NextResponse.json({ error: `Erro no upload: ${uploadError.message}` }, { status: 500 });
    }

    // 4. Obter a URL pública do avatar
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // 5. Salvar a nova foto na tabela public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Erro ao atualizar avatar no perfil:', profileError);
    }

    // 6. Atualizar também nos metadados de autenticação do usuário
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          avatar_url: publicUrl,
        },
      });
    } catch (authErr) {
      console.warn('Erro ao atualizar metadata do usuário:', authErr);
    }

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      message: 'Foto atualizada com sucesso no Supabase!',
    });
  } catch (err: any) {
    console.error('Erro geral no upload do avatar:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao processar upload da foto.' },
      { status: 500 }
    );
  }
}
