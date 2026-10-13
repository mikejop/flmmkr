/** Rolagem animada com aceleração e desaceleração quadráticas (ease-in-out quad). */
const activeAnimations = new WeakMap<HTMLElement, number>();

const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function smoothScrollTo(container: HTMLElement, top: number) {
  const previous = activeAnimations.get(container);
  if (previous) cancelAnimationFrame(previous);

  const start = container.scrollTop;
  const maxTop = container.scrollHeight - container.clientHeight;
  const target = Math.max(0, Math.min(top, maxTop));
  const distance = target - start;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || Math.abs(distance) < 2) {
    container.scrollTop = target;
    return;
  }

  const duration = Math.min(1000, Math.max(350, Math.abs(distance) * 0.35));
  const startedAt = performance.now();

  const stop = () => {
    const id = activeAnimations.get(container);
    if (id) cancelAnimationFrame(id);
    activeAnimations.delete(container);
    container.removeEventListener('wheel', stop);
    container.removeEventListener('touchstart', stop);
    container.removeEventListener('keydown', stop);
  };

  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    container.scrollTop = start + distance * easeInOutQuad(progress);
    if (progress < 1) activeAnimations.set(container, requestAnimationFrame(step));
    else stop();
  };

  // Se a pessoa rolar por conta própria durante a animação, a animação para.
  container.addEventListener('wheel', stop, { passive: true });
  container.addEventListener('touchstart', stop, { passive: true });
  container.addEventListener('keydown', stop);
  activeAnimations.set(container, requestAnimationFrame(step));
}

/** Rola o container até o elemento com o id dado (com margem no topo). */
export function smoothScrollToId(container: HTMLElement, id: string, offset = 16): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - offset;
  smoothScrollTo(container, top);
  return true;
}
