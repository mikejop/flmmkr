'use client';

import { useCallback, useEffect, useState } from 'react';

export interface AppliedCoupon {
  code: string;
  original: number;
  discount: number;
  final: number;
  percent: number;
}

export interface CouponController {
  coupon: AppliedCoupon | null;
  input: string;
  setInput: (value: string) => void;
  busy: boolean;
  error: string | null;
  apply: () => void;
  remove: () => void;
}

/** Só A-Z, 0-9, _ e -; tudo em maiúsculas; até 32 caracteres (mesma regra do servidor). */
export function sanitizeCouponInput(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

/**
 * Cupom de desconto no navegador. O servidor valida e calcula (o navegador só manda o código).
 * `priceKey` muda quando o preço do site muda (cronômetro acabou, nova fase): o desconto é recalculado no servidor.
 */
export function useCoupon(priceKey: string | number, readUrl = false): CouponController {
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [input, setInputState] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (code: string, silent: boolean) => {
    if (!silent) { setBusy(true); setError(null); }
    try {
      const res = await fetch('/api/checkout/coupon', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, productId: 'color-master-produto' }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.valid) {
        setCoupon({ code: data.code, original: data.original, discount: data.discount, final: data.final, percent: data.percent });
        setInputState('');
        setError(null);
      } else {
        setCoupon(null);
        setError(data?.error || 'O cupom que você digitou não existe.');
      }
    } catch {
      if (!silent) setError('Não foi possível validar o cupom agora. Tente de novo.');
    } finally {
      if (!silent) setBusy(false);
    }
  }, []);

  // Link de afiliado (?cupom=CODIGO): aplica o cupom sozinho quando readUrl fica true.
  useEffect(() => {
    if (!readUrl) return;
    const fromUrl = sanitizeCouponInput(new URLSearchParams(window.location.search).get('cupom') || '');
    if (fromUrl) void request(fromUrl, false);
  }, [readUrl, request]);

  const appliedCode = coupon?.code;
  useEffect(() => {
    if (appliedCode) void request(appliedCode, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceKey]);

  return {
    coupon,
    input,
    setInput: (value) => { setInputState(sanitizeCouponInput(value)); setError(null); },
    busy,
    error,
    apply: () => { if (input.trim()) void request(input.trim(), false); },
    remove: () => { setCoupon(null); setError(null); setInputState(''); },
  };
}
