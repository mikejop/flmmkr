'use client';

import React, { useId } from 'react';
import type { CouponController } from '@/hooks/useCoupon';

const money = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','));

/** Campo "Cupom de desconto": maiúsculas, mensagem de erro e resumo do cupom aplicado. `dark` = modal; `light` = seção de preços. */
export default function CouponBox({ ctl, variant, className = '' }: { ctl: CouponController; variant: 'dark' | 'light'; className?: string }) {
  const id = useId();
  const dark = variant === 'dark';

  if (ctl.coupon) {
    return (
      <div className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-[12px] ${dark ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-emerald-50 border-emerald-200'} ${className}`}>
        <span className={dark ? 'text-emerald-300' : 'text-emerald-700'}>
          Cupom <strong className="font-bold">{ctl.coupon.code}</strong> aplicado: <strong>−R$ {money(ctl.coupon.discount)}</strong>
        </span>
        <button type="button" onClick={ctl.remove} className={`underline underline-offset-2 cursor-pointer shrink-0 ${dark ? 'text-white/60 hover:text-white' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}>
          Remover
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-[12px] font-medium mb-1 ml-0.5 ${dark ? 'text-white/70' : 'text-[#6e6e73]'}`}>Cupom</label>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={ctl.input}
          onChange={(e) => ctl.setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ctl.apply(); } }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={32}
          aria-invalid={ctl.error ? true : undefined}
          placeholder="DIGITE SEU CUPOM"
          className={`flex-1 min-w-0 h-[40px] px-3.5 rounded-xl text-[13px] font-semibold tracking-wider uppercase focus:outline-none transition-all border ${
            dark
              ? 'bg-white/[0.06] border-white/12 text-white placeholder-white/25 focus:border-[#0071e3]'
              : 'bg-white border-[#d2d2d7] text-[#1d1d1f] placeholder-[#86868b] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15'
          }`}
        />
        <button
          type="button"
          onClick={ctl.apply}
          disabled={ctl.busy || !ctl.input.trim()}
          className={`h-[40px] px-4 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0 ${
            dark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-[#1d1d1f] hover:bg-black text-white'
          }`}
        >
          {ctl.busy ? 'Validando…' : 'Aplicar'}
        </button>
      </div>
      {ctl.error && <p role="alert" className="mt-1.5 ml-0.5 text-[12px] text-red-500">{ctl.error}</p>}
    </div>
  );
}
