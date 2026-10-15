'use client';

import { useCallback, useEffect, useState } from 'react';
import { getLessonReleaseAt, getNextReleaseAfter } from '@/config/lessonRelease';
import { isClockSynced, startClockSync, subscribeClock, trustedNow } from '@/lib/trustedClock';

/**
 * Diz se uma aula ainda está bloqueada por data. Usa a hora do servidor (ver lib/trustedClock), então o
 * relógio do aluno não interfere. Sem a hora do servidor ainda, as aulas com data ficam bloqueadas.
 * O componente que usa o hook se atualiza sozinho quando a hora de liberar chega.
 */
export function useLessonRelease() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    startClockSync();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const bump = () => setVersion((v) => v + 1);

    // Agenda a próxima liberação (o setTimeout não depende do relógio do aparelho).
    const schedule = () => {
      if (timer) clearTimeout(timer);
      const now = trustedNow();
      if (now === null) return;
      const next = getNextReleaseAfter(now);
      if (next === null) return;
      timer = setTimeout(() => { bump(); schedule(); }, Math.min(next - now + 250, 2 ** 31 - 1));
    };

    const unsubscribe = subscribeClock(() => { bump(); schedule(); });
    schedule();
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  /** true = bloqueada (ainda não chegou a hora, ou a hora ainda não foi confirmada pelo servidor). */
  const isLocked = useCallback((lessonId: string): boolean => {
    const releaseAt = getLessonReleaseAt(lessonId);
    if (releaseAt === null) return false;
    const now = trustedNow();
    return now === null || now < releaseAt;
  }, []);

  return { isLocked, synced: isClockSynced() };
}
