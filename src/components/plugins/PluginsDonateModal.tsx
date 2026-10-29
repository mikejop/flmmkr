'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, CreditCard, Heart, QrCode } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';
import MarketingConsent from '@/components/plugins/MarketingConsent';
import { usePluginsI18n } from '@/components/plugins/i18n/context';
import type { PluginsDict } from '@/components/plugins/i18n/pt';
import { BR_STATES, maskPhone } from '@/utils/prisma2Lead';
import {
  amountError, formatBRL, maskCard, maskCep, maskEmail, maskCpfCnpj, maskExpiry, parseAmount, validateCard, validateDonor,
  DONATION_MIN, DONATION_PRESETS, type CardField, type DonorField,
} from '@/utils/donation';

const TURNSTILE_ON = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const POLL_MS = 5000;

type Method = 'pix' | 'card';
type Pix = { ref: string; image: string; payload: string; amount: number };
type AnyField = DonorField | CardField | 'amount';

const field =
  'w-full h-12 rounded-xl border border-[#d2d2d7] bg-white px-4 text-[17px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/20 aria-[invalid=true]:border-[#ff3b30] aria-[invalid=true]:focus:ring-[#ff3b30]/20';
const label = 'mb-1.5 block text-[13px] font-medium text-[#6e6e73]';
const sectionTitle = 'text-[15px] font-semibold text-[#1d1d1f]';

type LabelKey = { [K in keyof PluginsDict['donateModal']]: PluginsDict['donateModal'][K] extends string ? K : never }[keyof PluginsDict['donateModal']];

type FieldSpec<K extends string> = {
  key: K;
  label: LabelKey;
  span?: boolean;
  props: React.InputHTMLAttributes<HTMLInputElement>;
  mask?: (v: string) => string;
};

/** No cartão o Asaas exige telefone, CEP e número; no Pix eles são opcionais. */
const CARD_REQUIRED = new Set<DonorField>(['phone', 'postalCode', 'addressNumber']);

const DONOR_FIELDS: FieldSpec<Exclude<DonorField, 'state'>>[] = [
  { key: 'firstName', label: 'firstName', props: { autoComplete: 'given-name', maxLength: 60 } },
  { key: 'lastName', label: 'lastName', props: { autoComplete: 'family-name', maxLength: 80 } },
  { key: 'email', label: 'email', span: true, mask: maskEmail, props: { type: 'email', inputMode: 'email', autoComplete: 'email', maxLength: 254 } },
  { key: 'phone', label: 'phone', span: true, mask: maskPhone, props: { type: 'tel', inputMode: 'numeric', autoComplete: 'tel-national', placeholder: '(00) 00000-0000', maxLength: 15 } },
];

const ADDRESS_FIELDS: FieldSpec<Exclude<DonorField, 'state'>>[] = [
  { key: 'postalCode', label: 'postalCode', mask: maskCep, props: { inputMode: 'numeric', autoComplete: 'postal-code', placeholder: '00000-000', maxLength: 9 } },
  { key: 'addressNumber', label: 'addressNumber', props: { autoComplete: 'address-line2', maxLength: 10 } },
  { key: 'street', label: 'street', span: true, props: { autoComplete: 'address-line1', maxLength: 120 } },
  { key: 'city', label: 'city', props: { autoComplete: 'address-level2', maxLength: 80 } },
];

const CARD_FIELDS: FieldSpec<CardField>[] = [
  { key: 'number', label: 'cardNumber', span: true, mask: maskCard, props: { inputMode: 'numeric', autoComplete: 'cc-number', placeholder: '0000 0000 0000 0000', maxLength: 23 } },
  { key: 'holderName', label: 'holderName', span: true, props: { autoComplete: 'cc-name', maxLength: 100 } },
  { key: 'expiry', label: 'expiry', mask: maskExpiry, props: { inputMode: 'numeric', autoComplete: 'cc-exp', maxLength: 5 } },
  { key: 'ccv', label: 'cvv', mask: (v) => v.replace(/\D/g, '').slice(0, 4), props: { inputMode: 'numeric', autoComplete: 'cc-csc', placeholder: '123', maxLength: 4 } },
  { key: 'cpfCnpj', label: 'cpfCnpj', span: true, mask: maskCpfCnpj, props: { inputMode: 'numeric', maxLength: 18 } },
];

const EMPTY_DONOR: Record<DonorField, string> = { firstName: '', lastName: '', email: '', phone: '', postalCode: '', street: '', addressNumber: '', city: '', state: '' };
const EMPTY_CARD: Record<CardField, string> = { number: '', holderName: '', expiry: '', ccv: '', cpfCnpj: '' };

export default function PluginsDonateModal({ onClose }: { onClose: () => void }) {
  const { t: dict, locale } = usePluginsI18n();
  const t = dict.donateModal;
  /** Erro do campo no idioma da página; em português usa a mensagem que vem da validação. */
  const tr = (key: string, fallback?: string | null) => t.fieldErrors[key] ?? fallback ?? undefined;
  const placeholder = (key: string) => (key === 'addressNumber' ? t.addressNumberPh : key === 'expiry' ? t.expiryPh : undefined);
  const [amountText, setAmountText] = useState('25');
  const [method, setMethod] = useState<Method>('pix');
  const [donor, setDonor] = useState(EMPTY_DONOR);
  const [card, setCard] = useState(EMPTY_CARD);
  const [fieldError, setFieldError] = useState<Partial<Record<AnyField, string>>>({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [pix, setPix] = useState<Pix | null>(null);
  const [copied, setCopied] = useState(false);
  const [thanks, setThanks] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  const amount = parseAmount(amountText);
  const amountOk = Number.isFinite(amount) && !amountError(amount);

  useEffect(() => {
    amountRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Enquanto o QR Code está na tela, consulta se o Pix já caiu.
  useEffect(() => {
    if (!pix || thanks !== null) return;
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/plugins/donation?ref=${encodeURIComponent(pix.ref)}`, { cache: 'no-store' });
        const data = (await res.json()) as { paid?: boolean };
        if (data.paid) setThanks(pix.amount);
      } catch {}
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [pix, thanks]);

  const clearError = (key: AnyField) => {
    if (fieldError[key]) setFieldError((fe) => ({ ...fe, [key]: undefined }));
  };

  const changeAmount = (text: string) => {
    setAmountText(text);
    setPix(null); // o QR Code tem o valor embutido: mudou o valor, gera outro
    clearError('amount');
  };

  /** CEP completo: preenche rua, cidade e estado (só os campos ainda vazios). */
  const lookupCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`/api/cep?cep=${digits}`);
      const data = (await res.json()) as { success?: boolean; street?: string; city?: string; state?: string };
      if (!data.success) return;
      setDonor((d) => ({ ...d, street: d.street || data.street || '', city: d.city || data.city || '', state: d.state || data.state || '' }));
    } catch {}
  };

  const setDonorField = (key: DonorField, raw: string, mask?: (v: string) => string) => {
    const value = mask ? mask(raw) : raw;
    setDonor((d) => ({ ...d, [key]: value }));
    clearError(key);
    if (key === 'postalCode') void lookupCep(value);
  };

  const focusField = (key: AnyField) => document.getElementById(`dn-${key}`)?.focus();

  /** Valida valor e dados de quem doa. No cartão, telefone, CEP e número passam a ser obrigatórios. */
  const checkCommon = (forCard: boolean): boolean => {
    const problem = amountError(amount);
    if (problem) {
      setFieldError({ amount: tr('amount', problem) });
      focusField('amount');
      return false;
    }
    const checked = validateDonor(donor, forCard);
    if (!checked.ok) {
      setFieldError({ [checked.field]: tr(checked.field, checked.error) });
      focusField(checked.field);
      return false;
    }
    return true;
  };

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/plugins/donation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, amount, donor, marketingOptIn }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: string; field?: AnyField };
    return { res, data };
  };

  const generatePix = async () => {
    if (sending) return;
    setError('');
    if (!checkCommon(false)) return;
    setSending(true);
    try {
      const { res, data } = await post({ method: 'pix' });
      if (!res.ok || !data.ok) {
        if (res.status === 400 && data.field) {
          setFieldError({ [data.field]: tr(data.field, data.error) });
          focusField(data.field);
        } else setError((locale === 'pt' ? data.error : '') || t.pixError);
        return;
      }
      setPix({ ref: String(data.ref), image: String(data.image), payload: String(data.payload), amount: Number(data.amount) });
    } catch {
      setError(dict.errors.network);
    } finally {
      setSending(false);
    }
  };

  const payCard = async () => {
    if (sending) return;
    setError('');
    if (!checkCommon(true)) return;
    const checked = validateCard(card);
    if (!checked.ok) {
      setFieldError({ [checked.field]: tr(checked.field, checked.error) });
      focusField(checked.field);
      return;
    }
    if (TURNSTILE_ON && !turnstileToken) return setError(dict.errors.wait);
    setFieldError({});
    setSending(true);
    try {
      const { res, data } = await post({ method: 'card', card, turnstileToken });
      if (!res.ok || !data.ok) {
        if (res.status === 400 && data.field) {
          setFieldError({ [data.field]: tr(data.field, data.error) });
          focusField(data.field);
        } else setError((locale === 'pt' ? data.error : '') || t.cardError);
        setTurnstileReset((n) => n + 1);
        return;
      }
      setCard(EMPTY_CARD);
      setThanks(Number(data.amount));
    } catch {
      setError(dict.errors.network);
      setTurnstileReset((n) => n + 1);
    } finally {
      setSending(false);
    }
  };

  const copyPix = async () => {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const err = (f: AnyField) =>
    fieldError[f] ? <p id={`dn-${f}-err`} role="alert" className="mt-1.5 text-[13px] text-[#d70015]">{fieldError[f]}</p> : null;
  const inv = (f: AnyField) => ({ 'aria-invalid': fieldError[f] ? true : undefined, 'aria-describedby': fieldError[f] ? `dn-${f}-err` : undefined });

  /** Rótulo com "(opcional)" quando o campo não é exigido na forma de pagamento escolhida. */
  const donorLabel = (f: FieldSpec<DonorField>, inAddress: boolean) => {
    const required = f.key === 'firstName' || f.key === 'lastName' || f.key === 'email' || (method === 'card' && CARD_REQUIRED.has(f.key));
    // No Pix o título "Endereço (opcional)" já avisa: não repete em cada campo.
    if (required || (inAddress && method === 'pix')) return t[f.label];
    return <>{t[f.label]} <span className="font-normal text-[#86868b]">{t.optional}</span></>;
  };

  const renderDonorField = (f: FieldSpec<Exclude<DonorField, 'state'>>, inAddress = false) => (
    <div key={f.key} className={f.span ? 'col-span-2' : ''}>
      <label htmlFor={`dn-${f.key}`} className={label}>{donorLabel(f, inAddress)}</label>
      <input id={`dn-${f.key}`} className={field} value={donor[f.key]} onChange={(e) => setDonorField(f.key, e.target.value, f.mask)} {...f.props} placeholder={placeholder(f.key) ?? f.props.placeholder} {...inv(f.key)} />
      {err(f.key)}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="donate-modal-title">
      <button type="button" aria-label={dict.close} onClick={onClose} className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm" />
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-[#f5f5f7] p-6 shadow-2xl sm:max-w-[480px] sm:rounded-[28px] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.close}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#e8e8ed] text-[#6e6e73] transition hover:bg-[#d2d2d7]"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 1l10 10M11 1L1 11" /></svg>
        </button>

        {thanks !== null ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ff375f]/10 text-[#ff375f]">
              <Heart className="h-6 w-6" fill="currentColor" />
            </div>
            <h2 id="donate-modal-title" className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">{t.thanksTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-[17px] leading-snug text-[#6e6e73]">
              {t.thanksText(formatBRL(thanks))}
            </p>
            <button type="button" onClick={onClose} className="mt-6 h-12 rounded-full bg-[#0071e3] px-8 text-[17px] font-medium text-white transition hover:bg-[#0077ed]">
              {dict.close}
            </button>
          </div>
        ) : pix ? (
          <div className="text-center">
            <h2 id="donate-modal-title" className="pe-10 text-start text-[28px] font-semibold tracking-tight text-[#1d1d1f]">{t.pixTitle}</h2>
            <div className="mx-auto mt-6 w-fit rounded-2xl border border-[#e5e5e7] bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- imagem gerada pelo Asaas (data URI) */}
              <img src={`data:image/png;base64,${pix.image}`} alt={t.pixAlt(formatBRL(pix.amount))} width={208} height={208} className="h-52 w-52 [image-rendering:pixelated]" />
            </div>
            <p className="mt-3 text-[15px] text-[#1d1d1f]">
              {t.pixScanBefore} <strong>{formatBRL(pix.amount)}</strong>.
            </p>
            <button
              type="button"
              onClick={copyPix}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white text-[15px] font-medium text-[#1d1d1f] transition hover:bg-[#f5f5f7]"
            >
              {copied ? <Check className="h-4 w-4 text-[#248a3d]" /> : <Copy className="h-4 w-4" />}
              {copied ? t.pixCopied : t.pixCopy}
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-[13px] text-[#86868b]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#30d158]" />
              {t.pixWaiting}
            </p>
            <button type="button" onClick={() => setPix(null)} className="mt-4 text-[15px] text-[#0066cc] hover:underline">
              {t.pixChange}
            </button>
          </div>
        ) : (
          <>
            <h2 id="donate-modal-title" className="pe-10 text-[28px] font-semibold tracking-tight text-[#1d1d1f]">{t.title}</h2>
            <p className="mt-1 text-[15px] text-[#6e6e73]">{t.min(formatBRL(DONATION_MIN))}</p>
            {t.currencyNote && <p className="mt-1 text-[13px] text-[#86868b]">{t.currencyNote}</p>}

            {/* Valor */}
            <div className="mt-6">
              <label htmlFor="dn-amount" className={label}>{t.amount}</label>
              <div className="relative">
                <span dir="ltr" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[17px] text-[#86868b]">R$</span>
                <input
                  ref={amountRef}
                  id="dn-amount"
                  dir="ltr"
                  inputMode="decimal"
                  className={`${field} pl-12 text-[20px] font-semibold`}
                  value={amountText}
                  onChange={(e) => changeAmount(e.target.value.replace(/[^\d,.]/g, '').slice(0, 9))}
                  onBlur={() => amountText && amountError(amount) && setFieldError((fe) => ({ ...fe, amount: tr('amount', amountError(amount)) }))}
                  {...inv('amount')}
                />
              </div>
              {err('amount')}
              <div className="mt-2 grid grid-cols-4 gap-2">
                {DONATION_PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => changeAmount(String(v))}
                    aria-pressed={amount === v}
                    className={`h-10 rounded-xl border text-[15px] font-medium transition ${
                      amount === v ? 'border-[#0071e3] bg-[#0071e3]/10 text-[#0071e3]' : 'border-[#d2d2d7] bg-white text-[#1d1d1f] hover:border-[#86868b]'
                    }`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Dados de quem doa */}
            <div className="mt-7">
              <h3 className={sectionTitle}>{t.you}</h3>
              <div className="mt-3 grid grid-cols-2 gap-4">{DONOR_FIELDS.map((f) => renderDonorField(f))}</div>

              <h3 className={`${sectionTitle} mt-6`}>
                {t.address}{method === 'pix' && <span className="font-normal text-[#86868b]"> {t.optional}</span>}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4">
                {ADDRESS_FIELDS.map((f) => renderDonorField(f, true))}
                <div>
                  <label htmlFor="dn-state" className={label}>{t.state}{method === 'card' && <span className="font-normal text-[#86868b]"> {t.optional}</span>}</label>
                  <select
                    id="dn-state"
                    className={`${field} appearance-none`}
                    value={donor.state}
                    onChange={(e) => setDonorField('state', e.target.value)}
                    autoComplete="address-level1"
                    {...inv('state')}
                  >
                    <option value="">{t.select}</option>
                    {BR_STATES.map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  {err('state')}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <MarketingConsent id="dn-marketing" checked={marketingOptIn} onChange={setMarketingOptIn} />
            </div>

            {/* Forma de pagamento */}
            <div className="mt-7 grid grid-cols-2 gap-1 rounded-full bg-[#e8e8ed] p-1" role="tablist" aria-label={t.method}>
              {([['pix', t.pix, QrCode], ['card', t.card, CreditCard]] as const).map(([key, text, Icon]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={method === key}
                  onClick={() => { setMethod(key); setError(''); setFieldError({}); }}
                  className={`flex h-10 items-center justify-center gap-2 rounded-full text-[15px] font-medium transition ${
                    method === key ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {text}
                </button>
              ))}
            </div>

            {method === 'pix' ? (
              <div className="mt-5" role="tabpanel">
                <button
                  type="button"
                  onClick={generatePix}
                  disabled={sending}
                  className="h-12 w-full rounded-full bg-[#0071e3] text-[17px] font-medium text-white transition hover:bg-[#0077ed] disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? t.generating : t.generatePix(amountOk ? formatBRL(amount) : '')}
                </button>
              </div>
            ) : (
              <div className="mt-5" role="tabpanel">
                <div className="grid grid-cols-2 gap-4">
                  {CARD_FIELDS.map((f) => (
                    <div key={f.key} className={f.span ? 'col-span-2' : ''}>
                      <label htmlFor={`dn-${f.key}`} className={label}>{t[f.label]}</label>
                      <input
                        id={`dn-${f.key}`}
                        className={field}
                        value={card[f.key]}
                        onChange={(e) => {
                          const value = f.mask ? f.mask(e.target.value) : e.target.value;
                          setCard((c) => ({ ...c, [f.key]: value }));
                          clearError(f.key);
                        }}
                        {...f.props}
                        placeholder={placeholder(f.key) ?? f.props.placeholder}
                        {...inv(f.key)}
                      />
                      {err(f.key)}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-snug text-[#86868b]">
                  {t.cardNote}
                </p>
                <div className="mt-4">
                  <TurnstileWidget onToken={setTurnstileToken} resetKey={turnstileReset} />
                </div>
                <button
                  type="button"
                  onClick={payCard}
                  disabled={sending}
                  className="mt-4 h-12 w-full rounded-full bg-[#0071e3] text-[17px] font-medium text-white transition hover:bg-[#0077ed] disabled:cursor-wait disabled:opacity-60"
                >
                  {sending ? t.processing : t.pay(amountOk ? formatBRL(amount) : '')}
                </button>
              </div>
            )}

            {error && <p role="alert" className="mt-4 rounded-xl bg-[#ff3b30]/10 px-4 py-3 text-[15px] text-[#d70015]">{error}</p>}

            <p className="mt-5 text-center text-[12px] leading-snug text-[#86868b]">
              {t.footer}{' '}
              <a href="/plugins/termos" target="_blank" rel="noopener" className="text-[#0066cc] hover:underline">{dict.footer.terms}</a>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
