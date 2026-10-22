'use client';

import { useEffect, useState } from 'react';
import type { Dict } from '@/components/prisma2/i18n';

const PAGE_PATH = '/prisma2/download';
const REDIRECT_TO = '/color-master-produto';

/** Smartphone: Android com "Mobile" no navegador, iPhone/iPod. Tablets e computadores não entram. */
export function isSmartphone(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } };
  if (nav.userAgentData?.mobile === true) return true;
  return /iPhone|iPod|Android.+Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i.test(navigator.userAgent);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Reserva para navegadores sem a API (ou sem permissão): seleção + execCommand.
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function Prisma2MobileNotice({ t }: { t: Dict }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Fechar (com ou sem copiar) leva para a página do Color Master.
  const close = () => window.location.assign(REDIRECT_TO);

  const copy = async () => {
    const ok = await copyText(`${window.location.origin}${PAGE_PATH}`);
    if (!ok) return;
    setCopied(true);
    // Mostra "Link copiado" por um instante e segue para o Color Master (a mensagem fecha junto).
    setTimeout(close, 700);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="p2-mobile-title" aria-describedby="p2-mobile-text">
      <div className="w-full max-w-[380px] rounded-[28px] bg-[#f5f5f7] p-7 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
        </div>
        <h2 id="p2-mobile-title" className="text-[22px] font-semibold leading-tight tracking-tight text-[#1d1d1f]">{t.mobileTitle}</h2>
        <p id="p2-mobile-text" className="mt-3 text-[16px] leading-snug text-[#6e6e73]">{t.mobileText}</p>
        <button
          type="button"
          onClick={copy}
          disabled={copied}
          className="mt-6 h-12 w-full rounded-full bg-[#0071e3] text-[17px] font-medium text-white transition active:bg-[#006edb]"
        >
          {copied ? `✓ ${t.mobileCopied}` : t.mobileCopy}
        </button>
        <button
          type="button"
          onClick={close}
          className="mt-2 h-12 w-full rounded-full text-[17px] font-medium text-[#0066cc] transition active:bg-black/5"
        >
          {t.mobileClose}
        </button>
        <span className="sr-only" role="status" aria-live="polite">{copied ? t.mobileCopied : ''}</span>
      </div>
    </div>
  );
}
