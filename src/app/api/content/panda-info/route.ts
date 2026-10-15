import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { LESSON_VIDEOS, findLessonVideo, pandaEmbedUrl, pandaThumbnailUrl } from '@/config/lessonVideos';
import { createPandaDrmToken, PANDA_DRM_TOKEN_TTL_SECONDS } from '@/utils/pandaDrm';
import { unstable_cache } from 'next/cache';
import { cacheGet, cacheSet } from '@/utils/redis';
import { drmKey } from '@/utils/accessCache';

interface PandaVideoInfo {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  duration_formatted: string;
  embed_url: string;
  part_label?: string;
  default_subtitle?: string;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function cleanVideoTitle(title: string): string {
  return title.replace(/\s*-\s*Parte\s*0[12]\s*$/i, '').trim();
}

function fallbackInfo(videoId: string): PandaVideoInfo {
  const seed = findLessonVideo(videoId);
  const fallback: Partial<PandaVideoInfo> = {
    title: seed?.title || `Vídeo ${videoId.substring(0, 8)}`,
    thumbnail_url: pandaThumbnailUrl(videoId),
    duration: seed?.duration || 0,
    part_label: seed?.partLabel,
    embed_url: pandaEmbedUrl(videoId),
  };

  const duration = fallback.duration || 0;
  return {
    id: videoId,
    title: cleanVideoTitle(fallback.title || 'Vídeo da aula'),
    thumbnail_url: fallback.thumbnail_url || '',
    duration,
    duration_formatted: formatDuration(duration),
    embed_url: fallback.embed_url || `https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=${videoId}`,
    part_label: fallback.part_label
  };
}

/** Busca no Panda. Em falha LANÇA o erro, para o cache compartilhado nunca guardar o resultado degradado. */
async function fetchVideoOEmbedRemote(videoId: string): Promise<PandaVideoInfo> {
  const fallback = fallbackInfo(videoId);
  const oembedUrl = `https://api-v2.pandavideo.com.br/oembed?url=https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=${videoId}`;
  const res = await fetch(oembedUrl, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`Panda API error status ${res.status}`);

  const data = await res.json();
  const duration = Number(data.duration) || fallback.duration || 0;
  return {
    id: videoId,
    title: cleanVideoTitle(data.title || fallback.title || 'Vídeo da aula'),
    thumbnail_url: data.thumbnail_url || fallback.thumbnail_url || '',
    duration,
    duration_formatted: formatDuration(duration),
    embed_url: pandaEmbedUrl(videoId),
    part_label: fallback.part_label
  };
}

// Metadados do vídeo são iguais para todos os alunos: cache compartilhado de 1 hora (tag `panda-meta`, invalidável por /api/revalidate).
// O embed_url com a marca d'água DRM NUNCA entra aqui: é montado por usuário na rota.
const fetchVideoOEmbedShared = unstable_cache(fetchVideoOEmbedRemote, ['panda-oembed-v1'], { revalidate: 3600, tags: ['panda-meta'] });

async function fetchVideoOEmbed(videoId: string): Promise<PandaVideoInfo> {
  try {
    return await fetchVideoOEmbedShared(videoId);
  } catch (err) {
    console.warn(`[PandaVideo API Fallback for ${videoId}]:`, err instanceof Error ? err.message : err);
    return fallbackInfo(videoId);
  }
}

export async function GET(req: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('has_access, payment_status, role, full_name, first_name')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError || !(profile?.role === 'admin' || (profile?.has_access === true && profile?.payment_status === 'CONFIRMED'))) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const requestedParam = new URL(req.url).searchParams.get('lessonId') || 'mod1-1';
  // Compatibilidade com o identificador antigo da primeira aula.
  const requestedLesson = requestedParam === 'introducao-davinci-resolve' ? 'mod1-1' : requestedParam;
  const ids = Object.hasOwn(LESSON_VIDEOS, requestedLesson) ? LESSON_VIDEOS[requestedLesson].map((v) => v.id) : undefined;
  if (!ids) {
    return NextResponse.json({ error: 'Aula não encontrada.' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }

  try {
    const videos = await Promise.all(ids.map((id) => fetchVideoOEmbed(id)));
    // Marca d'água DRM com o nome e o e-mail do aluno (válida por 2 h). O ID do vídeo só sai daqui para quem tem acesso.
    const withAccess = await Promise.all(videos.map(async (video) => {
      // Token por aluno e por vídeo no Redis; o cache dura 10 min menos que o token, então nunca entrega um token quase vencido.
      const key = drmKey(user.id, video.id);
      let drmToken = await cacheGet<string>(key);
      if (!drmToken) {
        drmToken = createPandaDrmToken({ name: profile?.full_name || profile?.first_name, email: user.email });
        if (drmToken) await cacheSet(key, drmToken, PANDA_DRM_TOKEN_TTL_SECONDS - 600);
      }
      return {
      ...video,
      embed_url: drmToken ? `${video.embed_url}${video.embed_url.includes('?') ? '&' : '?'}watermark=${encodeURIComponent(drmToken)}` : video.embed_url,
      default_subtitle: findLessonVideo(video.id)?.defaultSubtitle,
      };
    }));
    return NextResponse.json({ success: true, lessonId: requestedLesson, videos: withAccess }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err) {
    console.error('[panda-info] Falha ao montar a lista de vídeos:', err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: 'Não foi possível carregar os vídeos agora.' }, { status: 500 });
  }
}
