'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, AlertCircle, ExternalLink, Receipt } from 'lucide-react';

export interface PurchaseView {
  paymentId: string;
  productName: string;
  purchasedAt: string | null;
  amount: number;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO' | 'OTHER';
  installments: number | null;
  status: 'active' | 'refunded' | 'refund_review' | 'refund_processing';
  refundDeadline: string | null;
  refundOpen: boolean;
  receiptUrl: string | null;
  bankSlipRefundUrl: string | null;
}

const BILLING_LABEL: Record<PurchaseView['billingType'], string> = {
  CREDIT_CARD: 'Cartão de crédito',
  PIX: 'Pix',
  BOLETO: 'Boleto',
  OTHER: 'Outro',
};

const STATUS_LABEL: Record<PurchaseView['status'], { text: string; className: string }> = {
  active: { text: 'Ativo', className: 'bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30' },
  refunded: { text: 'Reembolsado', className: 'bg-white/10 text-neutral-300 border-white/15' },
  refund_review: { text: 'Reembolso em análise', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  refund_processing: { text: 'Reembolso em processamento', className: 'bg-[#0071e3]/15 text-[#5aa9ff] border-[#0071e3]/30' },
};

const TZ = 'America/Sao_Paulo';
const dateFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
const dayMonthFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit' });
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Só formata o que o servidor mandou: o navegador não calcula prazo nem elegibilidade. */
export function refundDeadlineText(p: PurchaseView): string | null {
  if (!p.refundDeadline || p.status !== 'active') return null;
  const d = new Date(p.refundDeadline);
  return p.refundOpen
    ? `Você pode solicitar reembolso até ${dayMonthFmt.format(d)} às 23:59`
    : `Prazo de reembolso encerrado em ${dayMonthFmt.format(d)}`;
}

export function PurchasesTab({ renderActions }: { renderActions?: (p: PurchaseView, reload: () => void) => React.ReactNode }) {
  const [purchases, setPurchases] = useState<PurchaseView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/account/purchases', { cache: 'no-store', credentials: 'same-origin' });
      const data = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data?.purchases)) throw new Error('falha');
      setPurchases(data.purchases as PurchaseView[]);
      setError(null);
    } catch {
      setError('Não foi possível carregar suas compras agora. Tente novamente em instantes.');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-300">
        <AlertCircle size={15} /> <span>{error}</span>
      </div>
    );
  }
  if (!purchases) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-xs text-neutral-400">
        <Loader2 size={15} className="animate-spin text-[#0071e3]" /> Carregando suas compras...
      </div>
    );
  }
  if (purchases.length === 0) {
    return <p className="text-xs text-neutral-400 py-6 text-center">Nenhuma compra encontrada nesta conta.</p>;
  }

  return (
    <div className="space-y-3">
      {purchases.map((p) => {
        const status = STATUS_LABEL[p.status];
        const deadlineText = refundDeadlineText(p);
        return (
          <div key={p.paymentId} className="bg-white/5 border border-white/5 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{p.productName}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {p.purchasedAt ? dateFmt.format(new Date(p.purchasedAt)) : 'Data indisponível'}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full border ${status.className}`}>{status.text}</span>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <dt className="text-neutral-500">Valor</dt>
                <dd className="text-neutral-200 font-medium">{money.format(p.amount)}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Forma de pagamento</dt>
                <dd className="text-neutral-200 font-medium">
                  {BILLING_LABEL[p.billingType]}
                  {p.installments && p.installments > 1 ? ` em ${p.installments}x` : ''}
                </dd>
              </div>
            </dl>

            {deadlineText && (
              <p className={`text-[11px] ${p.refundOpen ? 'text-[#5aa9ff]' : 'text-neutral-400'}`}>{deadlineText}</p>
            )}

            {p.status === 'refund_processing' && (
              <p className="text-[11px] text-neutral-400">Seu reembolso está sendo processado. Você será avisado quando for concluído.</p>
            )}
            {p.bankSlipRefundUrl && p.status !== 'refunded' && (
              <a href={p.bankSlipRefundUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-[#5aa9ff] hover:text-white">
                Informar dados bancários para receber o reembolso <ExternalLink size={11} />
              </a>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              {p.receiptUrl ? (
                <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-neutral-300 hover:text-white transition-colors">
                  <Receipt size={12} /> Ver comprovante
                </a>
              ) : <span />}
              {renderActions?.(p, load)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
