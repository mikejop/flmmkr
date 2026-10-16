'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert, X } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { REFUND_METHOD_TEXT, REFUND_TIMING_TEXT } from '@/config/refundTexts';
import type { PurchaseView } from '@/components/account/PurchasesTab';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const REQUIRES_TURNSTILE = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Result = { status: 'processing' | 'review' | 'completed'; bankSlipRefundUrl?: string | null };

export function RefundDialog({ purchase, onClose, onDone }: { purchase: PurchaseView; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // 1) Reautenticação (senha, válida por 5 minutos)
      const reauth = await fetch('/api/account/reauth', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!reauth.ok) {
        const data = await reauth.json().catch(() => null);
        throw new Error(data?.error || 'Não foi possível confirmar sua senha.');
      }
      // 2) Pedido de reembolso (prazo e elegibilidade são conferidos no servidor)
      const res = await fetch('/api/account/refund', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: purchase.paymentId, reason: reason.trim() || undefined, turnstileToken: turnstileToken || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok && res.status !== 202) throw new Error(data?.error || 'Não foi possível solicitar o reembolso.');
      setResult({ status: data?.status === 'completed' ? 'completed' : data?.status === 'review' ? 'review' : 'processing', bankSlipRefundUrl: data?.bankSlipRefundUrl });
      setPassword('');
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
      <div className="w-full max-w-md bg-[#16161a] border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                  : 'Pedido de reembolso enviado. Seu acesso foi encerrado e o valor será devolvido pela forma de pagamento original.'}
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

            <div className="p-3 rounded-xl text-[11px] flex items-start gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>Ao confirmar, você <strong>perde o acesso ao conteúdo imediatamente</strong>. Essa ação não pode ser desfeita.</span>
            </div>

            <div className="space-y-1">
              <label htmlFor="refund-reason" className="text-xs text-neutral-400 font-medium">Motivo (opcional)</label>
              <textarea
                id="refund-reason" value={reason} onChange={(e) => setReason(e.target.value.slice(0, 500))} rows={3} maxLength={500}
                placeholder="Se quiser, conte o que aconteceu"
                className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors resize-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="refund-password" className="text-xs text-neutral-400 font-medium">Confirme sua senha</label>
              <input
                id="refund-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
                className="w-full bg-[#1e1e22] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3] transition-colors"
              />
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
                type="submit" disabled={busy || !password || (REQUIRES_TURNSTILE && !turnstileToken)}
                className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {busy ? <><Loader2 size={13} className="animate-spin" /> Enviando...</> : 'Confirmar reembolso'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
