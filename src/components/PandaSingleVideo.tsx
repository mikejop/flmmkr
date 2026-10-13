'use client';

import { useEffect, useRef } from 'react';

const PLAYER_SCRIPT_URL = 'https://player.pandavideo.com.br/api.v2.js';
const EMBED_BASE = 'https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/';

type PandaPlayerInstance = {
  pipScrollFollow: (options: { panda_id_player: string }) => void;
  onEvent: (callback: (event: { message: string }) => void) => void;
};

type PandaWindow = typeof window & {
  PandaPlayer?: new (id: string, options: { onReady: () => void }) => PandaPlayerInstance;
  pandascripttag?: Array<() => void>;
};

interface PandaSingleVideoProps {
  /** ID do vídeo no Panda (o trecho depois de `?v=` no embed). */
  videoId: string;
  title: string;
  onLessonEnded?: () => void;
}

/** Player Panda de um único vídeo (proporção 1,547:1, igual ao embed oficial). */
export default function PandaSingleVideo({ videoId, title, onLessonEnded }: PandaSingleVideoProps) {
  const playerId = `panda-${videoId}`;
  const onLessonEndedRef = useRef(onLessonEnded);

  useEffect(() => {
    onLessonEndedRef.current = onLessonEnded;
  }, [onLessonEnded]);

  useEffect(() => {
    const pandaWindow = window as PandaWindow;

    const initializePlayer = () => {
      if (!pandaWindow.PandaPlayer) return;
      const player = new pandaWindow.PandaPlayer(playerId, {
        onReady: () => {
          player.pipScrollFollow({ panda_id_player: playerId });
          player.onEvent(({ message }) => {
            if (message === 'panda_ended') onLessonEndedRef.current?.();
          });
        },
      });
    };

    if (pandaWindow.PandaPlayer) {
      initializePlayer();
    } else {
      pandaWindow.pandascripttag = pandaWindow.pandascripttag || [];
      pandaWindow.pandascripttag.push(initializePlayer);
      if (!document.querySelector(`script[src="${PLAYER_SCRIPT_URL}"]`)) {
        const script = document.createElement('script');
        script.src = PLAYER_SCRIPT_URL;
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }, [playerId]);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
      <div className="relative aspect-[1.547] w-full">
        <iframe
          id={playerId}
          src={`${EMBED_BASE}?v=${encodeURIComponent(videoId)}&defaultSubtitle=pt-BR`}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          {...({ fetchPriority: 'high' } as Record<string, string>)}
        />
      </div>
    </div>
  );
}
