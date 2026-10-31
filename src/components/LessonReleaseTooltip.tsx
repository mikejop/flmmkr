'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Lock } from 'lucide-react';
import { formatReleaseDate, getLessonReleaseAt } from '@/config/lessonRelease';
import { trustedNow } from '@/lib/trustedClock';

/** "2d 03h 12m 05s" até a liberação, lendo a hora do servidor a cada segundo. null = horário ainda não confirmado. */
function useCountdown(releaseAt: number | null): string | null {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (releaseAt === null || !Number.isFinite(releaseAt)) return;
    const update = () => {
      const now = trustedNow();
      if (now === null) { setText(null); return; }
      const left = Math.max(0, releaseAt - now);
      const total = Math.floor(left / 1000);
      const d = Math.floor(total / 86400);
      const h = Math.floor((total % 86400) / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const pad = (n: number) => String(n).padStart(2, '0');
      setText(`${d > 0 ? `${d}d ` : ''}${pad(h)}h ${pad(m)}m ${pad(s)}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [releaseAt]);

  return text;
}

/** Tooltip fixo ao lado do item do menu: mostra quanto falta para a aula ser liberada. Fica acima de tudo. */
export function LessonReleaseTooltip({ lessonId, anchor }: { lessonId: string; anchor: DOMRect }) {
  const releaseAt = getLessonReleaseAt(lessonId);
  const countdown = useCountdown(releaseAt);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const gap = 10;
    let left = anchor.right + gap;
    if (left + w > window.innerWidth - 8) left = Math.max(8, anchor.left - w - gap);
    const top = Math.min(Math.max(anchor.top + anchor.height / 2 - h / 2, 8), window.innerHeight - h - 8);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.visibility = 'visible';
  }, [anchor, countdown]);

  if (releaseAt === null) return null;

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      style={{ visibility: 'hidden', width: 'min(280px, calc(100vw - 16px))' }}
      className="pointer-events-none fixed z-[1000] space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 font-sans text-neutral-900 shadow-2xl"
    >
      <p className="flex items-center gap-2 text-sm font-bold">
        <Lock size={14} aria-hidden="true" className="text-[#0071e3]" />
        Aula bloqueada
      </p>
      <p className="flex items-center gap-2 text-sm text-neutral-700">
        <Clock size={14} aria-hidden="true" className="shrink-0 text-neutral-500" />
        {!Number.isFinite(releaseAt) ? 'Ainda sem data de liberação' : countdown ? <>Libera em <strong className="tabular-nums text-neutral-900">{countdown}</strong></> : 'Verificando o horário…'}
      </p>
      {Number.isFinite(releaseAt) && <p className="border-t border-neutral-200 pt-2 text-xs leading-snug text-neutral-600">{formatReleaseDate(releaseAt)}</p>}
    </div>,
    document.body,
  );
}

/** Tela mostrada no lugar da aula enquanto ela está bloqueada. */
export function LessonLockedPanel({ lessonId, title }: { lessonId: string; title: string }) {
  const releaseAt = getLessonReleaseAt(lessonId);
  const countdown = useCountdown(releaseAt);

  return (
    <div role="status" aria-live="polite" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center font-sans">
      <span aria-hidden="true" className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
        <Lock size={28} />
      </span>
      <h2 className="text-2xl font-black tracking-tight text-neutral-900">{title}</h2>
      <p className="text-base text-neutral-700">Esta aula ainda não foi liberada.</p>
      <p className="rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-lg text-neutral-800 shadow-sm">
        {releaseAt !== null && !Number.isFinite(releaseAt) ? 'Ainda sem data de liberação' : countdown ? <>Libera em <strong className="tabular-nums text-neutral-900">{countdown}</strong></> : 'Verificando o horário…'}
      </p>
      {releaseAt !== null && Number.isFinite(releaseAt) && <p className="text-sm text-neutral-600">{formatReleaseDate(releaseAt)}</p>}
    </div>
  );
}
