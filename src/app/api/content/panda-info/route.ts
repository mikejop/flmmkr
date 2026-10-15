import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { LESSON_VIDEOS, findLessonVideo, pandaEmbedUrl, pandaThumbnailUrl } from '@/config/lessonVideos';
import { createPandaDrmToken } from '@/utils/pandaDrm';

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

// Cache em memória para evitar chamadas redundantes e garantir carregamento ultrarrápido
const cache = new Map<string, { data: PandaVideoInfo; expiresAt: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hora de cache

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function cleanVideoTitle(title: string): string {
  return title.replace(/\s*-\s*Parte\s*0[12]\s*$/i, '').trim();
}

async function fetchVideoOEmbed(videoId: string): Promise<PandaVideoInfo> {
  const seed = findLessonVideo(videoId);
  const fallback: Partial<PandaVideoInfo> = {
    title: seed?.title || `Vídeo ${videoId.substring(0, 8)}`,
    thumbnail_url: pandaThumbnailUrl(videoId),
    duration: seed?.duration || 0,
    part_label: seed?.partLabel,
    embed_url: pandaEmbedUrl(videoId),
  };

  const cached = cache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const oembedUrl = `https://api-v2.pandavideo.com.br/oembed?url=https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=${videoId}`;
    const res = await fetch(oembedUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`Panda API error status ${res.status}`);
    }

    const data = await res.json();
    const duration = Number(data.duration) || fallback.duration || 0;

    const result: PandaVideoInfo = {
      id: videoId,
      title: cleanVideoTitle(data.title || fallback.title || 'Vídeo da aula'),
      thumbnail_url: data.thumbnail_url || fallback.thumbnail_url || '',
      duration,
      duration_formatted: formatDuration(duration),
      embed_url: pandaEmbedUrl(videoId),
      part_label: fallback.part_label
    };

    cache.set(videoId, { data: result, expiresAt: Date.now() + CACHE_TTL });
    return result;
  } catch (err) {
    console.warn(`[PandaVideo API Fallback for ${videoId}]:`, err);
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
    const drmToken = createPandaDrmToken({ name: profile?.full_name || profile?.first_name, email: user.email });
    const withAccess = videos.map((video) => ({
      ...video,
      embed_url: drmToken ? `${video.embed_url}${video.embed_url.includes('?') ? '&' : '?'}watermark=${encodeURIComponent(drmToken)}` : video.embed_url,
      default_subtitle: findLessonVideo(video.id)?.defaultSubtitle,
    }));
    return NextResponse.json({ success: true, lessonId: requestedLesson, videos: withAccess }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err) {
    console.error('[panda-info] Falha ao montar a lista de vídeos:', err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: 'Não foi possível carregar os vídeos agora.' }, { status: 500 });
  }
}
