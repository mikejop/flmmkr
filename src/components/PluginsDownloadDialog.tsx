'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { PLUGIN_DOWNLOADS, type PluginOs } from '@/config/plugins';
import { OS_ICON, detectOs } from '@/components/plugins/os';

const OS_LIST = Object.keys(PLUGIN_DOWNLOADS) as PluginOs[];

/** FLMMKR FX pela área de membros: o aluno escolhe o sistema e o download é registrado antes de começar. */
export function PluginsDownloadDialog({ onClose }: { onClose: () => void }) {
  const [detected, setDetected] = useState<PluginOs | null>(null);
  const [busy, setBusy] = useState<PluginOs | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setDetected(detectOs()); // eslint-disable-line react-hooks/set-state-in-effect -- navigator só existe no navegador
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const download = async (os: PluginOs) => {
    if (busy) return;
    setBusy(os);
    setMessage(null);
    try {
      const res = await fetch('/api/members/plugin-download', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ os }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.url !== 'string') throw new Error(data?.error || 'Não foi possível iniciar o download.');
      const a = document.createElement('a');
      a.href = data.url;
      a.rel = 'noopener noreferrer';
      a.download = data.filename || '';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMessage({ kind: 'ok', text: `Download do FLMMKR FX para ${PLUGIN_DOWNLOADS[os].label} iniciado. Acompanhe pelo seu navegador.` });
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Não foi possível iniciar o download.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog" aria-modal="true" aria-label="FLMMKR FX Plugins"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#16161a] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">FLMMKR FX Plugins</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-400">
              Plugins para DaVinci Resolve, <strong className="text-white">todos de graça</strong>. Um único pacote instala False Color, Skin e Social. Escolha o sistema do seu computador:
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="shrink-0 text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"><X size={18} /></button>
        </div>

        <div className="grid gap-2">
          {OS_LIST.map((os) => {
            const Icon = OS_ICON[os];
            const highlight = os === detected;
            return (
              <button
                key={os}
                type="button"
                disabled={busy !== null}
                onClick={() => download(os)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
                  highlight ? 'bg-[#0071e3] hover:bg-[#0077ed] border-[#0071e3] text-white' : 'bg-white/[0.04] hover:bg-white/10 border-white/10 text-white'
                }`}
              >
                {busy === os ? <Loader2 size={18} className="animate-spin" /> : <Icon className="h-[18px] w-[18px]" />}
                <span className="flex-1">Baixar para {PLUGIN_DOWNLOADS[os].label}</span>
                {highlight && <span className="text-[11px] font-medium text-white/80">Seu computador</span>}
              </button>
            );
          })}
        </div>

        {message && (
          <div role={message.kind === 'error' ? 'alert' : 'status'} className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${message.kind === 'error' ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-[#30d158]/15 border-[#30d158]/30 text-[#30d158]'}`}>
            {message.kind === 'error' ? <AlertCircle size={15} className="shrink-0" /> : <CheckCircle2 size={15} className="shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <p className="text-[11px] text-neutral-500">
          Passo a passo de instalação em{' '}
          <a href="/plugins#instalar" target="_blank" rel="noopener noreferrer" className="text-[#5aa9ff] hover:text-white">flmmkr.site/plugins</a>.
        </p>
      </div>
    </div>
  );
}
