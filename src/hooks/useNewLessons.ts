'use client';

import { useCallback, useEffect, useState } from 'react';
import { NEW_LESSON_IDS } from '@/config/newLessons';

const storageKey = (userId: string) => `flmmkr_seen_lessons_${userId}`;

function readSeen(userId: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Ponto verde das aulas novas. A aula deixa de ser "nova" para o aluno assim que ele a abre
 * (guardado neste navegador, por aluno). Sem aluno identificado, nenhum ponto aparece.
 */
export function useNewLessons(userId: string | null, activeLessonId: string) {
  const [seen, setSeen] = useState<string[] | null>(null);

  useEffect(() => {
    setSeen(userId ? readSeen(userId) : null); // eslint-disable-line react-hooks/set-state-in-effect -- localStorage só existe no navegador
  }, [userId]);

  useEffect(() => {
    if (!userId || seen === null || !NEW_LESSON_IDS.has(activeLessonId) || seen.includes(activeLessonId)) return;
    const next = [...seen, activeLessonId];
    try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch { /* sem storage: o ponto só volta ao recarregar */ }
    setSeen(next); // eslint-disable-line react-hooks/set-state-in-effect -- reação a abrir a aula
  }, [userId, seen, activeLessonId]);

  const isNew = useCallback((lessonId: string) => seen !== null && NEW_LESSON_IDS.has(lessonId) && !seen.includes(lessonId), [seen]);
  return { isNew };
}
