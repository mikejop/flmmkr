'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __turnstileLoading?: Promise<void>;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileLoading) return window.__turnstileLoading;
  window.__turnstileLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('turnstile'));
    document.head.appendChild(s);
  });
  return window.__turnstileLoading;
}

/** Desafio anti-bot do Cloudflare. `resetKey` muda a cada tentativa para pedir um token novo (cada token vale uma vez). */
export default function TurnstileWidget({ onToken, resetKey }: { onToken: (token: string | null) => void; resetKey: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!SITE_KEY || !boxRef.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !boxRef.current || !window.turnstile) return;
        idRef.current = window.turnstile.render(boxRef.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: (t: string) => onTokenRef.current(t),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (idRef.current) window.turnstile?.remove(idRef.current);
      idRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey > 0 && idRef.current) {
      onTokenRef.current(null);
      window.turnstile?.reset(idRef.current);
    }
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return <div ref={boxRef} className="mb-4 flex justify-center" />;
}
