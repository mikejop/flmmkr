'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert, X } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { REFUND_METHOD_TEXT, REFUND_TIMING_TEXT } from '@/config/refundTexts';
import { REFUND_REASONS, type RefundReasonCode } from '@/config/refundReasons';
import type { PurchaseView } from '@/components/account/PurchasesTab';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const REQUIRES_TURNSTILE = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SUPPORT_WHATSAPP_URL = `https://wa.me/5511994822209?text=${encodeURIComponent('Olá! Tive um problema ao pedir o reembolso.')}`;

type Result = { status: 'processing' | 'review' | 'completed'; bankSlipRefundUrl?: string | null };

/** Reembolso na hora: o aluno marca os motivos (sem escrever nada) e confirma. Sem senha, sem etapas extras. */
export function RefundDialog({ purchase, onClose, onDone }: { purchase: PurchaseView; onClose: () => void; onDone: () => void }) {
  const [reasons, setReasons] = useState<RefundReasonCode[]>([]);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const toggle = (code: RefundReasonCode) =>
    setReasons((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (reasons.length === 0) { setError('Marque pelo menos um motivo para continuar.'); return; }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/account/refund', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: purchase.paymentId, reasons, turnstileToken: turnstileToken || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok && res.status !== 202) throw new Error(data?.error || 'Não foi possível solicitar o reembolso.');
      setResult({ status: data?.status === 'completed' ? 'completed' : data?.status === 'review' ? 'review' : 'processing', bankSlipRefundUrl: data?.bankSlipRefundUrl });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível solicitar o reembolso.');
      setTurnstileReset((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Solicitar reembolso">
      <div className="w-full max-w-lg bg-[#16161a] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Solicitar reembolso</h3>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"><X size={18} /></button>
        </div>

        {result ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl text-xs flex items-start gap-2 bg-[#30d158]/15 border border-[#30d158]/30 text-[#30d158]">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>
                {result.status === 'review'
                  ? 'Recebemos seu pedido. Nossa equipe vai concluir o reembolso manualmente e avisar você por e-mail.'
                  : 'Reembolso solicitado. Seu acesso foi encerrado e o valor será devolvido pela forma de pagamento original.'}
              </span>
            </div>
            {result.bankSlipRefundUrl && (
              <a href={result.bankSlipRefundUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#5aa9ff] hover:text-white">
                Informe seus dados bancários para receber o valor
              </a>
            )}
            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer transition-all">Fechar</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-[11px] space-y-1.5 text-neutral-300">
              <p><span className="text-neutral-500">Valor a devolver:</span> <strong className="text-white">{money.format(purchase.amount)}</strong></p>
              <p><span className="text-neutral-500">Como você recebe:</span> {REFUND_METHOD_TEXT[purchase.billingType]}</p>
              <p><span className="text-neutral-500">Prazo estimado:</span> {REFUND_TIMING_TEXT[purchase.billingType]}</p>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-white mb-1">Por que você quer o reembolso? <span className="font-normal text-neutral-400">(marque um ou mais)</span></legend>
              <div className="grid gap-1.5">
                {REFUND_REASONS.map((r) => {
                  const checked = reasons.includes(r.code);
                  return (
                    <label key={r.code} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border cursor-pointer select-none transition-colors text-[12px] leading-snug ${checked ? 'bg-[#0071e3]/15 border-[#0071e3]/50 text-white' : 'bg-white/[0.03] border-white/10 text-neutral-300 hover:border-white/25'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(r.code)} className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#0071e3] focus:ring-[#0071e3] focus:ring-offset-0 bg-white/10 cursor-pointer shrink-0" />
                      <span>{r.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="p-3 rounded-xl text-[11px] flex items-start gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>Ao confirmar, você <strong>perde o acesso ao conteúdo imediatamente</strong>. Essa ação não pode ser desfeita.</span>
            </div>

            <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />

            {error && (
              <div role="alert" className="p-3 rounded-xl text-xs flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300">
                <AlertCircle size={15} className="shrink-0" /> <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancelar</button>
              <button
                type="submit" disabled={busy || reasons.length === 0 || (REQUIRES_TURNSTILE && !turnstileToken)}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {busy ? <><Loader2 size={13} className="animate-spin" /> Reembolsando...</> : 'Confirmar reembolso'}
              </button>
            </div>
          </form>
        )}

        <a
          href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/15 transition-colors"
        >
          <svg viewBox="0 0 32 32" aria-hidden="true" className="w-9 h-9 shrink-0 rounded-full bg-[#25D366] p-1.5 text-white fill-current">
            <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.94 12.94 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.8c-1.95 0-3.86-.52-5.53-1.51l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.77 10.77 0 0 1 5.2 16c0-5.97 4.86-10.83 10.84-10.83 5.97 0 10.8 4.86 10.8 10.83 0 5.98-4.84 10.8-10.8 10.8Zm5.93-8.1c-.33-.16-1.93-.95-2.23-1.06-.3-.1-.52-.16-.73.17-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.38-.51-2.62-1.62-.97-.86-1.62-1.93-1.81-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.32.33-.54.1-.22.05-.4-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.4-.3.33-1.14 1.12-1.14 2.72 0 1.6 1.17 3.15 1.33 3.37.16.22 2.3 3.5 5.56 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.42.19-1.55-.08-.14-.3-.22-.62-.38Z" />
          </svg>
          <span className="text-[11px] leading-snug text-neutral-300">
            Deu algum problema ao pedir o reembolso? Fale com a gente no WhatsApp{' '}
            <strong className="text-white whitespace-nowrap">+55 (11) 99482-2209</strong>
          </span>
        </a>
      </div>
    </div>
  );
}
