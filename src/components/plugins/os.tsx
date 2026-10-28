import type { PluginOs } from '@/config/plugins';

type Nav = Navigator & { userAgentData?: { platform?: string; mobile?: boolean } };

/** Celular ou tablet: os plugins são só para computador. */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Nav;
  const ua = nav.userAgent || '';
  if (nav.userAgentData?.mobile || /Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  // iPad no modo desktop se apresenta como Mac, mas tem tela de toque.
  return /Macintosh/i.test(ua) && nav.maxTouchPoints > 1;
}

/** Detecta o sistema do computador. Celular, tablet ou sistema desconhecido devolvem null. */
export function detectOs(): PluginOs | null {
  if (typeof navigator === 'undefined' || isMobileDevice()) return null;
  const nav = navigator as Nav;
  const ua = nav.userAgent || '';
  const platform = `${nav.userAgentData?.platform || ''} ${nav.platform || ''} ${ua}`;
  if (/Mac/i.test(platform)) return 'macos';
  if (/Win/i.test(platform)) return 'windows';
  if (/Linux|X11|CrOS/i.test(platform)) return 'linux';
  return null;
}

export function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.59 1.1 8.74.73 1.05 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.5ZM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.56-1.22Z" />
    </svg>
  );
}

export function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M3 5.5 10.5 4.4v7.1H3V5.5Zm8.5-1.25L21 3v8.5h-9.5V4.25ZM3 12.5h7.5v7.1L3 18.5v-6Zm8.5 0H21V21l-9.5-1.3v-7.2Z" />
    </svg>
  );
}

export function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2c-2.2 0-3.6 1.8-3.6 4.4 0 1.2.2 2-.5 3.3-.8 1.4-2.6 3.4-2.9 6.1-.1 1 .2 1.8.7 2.3-.7.4-1.4.8-1.3 1.6.1 1 1.8 1 3.2 1.6 1.2.5 2.2.9 3 .2.4-.3.8-.4 1.4-.4s1 .1 1.4.4c.8.7 1.8.3 3-.2 1.4-.6 3.1-.6 3.2-1.6.1-.8-.6-1.2-1.3-1.6.5-.5.8-1.3.7-2.3-.3-2.7-2.1-4.7-2.9-6.1-.7-1.3-.5-2.1-.5-3.3C15.6 3.8 14.2 2 12 2Zm-1.4 3.6c.5 0 .8.6.8 1.2s-.3 1.1-.8 1.1-.8-.5-.8-1.1.3-1.2.8-1.2Zm2.8 0c.5 0 .8.6.8 1.2s-.3 1.1-.8 1.1-.8-.5-.8-1.1.3-1.2.8-1.2ZM12 8.6c.9 0 2 .5 2 .9s-1.1 1.1-2 1.1-2-.7-2-1.1.9-.9 2-.9Zm0 3.2c1.7 0 3 1.9 3 4.5 0 1.3-.4 2.2-1 2.7-.6-.3-1.3-.4-2-.4s-1.4.1-2 .4c-.6-.5-1-1.4-1-2.7 0-2.6 1.3-4.5 3-4.5Z" />
    </svg>
  );
}

export const OS_ICON: Record<PluginOs, (p: { className?: string }) => React.ReactElement> = {
  macos: AppleIcon,
  windows: WindowsIcon,
  linux: LinuxIcon,
};
