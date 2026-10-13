'use client';

import React from 'react';
import { smoothScrollToId } from '@/lib/smoothScroll';
import type { TocGroup } from './EditorialLayout';

export const LESSON_VIDEO_ANCHOR = 'lesson-video';

/**
 * Sumário em linha do tempo, fixo à direita do conteúdo da aula. Cada ponto é um bloco (o vídeo
 * e as seções do artigo). O mouse ou o foco do teclado abrem o nome do bloco e seus subtemas;
 * clicar rola até ele com animação. O ponto azul marca onde a pessoa está.
 */
export default function LessonTimeline({
  groups,
  containerRef,
}: {
  groups: TocGroup[];
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const [activeId, setActiveId] = React.useState(groups[0]?.id ?? '');

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const limit = container.getBoundingClientRect().top + 140;
      let current = groups[0]?.id ?? '';
      for (const group of groups) {
        const el = document.getElementById(group.id);
        if (el && el.getBoundingClientRect().top <= limit) current = group.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    /** Links internos (#id) dentro do conteúdo (ex.: o # dos subtítulos) também rolam com animação. */
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const id = decodeURIComponent(link.getAttribute('href')!.slice(1));
      if (id && smoothScrollToId(container, id)) event.preventDefault();
    };
    update();
    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('click', onClick);
    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('click', onClick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [groups, containerRef]);

  const go = (event: React.MouseEvent, id: string) => {
    const container = containerRef.current;
    if (container && smoothScrollToId(container, id)) event.preventDefault();
  };

  return (
    <nav data-hero-hide aria-label="Nesta página" className="transition-opacity duration-300 absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 md:block lg:right-4">
      <ol className="relative flex flex-col before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:rounded-full before:bg-neutral-300">
        {groups.map((group) => {
          const active = group.id === activeId;
          return (
            <li key={group.id} className="group/item relative">
              <a
                href={`#${group.id}`}
                onClick={(event) => go(event, group.id)}
                aria-label={group.title}
                aria-current={active ? 'location' : undefined}
                className="relative flex h-6 w-6 items-center justify-center focus:outline-none"
              >
                <span
                  className={`block rounded-full transition-all duration-150 group-focus-within/item:ring-2 group-focus-within/item:ring-[#0071e3]/40 ${
                    active
                      ? 'h-4 w-4 bg-[#0071e3] ring-4 ring-[#0071e3]/20'
                      : 'h-3 w-3 bg-neutral-300 ring-2 ring-[#f5f5f7] group-hover/item:bg-[#0071e3]'
                  }`}
                />
              </a>
              <div className="pointer-events-none invisible absolute right-full top-1/2 z-30 -translate-y-1/2 pr-2 opacity-0 transition-opacity duration-150 group-hover/item:pointer-events-auto group-hover/item:visible group-hover/item:opacity-100 group-focus-within/item:pointer-events-auto group-focus-within/item:visible group-focus-within/item:opacity-100">
                <div className="w-max max-w-[300px] rounded-xl bg-neutral-900 px-3.5 py-2.5 font-sans text-white shadow-xl">
                  <a href={`#${group.id}`} onClick={(event) => go(event, group.id)} className="block text-sm font-bold leading-snug hover:underline">
                    {group.title}
                  </a>
                  {group.items?.length ? (
                    <ul className="mt-1.5 space-y-1 border-l border-white/25 pl-2.5">
                      {group.items.map((item) => (
                        <li key={item.id}>
                          <a href={`#${item.id}`} onClick={(event) => go(event, item.id)} className="text-[13px] leading-snug text-white/75 hover:text-white hover:underline">
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
