import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const userId = user.id;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'O arquivo enviado deve ser uma imagem válida.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'A imagem deve ter no máximo 5MB.' }, { status: 400 });
    }

    // 1. Converter imagem para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isGif = buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'));
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    const isAvif = buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp' && buffer.toString('ascii', 8, 12).startsWith('avif');
    const validImage = (file.type === 'image/png' && isPng) || (file.type === 'image/jpeg' && isJpeg) ||
      (file.type === 'image/gif' && isGif) || (file.type === 'image/webp' && isWebp) || (file.type === 'image/avif' && isAvif);
    if (!validImage) return NextResponse.json({ error: 'O conteúdo enviado não corresponde ao formato da imagem.' }, { status: 400 });

    // 2. Definir caminho do arquivo no bucket 'avatars'
    const cleanExt = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' } as Record<string, string>)[file.type];
    const fileName = `${userId}/avatar.${cleanExt}`;

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
