'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialogA11y } from '@/hooks/useDialogA11y';

interface ImageLightboxProps {
  open: boolean;
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

const EASE = 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'; // quadrática: acelera e desacelera
const DURATION_MS = 260;
const MIN_SCALE = 1;
const MAX_SCALE = 6;
const WHEEL_SENSITIVITY = 0.0016;

interface View {
  s: number; // zoom
  x: number; // deslocamento horizontal (px)
  y: number; // deslocamento vertical (px)
}
const RESET: View = { s: 1, x: 0, y: 0 };

/** Mantém a imagem cobrindo a janela: não deixa "fugir" para fora das bordas. */
function clampView(s: number, x: number, y: number, w: number, h: number): View {
  const maxX = ((s - 1) * w) / 2;
  const maxY = ((s - 1) * h) / 2;
  return { s, x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
}

/**
 * Imagem ampliada (tamanho médio) com animação de abertura e fechamento e zoom pela roda do mouse.
 * - Rolar a roda dá zoom em direção ao ponteiro (o ponto sob o mouse fica parado).
 * - Com zoom, arrastar move a imagem; teclas + / - / 0 também funcionam.
 * Renderizada no <body> (portal) para não sofrer o zoom do conteúdo da aula.
 */
export function ImageLightbox({ open, src, alt, caption, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState<View>(RESET);
  const [dragging, setDragging] = useState(false);
  const viewRef = useRef<View>(RESET);
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null);

  // Monta o diálogo ao abrir (durante o render) e o mantém montado até a animação de saída acabar.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      // Dois quadros: garante que o estado inicial (invisível) seja pintado antes de animar.
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    const timer = setTimeout(() => {
      setEntered(false);
      setMounted(false);
      viewRef.current = RESET;
      setView(RESET);
    }, DURATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useDialogA11y(dialogRef, open, onClose);

  const apply = useCallback((next: View) => {
    viewRef.current = next;
    setView(next);
  }, []);

  /** Zoom por `factor`, mantendo parado o ponto da tela (clientX, clientY). */
  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect(); // moldura sem transformação
      const { s, x, y } = viewRef.current;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * factor));
      if (next === s) return;
      if (next === MIN_SCALE) {
        apply(RESET);
        return;
      }
      const mx = clientX - (rect.left + rect.width / 2);
      const my = clientY - (rect.top + rect.height / 2);
      const ratio = next / s;
      apply(clampView(next, mx - (mx - x) * ratio, my - (my - y) * ratio, rect.width, rect.height));
    },
    [apply]
  );

  // Roda do mouse (precisa de listener não passivo para impedir a rolagem da página) e teclado.
  useEffect(() => {
    const frame = frameRef.current;
    if (!mounted || !frame) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * WHEEL_SENSITIVITY), e.clientX, e.clientY);
    };
    const onKey = (e: KeyboardEvent) => {
      const rect = frame.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (e.key === '+' || e.key === '=') zoomAt(1.25, cx, cy);
      else if (e.key === '-' || e.key === '_') zoomAt(0.8, cx, cy);
      else if (e.key === '0') apply(RESET);
    };

    frame.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('keydown', onKey);
    return () => {
      frame.removeEventListener('wheel', onWheel);
      document.removeEventListener('keydown', onKey);
    };
  }, [mounted, zoomAt, apply]);

  // Arrastar para mover (só com zoom).
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (viewRef.current.s <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || drag.id !== e.pointerId || !frame) return;
    const { s, x, y } = viewRef.current;
    const rect = frame.getBoundingClientRect();
    apply(clampView(s, x + (e.clientX - drag.x), y + (e.clientY - drag.y), rect.width, rect.height));
    drag.x = e.clientX;
    drag.y = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  if (!mounted || typeof document === 'undefined') return null;

  const visible = open && entered;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reduceMotion ? 0 : DURATION_MS;
  const zoomed = view.s > 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      style={{ opacity: visible ? 1 : 0, transition: `opacity ${duration}ms ${EASE}` }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={caption || alt}
        className="relative flex flex-col items-center gap-3"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
          transition: `opacity ${duration}ms ${EASE}, transform ${duration}ms ${EASE}`,
        }}
      >
        {/* Moldura: recorta a imagem ampliada para ela não invadir o resto da tela */}
        <div
          ref={frameRef}
          className="overflow-hidden rounded-xl shadow-2xl touch-none select-none"
          style={{ cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="block max-h-[70dvh] max-w-[92vw] object-contain sm:max-w-[min(70vw,1100px)]"
            style={{
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
              transformOrigin: 'center center',
              transition: dragging ? 'none' : `transform 110ms ${EASE}`,
              willChange: 'transform',
            }}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar imagem"
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 cursor-pointer"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className="max-w-[92vw] text-center font-sans sm:max-w-[min(70vw,1100px)]">
          {caption && <p className="text-sm text-white/80">{caption}</p>}
          <p className="mt-1 text-xs text-white/55">
            Role para dar zoom{zoomed ? ` (${Math.round(view.s * 100)}%) · arraste para mover · 0 para voltar` : ''}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
