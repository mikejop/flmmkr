import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { supabaseAdmin } from '@/utils/supabase/admin';

interface PandaVideoInfo {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  duration_formatted: string;
  embed_url: string;
  part_label?: string;
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

const DEFAULT_VIDEOS: Record<string, Partial<PandaVideoInfo>> = {
  'dcc5a135-2d08-4589-b0f1-caff163a7cf5': {
    title: 'Introdução ao DaVinci Resolve - Parte 01',
    thumbnail_url: 'https://cdn.pandavideo.com/vz-5bb7b1c1-d28/dcc5a135-2d08-4589-b0f1-caff163a7cf5/thumbnail.jpg',
    duration: 330,
    part_label: 'Parte 01',
    embed_url: 'https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=dcc5a135-2d08-4589-b0f1-caff163a7cf5'
  },
  'd792f957-2169-4efe-9b64-bc27a16bdb39': {
    title: 'Introdução ao DaVinci Resolve - Parte 02',
    thumbnail_url: 'https://cdn.pandavideo.com/vz-5bb7b1c1-d28/d792f957-2169-4efe-9b64-bc27a16bdb39/thumbnail.jpg',
    duration: 789,
    part_label: 'Parte 02',
    embed_url: 'https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=d792f957-2169-4efe-9b64-bc27a16bdb39'
  }
};

async function fetchVideoOEmbed(videoId: string): Promise<PandaVideoInfo> {
  const fallback = DEFAULT_VIDEOS[videoId] || {
    title: `Vídeo ${videoId.substring(0, 8)}`,
    thumbnail_url: '',
    duration: 0,
    embed_url: `https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=${videoId}`
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
      title: cleanVideoTitle(data.title || fallback.title || 'Introdução ao DaVinci Resolve'),
      thumbnail_url: data.thumbnail_url || fallback.thumbnail_url || '',
      duration,
      duration_formatted: formatDuration(duration),
      embed_url: `https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=${videoId}`,
      part_label: fallback.part_label
    };

    cache.set(videoId, { data: result, expiresAt: Date.now() + CACHE_TTL });
    return result;
  } catch (err) {
    console.warn(`[PandaVideo API Fallback for ${videoId}]:`, err);
    const duration = fallback.duration || 0;
    return {
      id: videoId,
      title: cleanVideoTitle(fallback.title || 'Introdução ao DaVinci Resolve'),
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
    .select('has_access, payment_status, role')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError || !(profile?.role === 'admin' || (profile?.has_access === true && profile?.payment_status === 'CONFIRMED'))) {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const requestedLesson = new URL(req.url).searchParams.get('lessonId') || 'introducao-davinci-resolve';
  const lessonVideos: Record<string, string[]> = {
    'introducao-davinci-resolve': ['dcc5a135-2d08-4589-b0f1-caff163a7cf5', 'd792f957-2169-4efe-9b64-bc27a16bdb39'],
  };
  const ids = lessonVideos[requestedLesson];
  if (!ids) {
    return NextResponse.json({ error: 'Aula não encontrada.' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }

  try {
    const videos = await Promise.all(ids.map((id) => fetchVideoOEmbed(id)));
    return NextResponse.json({ success: true, lessonId: requestedLesson, videos }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Falha ao buscar dados do PandaVideo' },
      { status: 500 }
    );
  }
}
