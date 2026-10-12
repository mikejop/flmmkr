'use client';

import { useEffect, useRef } from 'react';

const playerId = 'panda-c9f6f93e-36fb-46c0-a414-d2387c356809';
const playerScriptUrl = 'https://player.pandavideo.com.br/api.v2.js';

export default function AnaliseTecnicaVideo({ onLessonEnded }: { onLessonEnded?: () => void }) {
  const onLessonEndedRef = useRef(onLessonEnded);

  useEffect(() => {
    onLessonEndedRef.current = onLessonEnded;
  }, [onLessonEnded]);

  useEffect(() => {
    const pandaWindow = window as typeof window & {
      PandaPlayer?: new (id: string, options: { onReady: () => void }) => {
        pipScrollFollow: (options: { panda_id_player: string }) => void;
        onEvent: (callback: (event: { message: string }) => void) => void;
      };
      pandascripttag?: Array<() => void>;
    };

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
    }

    if (!pandaWindow.PandaPlayer && !document.querySelector(`script[src="${playerScriptUrl}"]`)) {
      const script = document.createElement('script');
      script.src = playerScriptUrl;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
      <div className="relative aspect-[1.54] w-full">
        <iframe
          id={playerId}
          src="https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=c9f6f93e-36fb-46c0-a414-d2387c356809&initQuality=2160p&controls=play-large,play,progress,current-time,mute,volume,captions,settings,pip,fullscreen"
          title="Análise Técnica — Profundidade de bits"
          width="720"
          height="405"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
