'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Imagem com efeito de paralaxe ao passar o mouse. A foto mantém o tamanho (sem zoom) e o quadro funciona
 * como uma janela: o mouse da esquerda para a direita (e de cima para baixo) leva o enquadramento de uma
 * ponta da imagem até a outra. Ao sair, ela volta ao enquadramento inicial. Só reage a mouse (não a toque)
 * e respeita "reduzir movimento".
 */
export function ParallaxImage({
  src, alt, width, height, frameClassName = '', imgClassName = '', initial = [50, 50],
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  frameClassName?: string;
  /** Precisa ter object-fit: cover; o excesso da foto em relação ao quadro é o que o mouse percorre. */
  imgClassName?: string;
  /** Enquadramento inicial, em % (x, y), como no object-position. */
  initial?: [number, number];
}) {
  const frameRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Posição atual do enquadramento (em %), animada com suavidade e aplicada ao object-position.
    const pos = { x: initial[0], y: initial[1] };
    const apply = () => { img.style.objectPosition = `${pos.x}% ${pos.y}%`; };
    const moveX = gsap.quickTo(pos, 'x', { duration: 0.7, ease: 'power3.out', onUpdate: apply });
    const moveY = gsap.quickTo(pos, 'y', { duration: 0.7, ease: 'power3.out', onUpdate: apply });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = frame.getBoundingClientRect();
      const nx = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1); // 0 = esquerda, 1 = direita
      const ny = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      moveX(nx * 100);
      moveY(ny * 100);
    };
    const onLeave = () => { moveX(initial[0]); moveY(initial[1]); };

    frame.addEventListener('pointermove', onMove);
    frame.addEventListener('pointerleave', onLeave);
    return () => {
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(pos);
    };
  }, [initial]);

  return (
    <figure ref={frameRef} className={`overflow-hidden ${frameClassName}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={imgClassName}
        style={{ objectPosition: `${initial[0]}% ${initial[1]}%` }}
      />
    </figure>
  );
}
