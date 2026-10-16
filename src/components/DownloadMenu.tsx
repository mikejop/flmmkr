'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Download, FolderArchive, Loader2, AlertCircle, X } from 'lucide-react';

const ITEMS = [{ id: 'projeto', label: 'Projeto', hint: 'Arquivo do DaVinci Resolve (.zip)' }] as const;

const TIP_MAX_VISITS = 3;
const TIP_SHOW_DELAY_MS = 1800;
const TIP_AUTO_HIDE_MS = 5000;

/**
 * Conta as visitas à plataforma neste aparelho (1 por sessão do navegador, não por recarregamento).
 * Devolve true enquanto ainda estiver nas 3 primeiras e o aluno não tiver usado o botão.
 */
function shouldShowTip(userId: string): boolean {
  try {
    const key = `flmmkr_dl_tip_${userId}`;
    const raw = JSON.parse(localStorage.getItem(key) || '{}') as { visits?: number; done?: boolean };
    if (raw.done) return false;
    const countedKey = `${key}_counted`;
    let visits = Number(raw.visits) || 0;
    if (!sessionStorage.getItem(countedKey)) {
      visits += 1;
      sessionStorage.setItem(countedKey, '1');
      localStorage.setItem(key, JSON.stringify({ visits, done: false }));
    }
    return visits <= TIP_MAX_VISITS;
  } catch {
    return false;
  }
}

function markTipDone(userId: string) {
  try { localStorage.setItem(`flmmkr_dl_tip_${userId}`, JSON.stringify({ visits: TIP_MAX_VISITS + 1, done: true })); } catch { /* sem storage: só não lembra */ }
}

/** Botão de download do material de apoio. O arquivo baixa direto, sem abrir nova página. */
export default function DownloadMenu({ userId }: { userId?: string | null }) {
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    if (panelRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(panelRef.current, { opacity: 0, y: -6, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'power3.out', transformOrigin: 'top right', clearProps: 'transform' });
    }
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Dica nos 3 primeiros acessos: aparece depois de um instante e some sozinha.
  useEffect(() => {
    if (!userId || !shouldShowTip(userId)) return;
    const show = setTimeout(() => setShowTip(true), TIP_SHOW_DELAY_MS);
    const hide = setTimeout(() => setShowTip(false), TIP_SHOW_DELAY_MS + TIP_AUTO_HIDE_MS);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [userId]);

  useEffect(() => {
    if (!showTip || !tipRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(tipRef.current, { opacity: 0, y: -8, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out', transformOrigin: 'top right', clearProps: 'transform' });
  }, [showTip]);

  const dismissTip = () => {
    setShowTip(false);
    if (userId) markTipDone(userId);
  };

  const download = async (id: string) => {
    if (busy) return;
    setBusy(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/members/download?item=${encodeURIComponent(id)}`, { cache: 'no-store', credentials: 'same-origin' });
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.url !== 'string') throw new Error(data?.error || 'Não foi possível iniciar o download.');
      // A URL assinada responde com "attachment": o navegador baixa o arquivo sem sair desta página.
      const a = document.createElement('a');
      a.href = data.url;
      a.rel = 'noopener noreferrer';
      a.download = data.filename || '';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (userId) markTipDone(userId); // quem já baixou não precisa mais da dica
      setMessage({ kind: 'ok', text: 'Download iniciado. Acompanhe pelo seu navegador.' });
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Não foi possível iniciar o download.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setMessage(null); if (showTip) dismissTip(); }}
        aria-label="Material de apoio para download"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Material de apoio"
        className="flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full p-2.5 cursor-pointer backdrop-blur-md shadow-xs transition-colors"
      >
        <Download size={15} className="text-[#a1a1a6]" aria-hidden="true" />
      </button>

      {showTip && !open && (
        <div
          ref={tipRef}
          role="status"
          aria-live="polite"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[250px] rounded-2xl bg-[#16161a]/95 backdrop-blur-xl border border-[#0071e3]/40 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7),0_0_24px_rgba(0,113,227,0.25)] p-3.5 text-white select-none"
        >
          {/* seta apontando para o botão */}
          <span aria-hidden="true" className="absolute -top-[6px] right-[14px] w-3 h-3 rotate-45 bg-[#16161a] border-l border-t border-[#0071e3]/40" />
          <div className="flex items-start gap-2">
            <p className="text-[13px] leading-snug font-medium text-white/90 flex-1">
              Para baixar o projeto utilizado na masterclass, é só clicar no botão de download.
            </p>
            <button type="button" onClick={dismissTip} aria-label="Fechar dica" className="shrink-0 -mt-0.5 -mr-1 p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Material de apoio"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl bg-[#16161a]/95 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2"
        >
          <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#a1a1a6]">Material de apoio</p>
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              disabled={busy !== null}
              onClick={() => download(item.id)}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left text-[13px] text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <span className="shrink-0 w-8 h-8 rounded-lg bg-[#0071e3]/20 text-[#5aa9ff] flex items-center justify-center">
                {busy === item.id ? <Loader2 size={15} className="animate-spin" /> : <FolderArchive size={15} />}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{item.label}</span>
                <span className="block text-[11px] text-[#a1a1a6] truncate">{item.hint}</span>
              </span>
            </button>
          ))}
          {message && (
            <p role={message.kind === 'error' ? 'alert' : 'status'} className={`mx-1 mt-1.5 mb-0.5 flex items-start gap-1.5 text-[11px] leading-snug ${message.kind === 'error' ? 'text-red-300' : 'text-[#30d158]'}`}>
              {message.kind === 'error' && <AlertCircle size={12} className="shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
